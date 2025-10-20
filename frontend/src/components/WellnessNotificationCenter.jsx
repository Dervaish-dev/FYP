import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  Clock, 
  Heart, 
  Wind, 
  Moon,
  Zap,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';

const WellnessNotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate motivational notifications (no auth needed)
  const generateMotivationalNotifications = () => {
    const motivationalMessages = [
      {
        id: 'motivational-1',
        title: 'Take a Deep Breath',
        message: 'You\'re doing great! Take a moment to breathe and center yourself.',
        type: 'motivational',
        icon: 'wind',
        priority: 'low'
      },
      {
        id: 'motivational-2',
        title: 'Hydration Reminder',
        message: 'Stay hydrated! Your brain works better when you\'re well-hydrated.',
        type: 'hydration',
        icon: 'heart',
        priority: 'medium'
      },
      {
        id: 'motivational-3',
        title: 'Movement Break',
        message: 'Time for a quick stretch! Your body will thank you.',
        type: 'movement',
        icon: 'zap',
        priority: 'medium'
      },
      {
        id: 'motivational-4',
        title: 'Mindfulness Moment',
        message: 'Take a moment to appreciate something positive in your day.',
        type: 'mindfulness',
        icon: 'heart',
        priority: 'low'
      }
    ];

    // Return random motivational notification
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    return [motivationalMessages[randomIndex]];
  };

  // Show motivational notifications periodically
  useEffect(() => {
    const showNotification = () => {
      const motivationalNotifications = generateMotivationalNotifications();
      setNotifications(prev => [...prev, ...motivationalNotifications]);
      setIsVisible(true);
    };

    // Show notification every 5 minutes
    const interval = setInterval(showNotification, 300000);
    
    // Show initial notification after 30 seconds
    const initialTimeout = setTimeout(showNotification, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  // Handle notification completion
  const handleNotificationComplete = async (notificationId, isNudge = false) => {
    // Remove notification from state
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Wellness reminder completed!');
  };

  // Handle notification dismissal
  const handleNotificationDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      bell: Bell,
      wind: Wind,
      heart: Heart,
      moon: Moon,
      zap: Zap,
      clock: Clock,
      info: Info,
      alert: AlertCircle
    };
    
    const IconComponent = iconMap[iconName] || Bell;
    return <IconComponent className="h-5 w-5" />;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  // Auto-dismiss notifications after 10 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        handleNotificationDismiss(notification.id);
      }, 10000);
      
      return () => clearTimeout(timer);
    });
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 max-w-sm"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                {getIconComponent(notification.icon)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                  {notification.title}
                </h4>
                <p className="text-sm opacity-80 mb-3" style={{ color: 'var(--text-color)' }}>
                  {notification.message}
                </p>
                
                <div className="flex items-center space-x-2">
                  {notification.type !== 'motivational' && (
                    <motion.button
                      onClick={() => handleNotificationComplete(notification.id, true)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium flex items-center space-x-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Done</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => handleNotificationDismiss(notification.id)}
                    className="px-3 py-1 border text-xs rounded-full font-medium"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-color)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Dismiss
                  </motion.button>
                </div>
              </div>
              
              <button
                onClick={() => handleNotificationDismiss(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-b-2xl"
              style={{ backgroundColor: 'var(--border-color)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WellnessNotificationCenter;
