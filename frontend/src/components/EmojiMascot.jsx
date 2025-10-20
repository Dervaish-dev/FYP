import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, NOTIFICATION_TYPES } from './NotificationCenter';

// Interactive Emoji Mascot Component
const EmojiMascot = () => {
  const { addNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);
  const [currentEmoji, setCurrentEmoji] = useState('😊');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const clickCountRef = useRef(0);

  // Array of different emojis that can peek through
  const mascotEmojis = [
    '😊', '🤗', '😄', '🥰', '😍', '🤩', '😘', '😉', 
    '🤔', '😋', '🥳', '😎', '🤠', '😇', '🙃', '😌',
    '🤗', '😊', '🥰', '😄', '🤩', '😘', '😉', '🤔'
  ];

  // Generate AI-powered motivational content using Gemini
  const generateMotivationalContent = async () => {
    setIsGenerating(true);
    
    try {
      const prompts = [
        "Give me a short 2-3 line motivational quote about perseverance and success. Make it inspiring and personal.",
        "Share a brief 2-3 line story about someone who overcame challenges. Make it relatable and uplifting.",
        "Write a short 2-3 line piece of advice about staying positive during difficult times. Be encouraging.",
        "Give me a 2-3 line motivational message about achieving goals and dreams. Make it inspiring.",
        "Share a brief 2-3 line wisdom about learning from failures and growing stronger. Be supportive.",
        "Write a short 2-3 line encouragement about believing in yourself and your abilities. Be uplifting.",
        "Give me a 2-3 line motivational quote about taking small steps towards big dreams. Be inspiring.",
        "Share a brief 2-3 line advice about staying focused and motivated. Be encouraging.",
        "Write a short 2-3 line wisdom about the power of persistence and never giving up. Be supportive.",
        "Give me a 2-3 line motivational message about embracing challenges as opportunities. Be inspiring."
      ];

      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key=AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: randomPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (generatedText.trim()) {
        // Clean up the response
        const cleanText = generatedText.trim().replace(/^["']|["']$/g, '');
        
        // Determine notification type based on content
        let notificationType = NOTIFICATION_TYPES.MOTIVATION;
        let icon = '💪';
        
        if (cleanText.toLowerCase().includes('story') || cleanText.toLowerCase().includes('once') || cleanText.toLowerCase().includes('person')) {
          notificationType = NOTIFICATION_TYPES.MOTIVATION;
          icon = '📖';
        } else if (cleanText.toLowerCase().includes('advice') || cleanText.toLowerCase().includes('remember') || cleanText.toLowerCase().includes('try')) {
          notificationType = NOTIFICATION_TYPES.SUPPORT;
          icon = '💡';
        } else if (cleanText.toLowerCase().includes('believe') || cleanText.toLowerCase().includes('dream') || cleanText.toLowerCase().includes('achieve')) {
          notificationType = NOTIFICATION_TYPES.CELEBRATION;
          icon = '🌟';
        }

        addNotification(cleanText, notificationType, icon);
      } else {
        // Fallback to predefined messages if AI fails
        const fallbackMessages = [
          { text: '💪 Every expert was once a beginner. Every pro was once an amateur. Keep going! 🌟', type: NOTIFICATION_TYPES.MOTIVATION, icon: '💪' },
          { text: '📖 Remember: The oak tree was once just a little nut that held its ground! 🌳', type: NOTIFICATION_TYPES.MOTIVATION, icon: '📖' },
          { text: '💡 Success is not final, failure is not fatal. It\'s the courage to continue that counts! ✨', type: NOTIFICATION_TYPES.SUPPORT, icon: '💡' },
          { text: '🌟 Your limitation is only your imagination. Dream big and take action! 🚀', type: NOTIFICATION_TYPES.CELEBRATION, icon: '🌟' }
        ];
        
        const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        addNotification(randomFallback.text, randomFallback.type, randomFallback.icon);
      }
    } catch (error) {
      console.error('Error generating motivational content:', error);
      
      // Fallback to predefined messages
      const fallbackMessages = [
        { text: '💪 Every expert was once a beginner. Every pro was once an amateur. Keep going! 🌟', type: NOTIFICATION_TYPES.MOTIVATION, icon: '💪' },
        { text: '📖 Remember: The oak tree was once just a little nut that held its ground! 🌳', type: NOTIFICATION_TYPES.MOTIVATION, icon: '📖' },
        { text: '💡 Success is not final, failure is not fatal. It\'s the courage to continue that counts! ✨', type: NOTIFICATION_TYPES.SUPPORT, icon: '💡' },
        { text: '🌟 Your limitation is only your imagination. Dream big and take action! 🚀', type: NOTIFICATION_TYPES.CELEBRATION, icon: '🌟' },
        { text: '🌱 Growth happens outside your comfort zone. Embrace the challenge! 💫', type: NOTIFICATION_TYPES.MOTIVATION, icon: '🌱' },
        { text: '🎯 Focus on progress, not perfection. Every step forward counts! ✨', type: NOTIFICATION_TYPES.SUPPORT, icon: '🎯' }
      ];
      
      const randomFallback = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      addNotification(randomFallback.text, randomFallback.type, randomFallback.icon);
    } finally {
      setIsGenerating(false);
    }
  };

  // Change emoji periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEmoji = mascotEmojis[Math.floor(Math.random() * mascotEmojis.length)];
      setCurrentEmoji(randomEmoji);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMascotClick = () => {
    if (isAnimating || isGenerating) return;
    
    setIsAnimating(true);
    clickCountRef.current += 1;

    // Generate AI-powered motivational content
    generateMotivationalContent();

    // Change emoji on click
    const randomEmoji = mascotEmojis[Math.floor(Math.random() * mascotEmojis.length)];
    setCurrentEmoji(randomEmoji);

    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <motion.div
      className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50"
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      whileHover={{ x: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Mascot Container */}
      <motion.div
        className="relative cursor-pointer"
        onClick={handleMascotClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isAnimating ? {
          rotate: [0, -10, 10, -10, 10, 0],
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Background Circle */}
        <motion.div
          className="w-16 h-16 rounded-full shadow-lg border-2 flex items-center justify-center"
          style={{
            backgroundColor: isGenerating ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isGenerating ? '#3b82f6' : 'var(--theme-primary)',
            backdropFilter: 'blur(10px)'
          }}
          animate={{
            boxShadow: isGenerating ? [
              '0 4px 20px rgba(59, 130, 246, 0.3)',
              '0 8px 30px rgba(59, 130, 246, 0.5)',
              '0 4px 20px rgba(59, 130, 246, 0.3)'
            ] : [
              '0 4px 20px rgba(0,0,0,0.1)',
              '0 8px 30px rgba(0,0,0,0.2)',
              '0 4px 20px rgba(0,0,0,0.1)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Emoji or Loading Spinner */}
          {isGenerating ? (
            <motion.div
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <motion.span
              className="text-3xl"
              animate={{
                y: [0, -2, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentEmoji}
            </motion.span>
          )}
        </motion.div>

        {/* Peek Effect - Only show part of the mascot */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: 'var(--theme-background)',
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)'
          }}
          animate={{
            x: [0, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Click Indicator */}
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: 'white'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          !
        </motion.div>

        {/* Speech Bubble (appears on hover) */}
        <motion.div
          className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-white rounded-lg px-3 py-2 shadow-lg border"
          style={{
            borderColor: 'var(--theme-border)'
          }}
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--theme-text)' }}>
            {isGenerating ? 'Generating wisdom...' : 'Click me! 👆'}
          </p>
          {/* Speech bubble tail */}
          <div
            className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-t-4 border-b-4 border-transparent"
            style={{ borderLeftColor: 'white' }}
          />
        </motion.div>
      </motion.div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: 'var(--theme-primary)',
              left: '50%',
              top: '50%'
            }}
            animate={{
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiMascot;
