import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle2, Clock, Heart, Brain, Zap, Star, Coffee, Sun } from 'lucide-react';

// Notification Types and Messages
const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  MOTIVATION: 'motivation',
  MOOD_CHECK: 'mood-check',
  CELEBRATION: 'celebration',
  SUPPORT: 'support',
  BREAK: 'break'
};

const MESSAGE_LIBRARY = {
  [NOTIFICATION_TYPES.REMINDER]: [
    { text: "⏰ Time to tackle that task! Small steps count! 💪", icon: "⏰" },
    { text: "🎯 Your focus time is here! Let's do this! ✨", icon: "🎯" },
    { text: "📝 Ready to check something off your list? 🌟", icon: "📝" },
    { text: "⚡ Time to shine! Your task is waiting! 🚀", icon: "⚡" },
    { text: "🎪 Show time! Let's make progress! 🎉", icon: "🎪" }
  ],
  [NOTIFICATION_TYPES.MOTIVATION]: [
    { text: "💪 You're doing amazing! Keep that momentum going! 🌟", icon: "💪" },
    { text: "🎊 Every step counts! You're building something great! ✨", icon: "🎊" },
    { text: "🌈 Progress is progress! Celebrate the small wins! 🎉", icon: "🌈" },
    { text: "🚀 You've got this! One task at a time! 💫", icon: "🚀" },
    { text: "⭐ Your dedication is inspiring! Keep going! 🌟", icon: "⭐" }
  ],
  [NOTIFICATION_TYPES.MOOD_CHECK]: [
    { text: "🫶 Hey there! How are you feeling today? 💙", icon: "🫶" },
    { text: "🌤️ Time for a quick check-in! Everything okay? 🤗", icon: "🌤️" },
    { text: "💭 How's your day going? I'm here if you need to talk! 💕", icon: "💭" },
    { text: "🌸 Take a moment to breathe. How do you feel? 🌿", icon: "🌸" },
    { text: "🤝 You're not alone! How can I help today? 💙", icon: "🤝" }
  ],
  [NOTIFICATION_TYPES.CELEBRATION]: [
    { text: "🎉 Amazing work! You just crushed that task! 🌟", icon: "🎉" },
    { text: "🏆 Task completed! You're on fire today! 🔥", icon: "🏆" },
    { text: "✨ Boom! Another one bites the dust! 🎊", icon: "✨" },
    { text: "🎪 Fantastic! You're building unstoppable momentum! 🚀", icon: "🎪" },
    { text: "⭐ Outstanding! Your productivity is inspiring! 💫", icon: "⭐" }
  ],
  [NOTIFICATION_TYPES.SUPPORT]: [
    { text: "🌿 Take a deep breath. You've got this! 💙", icon: "🌿" },
    { text: "🤗 It's okay to feel this way. You're stronger than you know! 💪", icon: "🤗" },
    { text: "🌸 Remember, every storm passes. You're doing great! 🌈", icon: "🌸" },
    { text: "💙 You're not alone in this. Take it one step at a time! 🫶", icon: "💙" },
    { text: "🌤️ This feeling won't last forever. You're resilient! ✨", icon: "🌤️" }
  ],
  [NOTIFICATION_TYPES.BREAK]: [
    { text: "☕ Time for a well-deserved break! You've earned it! 🌟", icon: "☕" },
    { text: "🌿 Step away for a moment. Your mind will thank you! 💚", icon: "🌿" },
    { text: "🎈 Break time! Stretch, breathe, and recharge! ⚡", icon: "🎈" },
    { text: "🌸 You've been working hard! Time to rest and reset! 🌸", icon: "🌸" },
    { text: "💫 Take a pause! Your productivity will thank you! 🎯", icon: "💫" }
  ]
};

// Individual Notification Component
const NotificationCard = ({ notification, onDismiss, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Auto-dismiss after 8 seconds
    timeoutRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, 8000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification.id, onDismiss]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Restart auto-dismiss timer
    timeoutRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, 3000);
  };

  const getNotificationStyle = (type) => {
    // Dark theme-adaptive colors that blend better with the app
    switch (type) {
      case NOTIFICATION_TYPES.REMINDER:
        return {
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          borderColor: '#f59e0b',
          iconColor: '#f59e0b',
          textColor: '#f9fafb'
        };
      case NOTIFICATION_TYPES.MOTIVATION:
        return {
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          borderColor: '#60a5fa',
          iconColor: '#60a5fa',
          textColor: '#f9fafb'
        };
      case NOTIFICATION_TYPES.MOOD_CHECK:
        return {
          background: 'linear-gradient(135deg, #7c2d12 0%, #991b1b 100%)',
          borderColor: '#f472b6',
          iconColor: '#f472b6',
          textColor: '#f9fafb'
        };
      case NOTIFICATION_TYPES.CELEBRATION:
        return {
          background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
          borderColor: '#34d399',
          iconColor: '#34d399',
          textColor: '#f9fafb'
        };
      case NOTIFICATION_TYPES.SUPPORT:
        return {
          background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)',
          borderColor: '#22d3ee',
          iconColor: '#22d3ee',
          textColor: '#f9fafb'
        };
      case NOTIFICATION_TYPES.BREAK:
        return {
          background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
          borderColor: '#a78bfa',
          iconColor: '#a78bfa',
          textColor: '#f9fafb'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
          borderColor: '#9ca3af',
          iconColor: '#9ca3af',
          textColor: '#f9fafb'
        };
    }
  };

  const style = getNotificationStyle(notification.type);

  return (
    <motion.div
      className="relative mb-3 w-80"
      initial={{ x: 100, opacity: 0, scale: 0.9 }}
      animate={{ 
        x: 0, 
        opacity: 1, 
        scale: 1,
        y: index * -8 // Stacking effect
      }}
      exit={{ 
        opacity: 0, 
        y: 50, 
        scale: 0.9,
        transition: { duration: 0.3 }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.5 
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        zIndex: 1000 - index
      }}
    >
      <div
        className="relative p-4 rounded-2xl shadow-lg border backdrop-blur-sm"
        style={{
          background: style.background,
          borderColor: style.borderColor,
          borderWidth: '2px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => onDismiss(notification.id)}
          className="absolute top-2 right-2 p-1 rounded-full transition-colors"
          style={{ 
            color: style.iconColor,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3 pr-6">
          {/* Animated Icon */}
          <motion.div
            className="text-2xl"
            animate={isHovered ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ 
              duration: 0.6,
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 1
            }}
            style={{ color: style.iconColor }}
          >
            {notification.icon}
          </motion.div>

          {/* Message */}
          <div className="flex-1">
            <p 
              className="text-sm font-medium leading-relaxed"
              style={{ color: style.textColor }}
            >
              {notification.message}
            </p>
            
            {/* Timestamp */}
            <p 
              className="text-xs mt-1 opacity-70"
              style={{ color: style.textColor }}
            >
              {new Date(notification.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
          style={{ backgroundColor: style.iconColor }}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 8, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

// Main Notification Center Component
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);

  // Load notification history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('neurocompanion-notification-history');
    if (savedHistory) {
      try {
        setNotificationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading notification history:', error);
      }
    }
  }, []);

  // Save notification history to localStorage
  useEffect(() => {
    localStorage.setItem('neurocompanion-notification-history', JSON.stringify(notificationHistory));
  }, [notificationHistory]);

  const addNotification = useCallback((message, type, customIcon = null) => {
    const id = Date.now().toString();
    const messages = MESSAGE_LIBRARY[type] || MESSAGE_LIBRARY[NOTIFICATION_TYPES.MOTIVATION];
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const notification = {
      id,
      message: message || selectedMessage.text,
      type,
      icon: customIcon || selectedMessage.icon,
      createdAt: new Date().toISOString()
    };

    // Check for duplicates in recent history (last 5 minutes)
    const recentTime = new Date(Date.now() - 5 * 60 * 1000);
    const isDuplicate = notificationHistory.some(hist => 
      hist.message === notification.message && 
      new Date(hist.createdAt) > recentTime
    );

    if (!isDuplicate) {
      setNotifications(prev => [notification, ...prev]);
      setNotificationHistory(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    }
  }, [notificationHistory]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (user might have disabled audio)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, []);

  // Expose methods globally for other components to use
  useEffect(() => {
    window.notificationCenter = {
      addNotification,
      removeNotification,
      clearAllNotifications,
      playNotificationSound
    };
  }, [addNotification, removeNotification, clearAllNotifications, playNotificationSound]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Clear All Button */}
            {notifications.length > 1 && (
              <motion.button
                onClick={clearAllNotifications}
                className="mb-2 w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear All ({notifications.length})
              </motion.button>
            )}

            {/* Notifications Stack */}
            <div className="space-y-0">
              {notifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={removeNotification}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom Hook for Notifications
export const useNotifications = () => {
  const addNotification = useCallback((message, type, customIcon = null) => {
    if (window.notificationCenter) {
      window.notificationCenter.addNotification(message, type, customIcon);
      window.notificationCenter.playNotificationSound();
    }
  }, []);

  const removeNotification = useCallback((id) => {
    if (window.notificationCenter) {
      window.notificationCenter.removeNotification(id);
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    if (window.notificationCenter) {
      window.notificationCenter.clearAllNotifications();
    }
  }, []);

  return {
    addNotification,
    removeNotification,
    clearAllNotifications
  };
};

// Notification Types for easy import
export { NOTIFICATION_TYPES };

export default NotificationCenter;
