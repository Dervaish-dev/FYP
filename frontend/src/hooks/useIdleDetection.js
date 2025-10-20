import { useEffect, useRef, useCallback } from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '../components/NotificationCenter';

// Custom hook for idle detection and notifications
export const useIdleDetection = (idleThresholdMinutes = 120) => {
  const { addNotification } = useNotifications();
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const hasShownIdleNotificationRef = useRef(false);

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    hasShownIdleNotificationRef.current = false;
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // Set timer for idle detection
    idleTimerRef.current = setTimeout(() => {
      if (!hasShownIdleNotificationRef.current) {
        addNotification(
          '🫶 Haven\'t heard from you in a while! How are you feeling today? 💙',
          NOTIFICATION_TYPES.MOOD_CHECK,
          '🫶'
        );
        hasShownIdleNotificationRef.current = true;
      }
    }, idleThresholdMinutes * 60 * 1000);
  }, [idleThresholdMinutes, addNotification]);

  const trackActivity = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  useEffect(() => {
    // Track various user activities
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    // Initial timer setup
    resetIdleTimer();

    // Periodic check for activity (every 5 minutes)
    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const idleMinutes = Math.floor(timeSinceLastActivity / (1000 * 60));

      // Show different notifications based on idle time
      if (idleMinutes >= 30 && idleMinutes < 60 && !hasShownIdleNotificationRef.current) {
        addNotification(
          '☕ Taking a break? That\'s perfectly fine! Remember to stay hydrated! 💧',
          NOTIFICATION_TYPES.BREAK,
          '☕'
        );
        hasShownIdleNotificationRef.current = true;
      } else if (idleMinutes >= 60 && idleMinutes < 120) {
        addNotification(
          '🌿 Been a while since your last activity. Everything okay? 💙',
          NOTIFICATION_TYPES.MOOD_CHECK,
          '🌿'
        );
        hasShownIdleNotificationRef.current = true;
      } else if (idleMinutes >= 120) {
        addNotification(
          '🤗 Hey there! Just checking in - how are you doing today? 💕',
          NOTIFICATION_TYPES.MOOD_CHECK,
          '🤗'
        );
        hasShownIdleNotificationRef.current = true;
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [trackActivity, resetIdleTimer, addNotification]);

  return {
    trackActivity,
    resetIdleTimer
  };
};

// Motivational notification scheduler
export const useMotivationalNotifications = () => {
  const { addNotification } = useNotifications();
  const lastMotivationalRef = useRef(0);

  useEffect(() => {
    const motivationalMessages = [
      { text: '💪 You\'re doing amazing! Keep that momentum going! 🌟', type: NOTIFICATION_TYPES.MOTIVATION, icon: '💪' },
      { text: '🎊 Every step counts! You\'re building something great! ✨', type: NOTIFICATION_TYPES.MOTIVATION, icon: '🎊' },
      { text: '🌈 Progress is progress! Celebrate the small wins! 🎉', type: NOTIFICATION_TYPES.MOTIVATION, icon: '🌈' },
      { text: '🚀 You\'ve got this! One task at a time! 💫', type: NOTIFICATION_TYPES.MOTIVATION, icon: '🚀' },
      { text: '⭐ Your dedication is inspiring! Keep going! 🌟', type: NOTIFICATION_TYPES.MOTIVATION, icon: '⭐' },
      { text: '🎯 Focus and determination - you\'re unstoppable! 🔥', type: NOTIFICATION_TYPES.MOTIVATION, icon: '🎯' },
      { text: '💎 You\'re a gem! Keep shining bright! ✨', type: NOTIFICATION_TYPES.MOTIVATION, icon: '💎' },
      { text: '🌻 Your positive energy makes everything better! 🌸', type: NOTIFICATION_TYPES.MOTIVATION, icon: '🌻' }
    ];

    const scheduleMotivationalNotification = () => {
      const now = Date.now();
      const timeSinceLastMotivational = now - lastMotivationalRef.current;
      const hoursSinceLastMotivational = timeSinceLastMotivational / (1000 * 60 * 60);

      // Show motivational notification every 2-4 hours
      if (hoursSinceLastMotivational >= 2) {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        addNotification(randomMessage.text, randomMessage.type, randomMessage.icon);
        lastMotivationalRef.current = now;
      }
    };

    // Check for motivational notifications every hour
    const motivationalInterval = setInterval(scheduleMotivationalNotification, 60 * 60 * 1000);

    // Initial check
    scheduleMotivationalNotification();

    return () => {
      clearInterval(motivationalInterval);
    };
  }, [addNotification]);
};

// Break reminder system
export const useBreakReminders = () => {
  const { addNotification } = useNotifications();
  const lastBreakRef = useRef(0);

  useEffect(() => {
    const breakMessages = [
      { text: '☕ Time for a well-deserved break! You\'ve earned it! 🌟', type: NOTIFICATION_TYPES.BREAK, icon: '☕' },
      { text: '🌿 Step away for a moment. Your mind will thank you! 💚', type: NOTIFICATION_TYPES.BREAK, icon: '🌿' },
      { text: '🎈 Break time! Stretch, breathe, and recharge! ⚡', type: NOTIFICATION_TYPES.BREAK, icon: '🎈' },
      { text: '🌸 You\'ve been working hard! Time to rest and reset! 🌸', type: NOTIFICATION_TYPES.BREAK, icon: '🌸' },
      { text: '💫 Take a pause! Your productivity will thank you! 🎯', type: NOTIFICATION_TYPES.BREAK, icon: '💫' },
      { text: '🧘‍♀️ Mindful moment: Take a deep breath and relax! 🌊', type: NOTIFICATION_TYPES.BREAK, icon: '🧘‍♀️' },
      { text: '🌱 Your brain needs rest too! Take a short break! 🌿', type: NOTIFICATION_TYPES.BREAK, icon: '🌱' }
    ];

    const scheduleBreakReminder = () => {
      const now = Date.now();
      const timeSinceLastBreak = now - lastBreakRef.current;
      const minutesSinceLastBreak = timeSinceLastBreak / (1000 * 60);

      // Show break reminder every 45-60 minutes of activity
      if (minutesSinceLastBreak >= 45) {
        const randomMessage = breakMessages[Math.floor(Math.random() * breakMessages.length)];
        addNotification(randomMessage.text, randomMessage.type, randomMessage.icon);
        lastBreakRef.current = now;
      }
    };

    // Check for break reminders every 15 minutes
    const breakInterval = setInterval(scheduleBreakReminder, 15 * 60 * 1000);

    return () => {
      clearInterval(breakInterval);
    };
  }, [addNotification]);
};

export default useIdleDetection;
