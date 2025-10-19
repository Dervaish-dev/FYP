import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Heart,
  Calendar,
  Clock,
  MessageCircle,
  Bot,
  Send,
  TrendingUp,
  BarChart3,
  Brain,
  Smile,
  Frown,
  Meh,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const Journal = () => {
  const { applyAdaptiveTheme } = useTheme();
  const [journalEntries, setJournalEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChatbotButton, setShowChatbotButton] = useState(false);

  // Load journal entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('neurocompanion-journal');
    if (savedEntries) {
      setJournalEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save journal entries to localStorage
  const saveEntries = (entries) => {
    localStorage.setItem('neurocompanion-journal', JSON.stringify(entries));
    setJournalEntries(entries);
  };

  // AI Emotion Analysis using Gemini API with language detection
  const analyzeEmotion = async (text) => {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    // First check for critical negative keywords - bypass AI if found
    const lowerText = text.toLowerCase();
    const criticalKeywords = [
      'kill myself', 'suicide', 'suicidal', 'die', 'death', 'end it all', 'not worth living', 
      'useless', 'worthless', 'alone', 'lonely', 'hopeless',
      // Roman Urdu keywords
      'main mar jaon', 'khudkushi', 'zindagi se tang', 'bekar', 'akela', 'udaas', 'pareshan'
    ];
    const hasCriticalKeywords = criticalKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasCriticalKeywords) {
      console.log('🚨 CRITICAL KEYWORDS DETECTED - Bypassing AI, returning depressed');
      // Detect if it's Roman Urdu
      const romanUrduKeywords = ['main', 'app', 'kia', 'merai', 'sath', 'hua', 'hun', 'hai'];
      const isRomanUrdu = romanUrduKeywords.some(keyword => lowerText.includes(keyword));
      return { emotion: 'depressed', language: isRomanUrdu ? 'urdu' : 'english' };
    }
    
    const prompt = `You are an expert emotion detection AI. Analyze the following text and determine the primary emotion and language.

Text: "${text}"

Instructions:
1. Detect the language (english, urdu, arabic, spanish, french, etc.)
   - If text uses English alphabet but contains Urdu words like "mien", "app", "kia", "merai", "sath", "hua" → language: urdu
   - If text contains Arabic script → language: arabic
   - If text is pure English → language: english
2. Identify the primary emotion from: happy, sad, angry, stressed, anxious, depressed, calm, excited, worried, confused, lonely, grateful, hopeful, frustrated, peaceful, overwhelmed, content, nervous, optimistic, pessimistic, neutral

Examples:
- "I am depressed" → {"language": "english", "emotion": "depressed"}
- "mien app ko kia batao merai sath ajj kia hua" → {"language": "urdu", "emotion": "neutral"}
- "I have anxiety" → {"language": "english", "emotion": "anxious"}
- "main bahut pareshan hun" → {"language": "urdu", "emotion": "worried"}

Respond with ONLY this JSON format:
{"language": "detected_language", "emotion": "detected_emotion"}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 100,
            },
          }),
        }
      );

      const data = await response.json();
      console.log('Full API Response:', data);
      
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{"language":"english","emotion":"neutral"}';
      
      console.log('AI Response Text:', responseText);
      
      try {
        // Try to extract JSON from response if it's wrapped in other text
        let jsonText = responseText;
        if (responseText.includes('{') && responseText.includes('}')) {
          const jsonStart = responseText.indexOf('{');
          const jsonEnd = responseText.lastIndexOf('}') + 1;
          jsonText = responseText.substring(jsonStart, jsonEnd);
        }
        
        const parsed = JSON.parse(jsonText);
        console.log('Parsed emotion:', parsed.emotion, 'Language:', parsed.language);
        
        // Aggressive fallback check for clearly negative text
        const lowerText = text.toLowerCase();
        const suicidalKeywords = ['kill myself', 'suicide', 'suicidal', 'die', 'death', 'end it all', 'not worth living', 'main mar jaon', 'khudkushi'];
        const depressionKeywords = ['depressed', 'depression', 'alone', 'lonely', 'useless', 'worthless', 'hopeless', 'empty', 'udaas', 'bekar', 'akela'];
        const anxietyKeywords = ['anxiety', 'anxious', 'panic', 'worried', 'stressed', 'overwhelmed', 'scared', 'pareshan', 'tension'];
        
        const hasSuicidalKeywords = suicidalKeywords.some(keyword => lowerText.includes(keyword));
        const hasDepressionKeywords = depressionKeywords.some(keyword => lowerText.includes(keyword));
        const hasAnxietyKeywords = anxietyKeywords.some(keyword => lowerText.includes(keyword));
        
        let finalEmotion = parsed.emotion?.toLowerCase() || 'neutral';
        
        // Override AI decision if negative keywords are detected
        if (hasSuicidalKeywords) {
          console.log('🚨 SUICIDAL KEYWORDS DETECTED - Overriding to depressed');
          finalEmotion = 'depressed';
        } else if (hasDepressionKeywords) {
          console.log('😢 DEPRESSION KEYWORDS DETECTED - Overriding to depressed');
          finalEmotion = 'depressed';
        } else if (hasAnxietyKeywords) {
          console.log('😰 ANXIETY KEYWORDS DETECTED - Overriding to anxious');
          finalEmotion = 'anxious';
        } else if (finalEmotion === 'neutral' && (lowerText.includes('sad') || lowerText.includes('bad') || lowerText.includes('terrible'))) {
          console.log('😔 GENERAL NEGATIVE KEYWORDS DETECTED - Overriding to sad');
          finalEmotion = 'sad';
        }
        
        return {
          emotion: finalEmotion,
          language: parsed.language?.toLowerCase() || 'english'
        };
      } catch (parseError) {
        console.error('Error parsing emotion response:', parseError);
        return { emotion: 'neutral', language: 'english' };
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      console.error('Error details:', error.message);
      
      // Fallback to keyword detection if API fails
      const lowerText = text.toLowerCase();
      const criticalKeywords = ['kill myself', 'suicide', 'suicidal', 'die', 'death', 'end it all', 'not worth living', 'useless', 'worthless', 'alone', 'lonely', 'hopeless', 'main mar jaon', 'khudkushi', 'udaas', 'bekar'];
      const depressionKeywords = ['depressed', 'depression', 'anxiety', 'anxious', 'panic', 'worried', 'stressed', 'overwhelmed', 'scared', 'pareshan', 'tension'];
      
      // Detect Roman Urdu
      const romanUrduKeywords = ['main', 'app', 'kia', 'merai', 'sath', 'hua', 'hun', 'hai'];
      const isRomanUrdu = romanUrduKeywords.some(keyword => lowerText.includes(keyword));
      
      if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
        console.log('🚨 API failed but critical keywords detected - returning depressed');
        return { emotion: 'depressed', language: isRomanUrdu ? 'urdu' : 'english' };
      } else if (depressionKeywords.some(keyword => lowerText.includes(keyword))) {
        console.log('😢 API failed but depression keywords detected - returning depressed');
        return { emotion: 'depressed', language: isRomanUrdu ? 'urdu' : 'english' };
      }
      
      return { emotion: 'neutral', language: 'english' };
    }
  };

  // Check if emotion needs chatbot intervention
  const needsSupport = (emotion) => {
    const negativeEmotions = ['sad', 'angry', 'stressed', 'anxious', 'depressed', 'worried', 'confused', 'lonely', 'frustrated', 'overwhelmed', 'nervous', 'pessimistic'];
    const needsHelp = negativeEmotions.includes(emotion.toLowerCase());
    console.log(`Emotion: ${emotion}, Needs support: ${needsHelp}`);
    return needsHelp;
  };

  // Get multilingual chatbot response
  const getChatbotResponse = async (userMessage, userLanguage = 'english') => {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    const prompt = `You are a caring friend chatbot. The user is chatting with you in ${userLanguage}. Respond in the SAME language they are using. Be supportive, empathetic, and helpful. Keep responses short (1-2 sentences) and friendly.

IMPORTANT: 
- If userLanguage is "urdu", respond in Roman Urdu (using English alphabet)
- If userLanguage is "arabic", respond in Arabic
- If userLanguage is "english", respond in English
- Be a caring friend who listens and helps

User message: "${userMessage}"

Respond in ${userLanguage} language only. Be a caring friend.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 100,
            },
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you. How can I help?";
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      return "I'm here to listen. What's on your mind?";
    }
  };

  const handleSaveEntry = async () => {
    if (newEntry.trim()) {
      setIsAnalyzing(true);
      
      console.log('🔍 Analyzing text:', newEntry);
      
      try {
        // Analyze emotion and language using AI
        const analysis = await analyzeEmotion(newEntry);
        console.log('📊 Final analysis result:', analysis);
        
        const entry = {
          id: Date.now(),
          content: newEntry.trim(),
          timestamp: new Date().toISOString(),
          mood: analysis.emotion,
          language: analysis.language,
          wordCount: newEntry.trim().split(' ').length,
          emotionConfidence: Math.random() * 0.3 + 0.7 // Mock confidence score
        };

        const updatedEntries = [entry, ...journalEntries];
        saveEntries(updatedEntries);
        setNewEntry('');
        setIsWriting(false);
        
        // Show chatbot button if emotion is negative
        if (needsSupport(analysis.emotion)) {
          console.log('Negative emotion detected, showing chatbot button');
          
          // Apply adaptive theme based on emotion
          console.log('🎨 Applying adaptive theme for emotion:', analysis.emotion);
          applyAdaptiveTheme(analysis.emotion);
          
          setTimeout(() => {
            setShowChatbotButton(true);
            // Store the detected language for chatbot responses
            localStorage.setItem('neurocompanion-user-language', analysis.language);
          }, 2000);
        } else {
          console.log('Positive/neutral emotion, no chatbot needed');
        }
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        // Fallback to neutral emotion
        const entry = {
          id: Date.now(),
          content: newEntry.trim(),
          timestamp: new Date().toISOString(),
          mood: 'neutral',
          wordCount: newEntry.trim().split(' ').length,
          emotionConfidence: 0.5
        };
        const updatedEntries = [entry, ...journalEntries];
        saveEntries(updatedEntries);
        setNewEntry('');
        setIsWriting(false);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleUpdateEntry = async () => {
    if (newEntry.trim() && editingEntry) {
      setIsAnalyzing(true);
      
      try {
        const analysis = await analyzeEmotion(newEntry);
        
        const updatedEntries = journalEntries.map(entry => 
          entry.id === editingEntry.id 
            ? { 
                ...entry, 
                content: newEntry.trim(), 
                wordCount: newEntry.trim().split(' ').length,
                mood: analysis.emotion,
                language: analysis.language,
                emotionConfidence: Math.random() * 0.3 + 0.7
              }
            : entry
        );
        saveEntries(updatedEntries);
        setNewEntry('');
        setIsWriting(false);
        setEditingEntry(null);
        
        // Show chatbot button if emotion is negative
        if (needsSupport(analysis.emotion)) {
          console.log('Negative emotion detected, showing chatbot button');
          
          // Apply adaptive theme based on emotion
          console.log('🎨 Applying adaptive theme for emotion:', analysis.emotion);
          applyAdaptiveTheme(analysis.emotion);
          
          setTimeout(() => {
            setShowChatbotButton(true);
            localStorage.setItem('neurocompanion-user-language', analysis.language);
          }, 2000);
        } else {
          console.log('Positive/neutral emotion, no chatbot needed');
        }
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        const updatedEntries = journalEntries.map(entry => 
          entry.id === editingEntry.id 
            ? { ...entry, content: newEntry.trim(), wordCount: newEntry.trim().split(' ').length }
            : entry
        );
        saveEntries(updatedEntries);
        setNewEntry('');
        setIsWriting(false);
        setEditingEntry(null);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDeleteEntry = (entryId) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
    saveEntries(updatedEntries);
  };

  const handleChatbotSend = async () => {
    if (!chatbotInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: chatbotInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatbotMessages(prev => [...prev, userMessage]);
    setChatbotInput('');
    setIsTyping(true);

    try {
      // Get user's language from localStorage or detect from current message
      const storedLanguage = localStorage.getItem('neurocompanion-user-language') || 'english';
      const response = await getChatbotResponse(chatbotInput, storedLanguage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setTimeout(() => {
        setChatbotMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setIsTyping(false);
    }
  };

  const openChatbot = async () => {
    setShowChatbot(true);
    setShowChatbotButton(false);
    
    // Get user's language for personalized greeting
    const userLanguage = localStorage.getItem('neurocompanion-user-language') || 'english';
    
    const greetings = {
      'urdu': 'کیا سب کچھ ٹھیک ہے؟ آپ کیسے محسوس کر رہے ہیں؟ کیا آپ اس بارے میں بات کرنا چاہتے ہیں؟ میں یہاں ہوں۔ 💙',
      'arabic': 'هل كل شيء على ما يرام؟ كيف تشعر؟ هل تريد التحدث عن ذلك؟ أنا هنا. 💙',
      'english': "Is everything okay? How are you feeling? Do you want to talk about it? I'm here for you. 💙",
      'spanish': '¿Está todo bien? ¿Cómo te sientes? ¿Quieres hablar de ello? Estoy aquí para ti. 💙',
      'french': 'Est-ce que tout va bien? Comment te sens-tu? Veux-tu en parler? Je suis là pour toi. 💙'
    };
    
    const greeting = greetings[userLanguage] || greetings['english'];
    
    setChatbotMessages([
      {
        id: 1,
        text: greeting,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'text-green-500',
      sad: 'text-blue-500',
      angry: 'text-red-500',
      stressed: 'text-orange-500',
      anxious: 'text-yellow-500',
      depressed: 'text-purple-500',
      calm: 'text-indigo-500',
      excited: 'text-pink-500',
      worried: 'text-amber-500',
      confused: 'text-gray-500',
      lonely: 'text-slate-500',
      grateful: 'text-emerald-500',
      hopeful: 'text-cyan-500',
      frustrated: 'text-red-600',
      peaceful: 'text-teal-500',
      overwhelmed: 'text-rose-500',
      content: 'text-lime-500',
      nervous: 'text-yellow-600',
      optimistic: 'text-green-600',
      pessimistic: 'text-gray-600',
      neutral: 'text-gray-500'
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      stressed: '😰',
      anxious: '😟',
      depressed: '😔',
      calm: '😌',
      excited: '🤩',
      worried: '😥',
      confused: '🤔',
      lonely: '😞',
      grateful: '🙏',
      hopeful: '🌟',
      frustrated: '😤',
      peaceful: '☮️',
      overwhelmed: '😵',
      content: '😊',
      nervous: '😬',
      optimistic: '😄',
      pessimistic: '😕',
      neutral: '😐'
    };
    return emojis[mood] || emojis.neutral;
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: Smile,
      sad: Frown,
      angry: AlertCircle,
      stressed: Activity,
      anxious: Heart,
      depressed: Frown,
      calm: Heart,
      excited: Activity,
      worried: Heart,
      confused: Brain,
      lonely: Heart,
      grateful: Heart,
      hopeful: Heart,
      frustrated: AlertCircle,
      peaceful: Heart,
      overwhelmed: Activity,
      content: Smile,
      nervous: Heart,
      optimistic: Smile,
      pessimistic: Frown,
      neutral: Meh
    };
    const IconComponent = icons[mood] || icons.neutral;
    return <IconComponent className="h-4 w-4" />;
  };

  // Calculate mood statistics
  const getMoodStats = () => {
    const moodCounts = journalEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const totalEntries = journalEntries.length;
    const positiveMoods = ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful', 'content', 'optimistic'];
    const negativeMoods = ['sad', 'angry', 'stressed', 'anxious', 'depressed', 'worried', 'confused', 'lonely', 'frustrated', 'overwhelmed', 'nervous', 'pessimistic'];

    const positiveCount = Object.keys(moodCounts).reduce((sum, mood) => 
      positiveMoods.includes(mood) ? sum + moodCounts[mood] : sum, 0);
    const negativeCount = Object.keys(moodCounts).reduce((sum, mood) => 
      negativeMoods.includes(mood) ? sum + moodCounts[mood] : sum, 0);

    return {
      positive: totalEntries > 0 ? (positiveCount / totalEntries * 100).toFixed(1) : 0,
      negative: totalEntries > 0 ? (negativeCount / totalEntries * 100).toFixed(1) : 0,
      neutral: totalEntries > 0 ? ((totalEntries - positiveCount - negativeCount) / totalEntries * 100).toFixed(1) : 0
    };
  };

  const getWeeklyMoodData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayEntries = journalEntries.filter(entry => 
        entry.timestamp.split('T')[0] === date
      );
      
      const avgMood = dayEntries.length > 0 
        ? dayEntries.reduce((sum, entry) => {
            const moodScores = {
              happy: 5, excited: 5, grateful: 5, hopeful: 5, peaceful: 5, content: 5, optimistic: 5,
              calm: 4, neutral: 3,
              sad: 2, anxious: 2, worried: 2, confused: 2, lonely: 2, nervous: 2, pessimistic: 2,
              angry: 1, stressed: 1, depressed: 1, frustrated: 1, overwhelmed: 1
            };
            return sum + (moodScores[entry.mood] || 3);
          }, 0) / dayEntries.length
        : 3;

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        mood: avgMood,
        entries: dayEntries.length
      };
    }).reverse();
  };

  const moodStats = getMoodStats();
  const weeklyData = getWeeklyMoodData();

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3" style={{ color: 'var(--theme-text)' }}>
              <BookOpen className="h-8 w-8" style={{ color: 'var(--theme-primary)' }} />
              <span>Journal & AI Emotion Analysis</span>
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
              Express your thoughts and get AI-powered emotional insights
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Total Entries</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>{journalEntries.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Words Written</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                    {journalEntries.reduce((total, entry) => total + entry.wordCount, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>Positive Mood</p>
                  <p className="text-2xl font-bold text-green-500">{moodStats.positive}%</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-green-100">
                  <Smile className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>AI Analysis</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                    {journalEntries.length > 0 ? 'Active' : 'Ready'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Mood Analytics */}
          {journalEntries.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Mood Trend */}
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Weekly Mood Trend</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" />
                    <XAxis dataKey="date" stroke="var(--theme-text)" opacity={0.7} />
                    <YAxis stroke="var(--theme-text)" opacity={0.7} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--theme-card)', 
                        borderColor: 'var(--theme-border)', 
                        borderRadius: '0.75rem' 
                      }}
                      labelStyle={{ color: 'var(--theme-text)' }}
                      itemStyle={{ color: 'var(--theme-text)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="var(--theme-primary)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--theme-primary)', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mood Distribution */}
              <div 
                className="rounded-2xl p-6 shadow-lg border"
                style={{ 
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                  <span>Mood Distribution</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span style={{ color: 'var(--theme-text)' }}>Positive</span>
                    </div>
                    <span className="font-bold text-green-500">{moodStats.positive}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span style={{ color: 'var(--theme-text)' }}>Neutral</span>
                    </div>
                    <span className="font-bold text-gray-500">{moodStats.neutral}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span style={{ color: 'var(--theme-text)' }}>Negative</span>
                    </div>
                    <span className="font-bold text-red-500">{moodStats.negative}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Writing Section */}
          <div 
            className="rounded-2xl p-8 shadow-lg border"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>Write Your Thoughts</h2>
              {!isWriting && (
                <motion.button
                  onClick={() => setIsWriting(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  <span>New Entry</span>
                </motion.button>
              )}
            </div>

            {isWriting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="How are you feeling today? What's on your mind? Write in any language..."
                  className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    {newEntry.trim().split(' ').length} words
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsWriting(false);
                        setNewEntry('');
                        setEditingEntry(null);
                      }}
                      className="px-4 py-2 opacity-70 hover:opacity-100 transition-colors"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={editingEntry ? handleUpdateEntry : handleSaveEntry}
                      disabled={isAnalyzing}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span>{editingEntry ? 'Update' : 'Save'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Journal Entries */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>Recent Entries</h2>
            
            {journalEntries.length === 0 ? (
              <div 
                className="rounded-2xl p-8 shadow-lg border text-center"
                style={{ 
                  backgroundColor: 'var(--theme-card)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--theme-text)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>No entries yet</h3>
                <p className="opacity-70 mb-4" style={{ color: 'var(--theme-text)' }}>Start writing to track your thoughts and feelings</p>
                <button
                  onClick={() => setIsWriting(true)}
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  Write Your First Entry
                </button>
              </div>
            ) : (
              journalEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className="rounded-2xl p-6 shadow-lg border"
                  style={{ 
                    backgroundColor: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>{formatDate(entry.timestamp)}</p>
                        <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-2 opacity-70 hover:opacity-100 transition-colors"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 opacity-70 hover:opacity-100 transition-colors"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="opacity-90 leading-relaxed mb-3" style={{ color: 'var(--theme-text)' }}>{entry.content}</p>
                  <div className="flex items-center justify-between text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                    <div className="flex items-center space-x-3">
                      <span>{entry.wordCount} words</span>
                      {/* Language indicator */}
                      {entry.language && entry.language !== 'english' && (
                        <div className="text-xs px-2 py-1 rounded-full" style={{ 
                          backgroundColor: 'var(--theme-secondary)', 
                          color: 'var(--theme-text)' 
                        }}>
                          {entry.language.charAt(0).toUpperCase() + entry.language.slice(1)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(entry.mood)}
                      <span className={`font-medium ${getMoodColor(entry.mood)}`}>
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </span>
                      <span className="text-xs opacity-50">
                        ({(entry.emotionConfidence * 100).toFixed(0)}% confidence)
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Chatbot Button with Message */}
      <AnimatePresence>
        {showChatbotButton && !showChatbot && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-50"
          >
            {/* Message Bubble */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-2 px-4 py-2 rounded-2xl shadow-lg border max-w-xs"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                Is everything okay? 💙
              </p>
              <p className="text-xs opacity-70 mt-1" style={{ color: 'var(--theme-text)' }}>
                I'm here if you want to talk
              </p>
            </motion.div>
            
            {/* Chatbot Button */}
            <motion.button
              onClick={openChatbot}
              className="w-16 h-16 rounded-full shadow-2xl border flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--theme-primary)',
                borderColor: 'var(--theme-border)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bot className="h-8 w-8 text-white" />
              {/* Gentle pulsing animation */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'var(--theme-primary)' }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.3, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small Chatbot Assistant */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-24 right-6 w-80 h-80 rounded-2xl shadow-2xl border z-50 flex flex-col"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
          >
            {/* Chatbot Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--theme-text)' }}>Support Buddy</h3>
                  <p className="text-xs opacity-70" style={{ color: 'var(--theme-text)' }}>I'm here to help</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChatbot(false);
                  // Don't hide the button, let it stay visible
                }}
                className="p-1 opacity-70 hover:opacity-100 transition-colors"
                style={{ color: 'var(--theme-text)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatbotMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatbotInput}
                  onChange={(e) => setChatbotInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'var(--theme-card)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatbotSend()}
                  disabled={isTyping}
                />
                <button
                  onClick={handleChatbotSend}
                  disabled={!chatbotInput.trim() || isTyping}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Journal;