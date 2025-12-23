import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, CheckCircle, ChevronLeft, Clock, Plus, Target, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications, NOTIFICATION_TYPES } from '../components/NotificationCenter';
import { taskAPI } from '../utils/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isInRange = (date, start, end) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  return date.getTime() >= start.getTime() && date.getTime() < end.getTime();
};

const TaskScheduling = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    dueTime: '',
    repeat: 'once',
    customInterval: '',
    stepsText: ''
  });

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');
      const list = await taskAPI.listByUser(user.id);
      setTasks(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueTodayCount = tasks.filter((t) => {
      const due = new Date(t.dueTime);
      return isInRange(due, todayStart, todayEnd);
    }).length;

    const completedTodayCount = tasks.filter((t) => {
      if (t.status !== 'done' || !t.completedAt) return false;
      const doneAt = new Date(t.completedAt);
      return isInRange(doneAt, todayStart, todayEnd);
    }).length;

    const overdueCount = tasks.filter((t) => {
      if (t.status === 'done') return false;
      const due = new Date(t.dueTime);
      return due.getTime() < now.getTime();
    }).length;

    const upcomingCount = tasks.filter((t) => {
      if (t.status === 'done') return false;
      const due = new Date(t.dueTime);
      return due.getTime() >= now.getTime() && due.getTime() <= next24h.getTime();
    }).length;

    const categories = tasks.reduce((acc, t) => {
      const name = String(t.category || 'General').trim() || 'General';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const byDay = Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(todayStart);
      day.setDate(day.getDate() - (6 - idx));
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const total = tasks.filter((t) => isInRange(new Date(t.dueTime), day, dayEnd)).length;
      const completed = tasks.filter((t) => t.status === 'done' && isInRange(new Date(t.completedAt), day, dayEnd)).length;

      return {
        label: day.toLocaleDateString([], { weekday: 'short' }),
        completed,
        total
      };
    });

    return { dueTodayCount, completedTodayCount, overdueCount, upcomingCount, categories, byDay };
  }, [tasks]);

  const maxTasks = Math.max(1, ...stats.byDay.map((d) => d.total), ...stats.byDay.map((d) => d.completed));

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'done')
      .slice()
      .sort((a, b) => new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime())
      .slice(0, 8);
  }, [tasks]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setCreating(true);
      setError('');

      const steps = String(newTask.stepsText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((text) => ({ id: `${Date.now()}-${Math.random()}`, text, done: false }));

      const customInterval =
        newTask.repeat === 'custom' && newTask.customInterval !== ''
          ? Number(newTask.customInterval)
          : null;

      await taskAPI.create({
        userId: user.id,
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority,
        dueTime: newTask.dueTime,
        repeat: newTask.repeat,
        customInterval: customInterval && customInterval > 0 ? customInterval : null,
        steps
      });

      addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Task created',
        message: 'Added to your schedule.'
      });

      setShowCreate(false);
      setNewTask({
        title: '',
        description: '',
        category: 'General',
        priority: 'medium',
        dueTime: '',
        repeat: 'once',
        customInterval: '',
        stepsText: ''
      });

      fetchTasks();
    } catch (e2) {
      setError(e2?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      <motion.div
        className="shadow-sm"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/tasks')}
                className="p-2 transition-colors"
                style={{ color: 'var(--text-color)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                Task Scheduling
              </div>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              <Plus size={18} />
              New
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div
            className="mb-6 p-4 rounded-lg border"
            style={{
              backgroundColor: 'rgba(var(--primary-rgb), 0.10)',
              borderColor: 'var(--primary-500)',
              color: 'var(--text-color)'
            }}
          >
            {error}
          </div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          <motion.div variants={itemVariants}>
            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-500)' }}
                  >
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                      {loading ? 'Loading…' : `${stats.completedTodayCount} TASKS COMPLETED`}
                    </h2>
                    <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                      Today (based on completedAt)
                    </p>
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}
                >
                  {stats.overdueCount > 0 ? 'NEEDS ATTENTION' : 'ON TRACK'}
                </div>
              </div>

              <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--border-color)' }}>
                <motion.div
                  className="h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      stats.dueTodayCount === 0
                        ? 0
                        : Math.min(100, Math.round((stats.completedTodayCount / stats.dueTodayCount) * 100))
                    }%`
                  }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  style={{ backgroundColor: 'var(--primary-500)' }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2" style={{ color: 'var(--text-color)', opacity: 0.75 }}>
                <span>Due today: {stats.dueTodayCount}</span>
                <span>
                  {stats.dueTodayCount === 0
                    ? '—'
                    : `${Math.min(100, Math.round((stats.completedTodayCount / stats.dueTodayCount) * 100))}% complete`}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                      Due Today
                    </div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                      {stats.dueTodayCount}
                    </div>
                  </div>
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <Calendar className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                      Overdue
                    </div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                      {stats.overdueCount}
                    </div>
                  </div>
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <CheckCircle className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-6 shadow-lg border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                      Next 24h
                    </div>
                    <div className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                      {stats.upcomingCount}
                    </div>
                  </div>
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <Clock className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
              Weekly Progress
            </h2>
            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
                  Completion by Day
                </h3>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                  <BarChart3 size={18} />
                  <span className="text-sm">Last 7 days</span>
                </div>
              </div>

              <div className="h-48 flex items-end justify-between space-x-2">
                {stats.byDay.map((day, index) => (
                  <motion.div
                    key={`${day.label}-${index}`}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <div className="text-xs" style={{ color: 'var(--text-color)', opacity: 0.75 }}>
                      {day.completed}/{day.total}
                    </div>
                    <div
                      className="w-8 rounded-t"
                      style={{
                        backgroundColor: 'var(--primary-500)',
                        height: `${(day.total === 0 ? 0 : (day.completed / maxTasks)) * 120}px`,
                        minHeight: '20px'
                      }}
                    />
                    <div className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      {day.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                <div>Total tasks: {tasks.length}</div>
                <div>Recurring: {tasks.filter((t) => t.repeat && t.repeat !== 'once').length}</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
              Upcoming
            </h2>
            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              {upcomingTasks.length === 0 ? (
                <div style={{ color: 'var(--text-color)', opacity: 0.8 }}>No upcoming tasks.</div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((t) => (
                    <div
                      key={t._id || t.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-color)' }}>
                          {t.title}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.75 }}>
                          {new Date(t.dueTime).toLocaleString()} · {t.category || 'General'}
                          {t.repeat && t.repeat !== 'once' ? ` · ${t.repeat}` : ''}
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                        {t.priority}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
              Categories
            </h2>
            <div
              className="rounded-2xl p-6 shadow-lg border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(stats.categories).length === 0 ? (
                  <div style={{ color: 'var(--text-color)', opacity: 0.8 }}>No tasks yet.</div>
                ) : (
                  Object.entries(stats.categories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 9)
                    .map(([name, count]) => (
                      <div key={name} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium" style={{ color: 'var(--text-color)' }}>
                            {name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                            {count}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-xl p-6"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>
                Create Task / Routine
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 rounded-lg border"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                  Title
                </label>
                <input
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Category
                  </label>
                  <input
                    value={newTask.category}
                    onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                    placeholder="General"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Due
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.dueTime}
                    onChange={(e) => setNewTask((p) => ({ ...p, dueTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Repeat
                  </label>
                  <select
                    value={newTask.repeat}
                    onChange={(e) => setNewTask((p) => ({ ...p, repeat: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom (days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Custom Interval (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    disabled={newTask.repeat !== 'custom'}
                    value={newTask.customInterval}
                    onChange={(e) => setNewTask((p) => ({ ...p, customInterval: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border"
                    style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                  Steps (one per line)
                </label>
                <textarea
                  value={newTask.stepsText}
                  onChange={(e) => setNewTask((p) => ({ ...p, stepsText: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ backgroundColor: 'var(--theme-background)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                  rows={4}
                  placeholder={'1) First step\n2) Second step\n3) Third step'}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white disabled:opacity-60"
                  style={{ backgroundColor: 'var(--primary-500)' }}
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskScheduling;
