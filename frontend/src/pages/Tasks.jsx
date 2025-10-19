import React, { useState, useEffect } from 'react';
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
  Clock,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Bell,
  BellOff,
  Target,
  Zap
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

// Task Card Component
const TaskCard = ({ task, onUpdate, onDelete, onNudge }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-500" />;
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
        opacity: isDragging ? 0.5 : 1
      }}
      {...attributes}
      {...listeners}
      className="card p-4 mb-3 cursor-grab active:cursor-grabbing"
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
            
            {task.nudgeCount > 0 && (
              <div className="flex items-center space-x-1">
                <Bell className="h-3 w-3" />
                <span style={{ color: 'var(--theme-text)' }}>{task.nudgeCount}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {task.status !== 'done' && (
            <button
              onClick={() => onNudge(task._id)}
              className="p-1 rounded hover:bg-gray-100"
              style={{ color: 'var(--theme-text)' }}
              title="Send reminder"
            >
              <Bell className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => onUpdate(task._id, { status: task.status === 'done' ? 'todo' : 'done' })}
            className="p-1 rounded hover:bg-gray-100"
            style={{ color: 'var(--theme-text)' }}
            title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as done'}
          >
            {task.status === 'done' ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onDelete(task._id)}
            className="p-1 rounded hover:bg-red-100 text-red-500"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {isOverdue && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>Overdue!</span>
        </div>
      )}
    </motion.div>
  );
};

// Task Column Component
const TaskColumn = ({ title, tasks, status, onTaskUpdate, onTaskDelete, onTaskNudge }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
          <span>{title}</span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded-full" style={{ color: 'var(--theme-text)' }}>
            {tasks.length}
          </span>
        </h2>
      </div>
      
      <motion.div 
        ref={setNodeRef}
        className="space-y-3 min-h-96 p-4 rounded-lg transition-all duration-300 ease-in-out"
        animate={{
          backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          borderColor: isOver ? 'var(--theme-primary)' : 'transparent',
          borderWidth: isOver ? '2px' : '0px',
          borderStyle: isOver ? 'dashed' : 'solid',
          scale: isOver ? 1.02 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut"
        }}
        style={{ 
          borderColor: 'var(--theme-primary)',
        }}
      >
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TaskCard
                  task={task}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  onNudge={onTaskNudge}
                />
              </motion.div>
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
};

// Main Tasks Component
const Tasks = () => {
  const { currentTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueTime: '',
    repeat: 'once'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock user ID (in real app, get from auth context)
  const userId = 'user123';

  useEffect(() => {
    loadTasks();
    checkForDueTasks();
    
    // Check for due tasks every minute
    const interval = setInterval(checkForDueTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${userId}`);
      if (response.data.success) {
        setTasks(response.data.data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to mock data
      setTasks([
        {
          _id: '1',
          title: 'Take morning medication',
          description: 'Morning dose before breakfast',
          priority: 'high',
          status: 'todo',
          dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          repeat: 'daily',
          nudgeCount: 0
        },
        {
          _id: '2',
          title: 'Complete project report',
          description: 'Finish the quarterly project report',
          priority: 'medium',
          status: 'in-progress',
          dueTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          repeat: 'once',
          nudgeCount: 1
        },
        {
          _id: '3',
          title: 'Exercise for 30 minutes',
          description: 'Go for a walk or do yoga',
          priority: 'low',
          status: 'done',
          dueTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          repeat: 'daily',
          completedAt: new Date().toISOString(),
          nudgeCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkForDueTasks = async () => {
    try {
      const response = await api.get(`/tasks/${userId}/due`);
      if (response.data.success && response.data.data.length > 0) {
        response.data.data.forEach(task => {
          if (!task.isNudged) {
            showNudgeNotification(task);
          }
        });
      }
    } catch (error) {
      console.error('Error checking due tasks:', error);
    }
  };

  const showNudgeNotification = (task) => {
    toast.info(
      <div>
        <div className="font-semibold">⏰ Task Reminder</div>
        <div>{task.title}</div>
        <div className="text-sm opacity-70">Due: {new Date(task.dueTime).toLocaleString()}</div>
      </div>,
      {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    // Check if dropped on a column (status change)
    if (over.id === 'todo' || over.id === 'in-progress' || over.id === 'done') {
      const newStatus = over.id;
      if (newStatus !== activeTask.status) {
        await handleTaskUpdate(active.id, { status: newStatus });
      }
      return;
    }

    // Check if dropped on another task (reordering within same column)
    const overTask = tasks.find(task => task._id === over.id);
    if (overTask && activeTask.status === overTask.status) {
      const oldIndex = tasks.findIndex(task => task._id === active.id);
      const newIndex = tasks.findIndex(task => task._id === over.id);
      
      if (oldIndex !== newIndex) {
        setTasks(prev => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleTaskUpdate = async (taskId, updateData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updateData);
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? { ...task, ...updateData } : task
        ));
        toast.success('Task updated successfully!');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await api.delete(`/tasks/${taskId}`);
        if (response.data.success) {
          setTasks(prev => prev.filter(task => task._id !== taskId));
          toast.success('Task deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleTaskNudge = async (taskId) => {
    try {
      const response = await api.put(`/tasks/${taskId}/nudge`);
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? { ...task, isNudged: true, nudgeCount: task.nudgeCount + 1 } : task
        ));
        toast.success('Reminder sent!');
      }
    } catch (error) {
      console.error('Error nudging task:', error);
      toast.error('Failed to send reminder');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const response = await api.post('/tasks/create', {
        userId,
        ...newTask,
        dueTime: new Date(newTask.dueTime).toISOString()
      });
      
      if (response.data.success) {
        setTasks(prev => [response.data.data, ...prev]);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueTime: '',
          repeat: 'once'
        });
        setShowCreateModal(false);
        toast.success('Task created successfully!');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const groupedTasks = {
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    done: tasks.filter(task => task.status === 'done')
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--theme-primary)' }}></div>
          <p style={{ color: 'var(--theme-text)' }}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </motion.button>
        </div>

        {/* Task Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskColumn
              title="To Do"
              tasks={groupedTasks.todo}
              status="todo"
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskNudge={handleTaskNudge}
            />
            
            <TaskColumn
              title="In Progress"
              tasks={groupedTasks['in-progress']}
              status="in-progress"
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskNudge={handleTaskNudge}
            />
            
            <TaskColumn
              title="Done"
              tasks={groupedTasks.done}
              status="done"
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskNudge={handleTaskNudge}
            />
          </div>
        </DndContext>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="card p-6 w-full max-w-md mx-4"
                style={{ backgroundColor: 'var(--theme-card)' }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                  Create New Task
                </h2>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text)' }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      className="input-field"
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
                      className="input-field"
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
                        className="input-field"
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
                        className="input-field"
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
                      className="input-field"
                      value={newTask.dueTime}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueTime: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      Create Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
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