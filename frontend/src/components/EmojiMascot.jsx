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
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      whileHover={{ x: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Bold Mascot Container */}
      <motion.div
        className="relative cursor-pointer"
        onClick={handleMascotClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnimating ? {
          rotate: [0, -5, 5, -5, 5, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Bold Background Circle with Gradient */}
        <motion.div
          className="w-20 h-20 rounded-full shadow-2xl border-4 flex items-center justify-center relative overflow-hidden"
          style={{
            background: isGenerating 
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderColor: isGenerating ? '#60a5fa' : '#a78bfa',
            backdropFilter: 'blur(10px)'
          }}
          animate={{
            boxShadow: isGenerating ? [
              '0 8px 32px rgba(59, 130, 246, 0.4)',
              '0 12px 40px rgba(59, 130, 246, 0.6)',
              '0 8px 32px rgba(59, 130, 246, 0.4)'
            ] : [
              '0 8px 32px rgba(99, 102, 241, 0.4)',
              '0 12px 40px rgba(139, 92, 246, 0.6)',
              '0 8px 32px rgba(99, 102, 241, 0.4)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)'
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Emoji or Loading Spinner */}
          {isGenerating ? (
            <motion.div
              className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <motion.span
              className="text-4xl relative z-10"
              animate={{
                y: [0, -3, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {currentEmoji}
            </motion.span>
          )}
        </motion.div>

        {/* Bold Notification Badge */}
        <motion.div
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: '3px solid white'
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          !
        </motion.div>

        {/* Bold Speech Bubble */}
        <motion.div
          className="absolute right-24 top-1/2 transform -translate-y-1/2 rounded-xl px-4 py-3 shadow-xl border-2"
          style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderColor: '#6366f1',
            color: '#f9fafb'
          }}
          initial={{ opacity: 0, x: 15, scale: 0.8 }}
          whileHover={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        >
          <p className="text-sm font-semibold whitespace-nowrap">
            {isGenerating ? '✨ Generating wisdom...' : '💡 Click for motivation!'}
          </p>
          {/* Speech bubble tail */}
          <div
            className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-t-4 border-b-4 border-transparent"
            style={{ borderLeftColor: '#374151' }}
          />
        </motion.div>
      </motion.div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              left: '50%',
              top: '50%'
            }}
            animate={{
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
              opacity: [0, 0.8, 0],
              scale: [0, 1.2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiMascot;
