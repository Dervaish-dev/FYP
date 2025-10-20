import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Heart, Zap, Coffee, Sun } from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../components/NotificationCenter';

// Demo component for testing notifications
const NotificationDemo = () => {
  const { addNotification } = useNotifications();

  const testNotifications = [
    {
      title: 'Task Reminder',
      message: '⏰ "Morning Focus" task is due soon! Time to focus! 🎯',
      type: NOTIFICATION_TYPES.REMINDER,
      icon: '⏰'
    },
    {
      title: 'Celebration',
      message: '🎉 Task completed! You\'re on fire! 🔥',
      type: NOTIFICATION_TYPES.CELEBRATION,
      icon: '🎉'
    },
    {
      title: 'Mood Support',
      message: '🌿 You seem a little down. Take a deep breath! 💙',
      type: NOTIFICATION_TYPES.SUPPORT,
      icon: '🌿'
    },
    {
      title: 'Motivation',
      message: '💪 You\'re doing amazing! Keep that momentum! 🌟',
      type: NOTIFICATION_TYPES.MOTIVATION,
      icon: '💪'
    },
    {
      title: 'Mood Check',
      message: '🫶 How are you feeling today? 💙',
      type: NOTIFICATION_TYPES.MOOD_CHECK,
      icon: '🫶'
    },
    {
      title: 'Break Reminder',
      message: '☕ Time for a well-deserved break! 🌟',
      type: NOTIFICATION_TYPES.BREAK,
      icon: '☕'
    }
  ];

  const handleTestNotification = (notification) => {
    addNotification(notification.message, notification.type, notification.icon);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
          Notification System Demo
        </h1>
        <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
          Test different types of animated notifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testNotifications.map((notification, index) => (
          <motion.button
            key={index}
            onClick={() => handleTestNotification(notification)}
            className="p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 text-left"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{notification.icon}</span>
              <h3 className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                {notification.title}
              </h3>
            </div>
            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
              {notification.message}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl border" style={{ 
        backgroundColor: 'var(--theme-card)',
        borderColor: 'var(--theme-border)'
      }}>
        <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
          <Bell className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
          <span>Notification Features</span>
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--theme-text)' }}>
          <li>✨ Smooth slide-in animations from the right</li>
          <li>🎨 Color-coded by notification type</li>
          <li>⏰ Auto-dismiss after 8 seconds</li>
          <li>🔊 Optional sound effects</li>
          <li>📚 Randomized motivational messages</li>
          <li>💾 localStorage persistence</li>
          <li>🚫 Duplicate prevention</li>
          <li>📱 Responsive design</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
