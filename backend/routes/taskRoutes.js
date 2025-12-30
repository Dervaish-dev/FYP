import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import { computeNextDueTime, resetSteps, shouldCreateNextOccurrence } from "../utils/taskRecurrence.js";

const router = express.Router();

// Fail fast if database is not connected so the frontend doesn't silently degrade.
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Task module requires MongoDB.'
    });
  }
  next();
});

// Task model imported from ../models/Task.js

// POST /api/tasks/create - Create a new task
router.post("/create", async (req, res) => {
  try {
    const { 
      userId, 
      title, 
      description, 
      category,
      priority, 
      dueTime, 
      repeat, 
      customInterval,
      steps
    } = req.body;

    // Validate required fields
    if (!userId || !title || !dueTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, dueTime'
      });
    }

    // Create new task
    const task = new Task({
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      category: (category || 'General').trim(),
      priority: priority || 'medium',
      dueTime: new Date(dueTime),
      repeat: repeat || 'once',
      customInterval: customInterval || null,
      steps: resetSteps(steps)
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// GET /api/tasks/:userId - Get all tasks for user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, priority } = req.query;

    // Build query
    const query = { userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Get tasks - use lean() for read-only performance boost
    const tasks = await Task
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Group tasks by status
    const groupedTasks = {
      todo: tasks.filter(task => task.status === 'todo'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      done: tasks.filter(task => task.status === 'done')
    };

    res.json({
      success: true,
      data: {
        tasks,
        groupedTasks,
        total: tasks.length
      }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await Task.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    // If marking as done, set completedAt
    if (updateData.status === 'done' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    if (updateData.steps !== undefined) {
      // Allow updating steps, but normalize
      updateData.steps = Array.isArray(updateData.steps)
        ? updateData.steps.map((s) => ({
            id: String(s?.id || ''),
            text: String(s?.text || '').trim(),
            done: Boolean(s?.done)
          })).filter((s) => s.id && s.text)
        : [];
    }

    const shouldCreateNext = shouldCreateNextOccurrence(existing, updateData);

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    let nextTask = null;
    if (shouldCreateNext) {
      const repeat = updateData.repeat ?? existing.repeat;
      const customIntervalDays = updateData.customInterval ?? existing.customInterval;
      const nextDue = computeNextDueTime(task.dueTime, repeat, customIntervalDays);

      if (nextDue) {
        nextTask = await Task.create({
          userId: task.userId,
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: 'todo',
          dueTime: nextDue,
          repeat: task.repeat,
          customInterval: task.customInterval,
          steps: resetSteps(task.steps),
          parentTaskId: task.parentTaskId || task._id,
          occurrenceIndex: (task.occurrenceIndex || 0) + 1,
          completedAt: null,
          isNudged: false,
          nudgeCount: 0
        });
      }
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
      nextTask
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

// GET /api/tasks/:userId/due - Get tasks due soon (for nudging)
router.get("/:userId/due", async (req, res) => {
  try {
    const { userId } = req.params;
    const { minutes = 30 } = req.query;

    const now = new Date();
    const dueSoon = new Date(now.getTime() + parseInt(minutes) * 60 * 1000);

    // Get tasks due soon that aren't completed
    const dueTasks = await Task.find({
      userId,
      dueTime: { $lte: dueSoon },
      status: { $ne: 'done' }
    }).sort({ dueTime: 1 });

    res.json({
      success: true,
      data: dueTasks
    });

  } catch (error) {
    console.error('Error fetching due tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch due tasks',
      error: error.message
    });
  }
});

// PUT /api/tasks/:id/nudge - Mark task as nudged
router.put("/:id/nudge", async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndUpdate(
      id,
      { 
        isNudged: true,
        $inc: { nudgeCount: 1 }
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task nudged successfully',
      data: task
    });

  } catch (error) {
    console.error('Error nudging task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to nudge task',
      error: error.message
    });
  }
});

export default router;
