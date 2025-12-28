import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trash2,
  Bell,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  X
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../context/ThemeContext';
import { useNotifications, NOTIFICATION_TYPES } from '../components/NotificationCenter';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';

// Task Card Component
const TaskCard = React.memo(({ task, onUpdate, onDelete, onNudge, isUpdating }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id || task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const isOverdue = new Date(task.dueTime) < new Date() && task.status !== 'done';
  const isDueSoon = new Date(task.dueTime) <= new Date(Date.now() + 30 * 60 * 1000) && task.status !== 'done';

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--theme-card)',
        borderColor: 'var(--theme-border)',
        border: isOverdue ? '2px solid #ef4444' : '1px solid var(--theme-border)',
        opacity: isUpdating ? 0.6 : 1,
        pointerEvents: isUpdating ? 'none' : 'auto'
      }}
      {...attributes}
      {...listeners}
      className="p-4 mb-3 rounded-lg cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(task.status)}
            <h3 className="font-semibold" style={{ color: 'var(--theme-text)' }}>
              {task.title}
            </h3>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
          </div>

          {task.description && (
            <p className="text-sm opacity-70 mb-2" style={{ color: 'var(--theme-text)' }}>
              {task.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span
                className={isOverdue ? 'text-red-500 font-medium' : isDueSoon ? 'text-orange-500 font-medium' : ''}
                style={{ color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : 'var(--theme-text)' }}
              >
                {new Date(task.dueTime).toLocaleDateString()} {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {task.repeat !== 'once' && (
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span style={{ color: 'var(--theme-text)' }}>{task.repeat}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {task.status !== 'done' && (
            <button
              onClick={() => onNudge(task._id || task.id)}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--theme-text)' }}
              title="Send reminder"
            >
              <Bell className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => onUpdate(task._id || task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--theme-text)' }}
            title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as done'}
          >
            {task.status === 'done' ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => onDelete(task._id || task.id)}
            className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOverdue && (
        <motion.div
          className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center space-x-1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle className="h-3 w-3" />
          <span>Overdue!</span>
        </motion.div>
      )}
    </motion.div>
  );
});

// Task Column Component
const TaskColumn = React.memo(({ title, tasks, status, onTaskUpdate, onTaskDelete, onTaskNudge, updatingTaskId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
          <span>{title}</span>
          <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-text)' }}>
            {tasks.length}
          </span>
        </h2>
      </div>

      <motion.div
        ref={setNodeRef}
        className="space-y-3 min-h-96 p-4 rounded-lg transition-all duration-300"
        animate={{
          backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          borderColor: isOver ? 'var(--theme-primary)' : 'transparent',
          borderWidth: isOver ? '2px' : '0px',
          borderStyle: isOver ? 'dashed' : 'solid',
          scale: isOver ? 1.02 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{
          borderColor: 'var(--theme-primary)',
        }}
      >
        <SortableContext items={tasks.map(task => task._id || task.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task._id || task.id}
                task={task}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
                onNudge={onTaskNudge}
                isUpdating={updatingTaskId === (task._id || task.id)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && (
          <motion.div
            className="text-center py-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tasks in {title.toLowerCase()}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});

// Main Tasks Component
const Tasks = () => {
  const { currentTheme } = useTheme();
  const { addNotification } = useNotifications();
  const { user } = useAuth(); // Use real authenticated user
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueTime: '',
    repeat: 'once'
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const fetchedTasks = await taskAPI.listByUser(user.id);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  // Removed localStorage sync


  // Task notification system
  useEffect(() => {
    const checkTaskNotifications = () => {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      tasks.forEach(task => {
        const dueTime = new Date(task.dueTime);

        // Task due in 5 minutes
        if (dueTime <= fiveMinutesFromNow && dueTime > now && task.status !== 'done') {
          addNotification(
            `⏰ "${task.title}" is due soon! Time to focus! 🎯`,
            NOTIFICATION_TYPES.REMINDER,
            '⏰'
          );
        }

        // Task overdue by 10 minutes
        if (dueTime <= tenMinutesAgo && task.status !== 'done') {
          addNotification(
            `🚨 "${task.title}" is overdue! No worries, let's tackle it now! 💪`,
            NOTIFICATION_TYPES.REMINDER,
            '🚨'
          );
        }
      });
    };

    // Check for notifications every minute
    const interval = setInterval(checkTaskNotifications, 60000);

    // Initial check
    checkTaskNotifications();

    return () => clearInterval(interval);
  }, [tasks, addNotification]);

  const handleCreateTask = useCallback(async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    // Validate due date is not in the past
    if (newTask.dueTime) {
      const selectedDate = new Date(newTask.dueTime);
      const now = new Date();
      if (selectedDate < now) {
        toast.error('Due date cannot be in the past');
        return;
      }
    }

    if (isCreating) return;
    setIsCreating(true);

    try {
      const taskData = {
        userId: user.id,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        status: 'todo',
        dueTime: newTask.dueTime ? new Date(newTask.dueTime).toISOString() : null,
        repeat: newTask.repeat,
      };

      const createdTask = await taskAPI.create(taskData);

      setTasks(prev => [createdTask, ...prev]);

      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueTime: '',
        repeat: 'once'
      });

      setShowCreateModal(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  }, [newTask, isCreating, user?.id]);

  const handleTaskUpdate = useCallback(async (taskId, updateData) => {
    const previousTask = tasks.find(task => task._id === taskId || task.id === taskId);
    const wasCompleted = previousTask?.status === 'done';

    try {
      setUpdatingTaskId(taskId);

      // Call API first (no optimistic update)
      const { task: updatedTask, nextTask } = await taskAPI.update(taskId, updateData);

      // Apply server-confirmed task update locally (prevents flicker and "revert" feel)
      if (updatedTask) {
        setTasks((prev) => {
          const updatedId = String(updatedTask._id || updatedTask.id || taskId);
          let next = prev.map((t) => {
            const id = String(t._id || t.id || '');
            return id === updatedId ? { ...t, ...updatedTask } : t;
          });

          // If backend created the next occurrence for recurring tasks, add it to the list
          if (nextTask) {
            const nextId = String(nextTask._id || nextTask.id || '');
            if (nextId && !next.some((t) => String(t._id || t.id || '') === nextId)) {
              next = [nextTask, ...next];
            }
          }

          return next;
        });
      }

      // Show success notification
      if (updateData.status === 'done' && !wasCompleted) {
        if (previousTask?.repeat && previousTask.repeat !== 'once') {
          toast.info('Recurring task completed — next occurrence scheduled.');
        }
        addNotification(
          `🎉 "${previousTask?.title}" completed! You're on fire! 🔥`,
          NOTIFICATION_TYPES.CELEBRATION,
          '🎉'
        );
        toast.success('Task completed! Great job!');
      } else if (updateData.status !== 'done' && wasCompleted) {
        toast.success('Task marked as incomplete');
      } else {
        toast.success('Task updated!');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  }, [tasks, addNotification, user]);

  const handleTaskDelete = useCallback(async (taskId) => {
    const task = tasks.find(t => t._id === taskId || t.id === taskId);
    // Show confirmation modal instead of window.confirm
    setDeleteConfirmModal({
      isOpen: true,
      taskId,
      taskTitle: task?.title || 'Task'
    });
  }, [tasks]);

  const confirmDeleteTask = useCallback(async () => {
    const taskId = deleteConfirmModal.taskId;
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(prev => prev.filter(task => task._id !== taskId && task.id !== taskId));

      await taskAPI.delete(taskId);
      toast.success('Task deleted');
      setDeleteConfirmModal({ isOpen: false, taskId: null, taskTitle: '' });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      setTasks(previousTasks); // Revert
    }
  }, [deleteConfirmModal, tasks]);

  const handleTaskNudge = useCallback(async (taskId) => {
    try {
      // Optimistic update for UI feedback
      setTasks(prev => prev.map(task =>
        (task._id === taskId || task.id === taskId) ? { ...task, nudgeCount: (task.nudgeCount || 0) + 1 } : task
      ));

      await taskAPI.nudge(taskId);

      toast.info('Reminder sent! 🔔');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find(task => task._id === active.id || task.id === active.id);
    if (!activeTask) return;

    // Check if dropped on a column (status change)
    if (over.id === 'todo' || over.id === 'done') {
      const newStatus = over.id;
      if (newStatus !== activeTask.status) {
        const taskId = activeTask._id || activeTask.id;
        handleTaskUpdate(taskId, { status: newStatus });
      }
      return;
    }

    // Check if dropped on another task (reordering within same column)
    const overTask = tasks.find(task => task._id === over.id || task.id === over.id);
    if (overTask && activeTask.status === overTask.status) {
      const oldIndex = tasks.findIndex(task => task._id === active.id || task.id === active.id);
      const newIndex = tasks.findIndex(task => task._id === over.id || task.id === over.id);

      if (oldIndex !== newIndex) {
        setTasks(prev => arrayMove(prev, oldIndex, newIndex));
      }
    }
  }, [tasks, handleTaskUpdate]);

  const groupedTasks = useMemo(() => ({
    // Treat legacy 'in-progress' tasks as 'todo' now that the UI only shows Todo/Done.
    todo: tasks.filter(task => task.status === 'todo' || task.status === 'in-progress'),
    done: tasks.filter(task => task.status === 'done')
  }), [tasks]);

  // Progress widget data
  const today = new Date().toDateString();
  const todayCompleted = tasks.filter(t =>
    t.status === 'done' && new Date(t.createdAt).toDateString() === today
  ).length;
  const totalToday = tasks.filter(t =>
    new Date(t.createdAt).toDateString() === today
  ).length;
  const completionRateToday = totalToday > 0 ? Math.round((todayCompleted / totalToday) * 100) : 0;

  const weeklyCompleted = tasks.filter(t => {
    const createdAt = new Date(t.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return t.status === 'done' && createdAt >= weekAgo;
  }).length;

  const weeklyTotal = tasks.filter(t => {
    const createdAt = new Date(t.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).length;

  const weeklyAvg = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
              Task Scheduling & Guidance
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
              Organize your tasks and stay on track
            </p>
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: 'var(--theme-primary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </motion.button>
        </motion.div>

        {/* Progress Widget */}
        <motion.div
          className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Today completion</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{completionRateToday}%</p>
              </div>
              <TrendingUp className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </div>
          <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Weekly average</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{weeklyAvg}%</p>
              </div>
              <BarChart3 className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
            </div>
          </div>
          <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Completed today</p>
                <p className="text-2xl font-bold text-green-500">{todayCompleted}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Task Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TaskColumn
              title="To Do"
              tasks={groupedTasks.todo}
              status="todo"
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskNudge={handleTaskNudge}
              updatingTaskId={updatingTaskId}
            />

            <TaskColumn
              title="Done"
              tasks={groupedTasks.done}
              status="done"
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskNudge={handleTaskNudge}
              updatingTaskId={updatingTaskId}
            />
          </motion.div>
        </DndContext>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                style={{ backgroundColor: 'var(--theme-card)' }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                    Create New Task
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--theme-muted-text)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--theme-muted-bg)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      style={{
                        backgroundColor: 'var(--theme-background)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                      Description
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      style={{
                        backgroundColor: 'var(--theme-background)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}
                      rows={3}
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                        Priority
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--theme-background)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                        value={newTask.priority}
                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                        Repeat
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--theme-background)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text)',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                        value={newTask.repeat}
                        onChange={(e) => setNewTask(prev => ({ ...prev, repeat: e.target.value }))}
                      >
                        <option value="once">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                      Due Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      style={{
                        backgroundColor: 'var(--theme-background)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}
                      value={newTask.dueTime}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueTime: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      {isCreating ? 'Creating...' : 'Create Task'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 rounded-lg border transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--theme-background)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task History & Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div
            className="rounded-2xl p-6 shadow-lg border"
            style={{
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
              <BarChart3 className="h-6 w-6" style={{ color: 'var(--theme-primary)' }} />
              <span>Task Analytics</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Completion Stats */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Completion Stats</span>
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-background)' }}>
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-green-500" />
                      <span style={{ color: 'var(--theme-text)' }}>Tasks Completed Today</span>
                    </div>
                    <span className="text-2xl font-bold text-green-500">{todayCompleted}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-background)' }}>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span style={{ color: 'var(--theme-text)' }}>Total Tasks</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-500">{tasks.length}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-background)' }}>
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      <span style={{ color: 'var(--theme-text)' }}>Completion Rate</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-500">{completionRateToday}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Completed Tasks */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                  <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Recent Completed Tasks</span>
                </h4>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {groupedTasks.done.slice(0, 5).map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      style={{ borderColor: 'var(--theme-border)' }}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--theme-text)' }}>
                            {task.title}
                          </p>
                          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                            Completed {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirmModal.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, taskId: null, taskTitle: '' })}
        type="error"
        isDangerous={true}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Tasks;