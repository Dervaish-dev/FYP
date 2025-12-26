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
  CheckCircle2,
  Tag,
  TrendingDown,
  Zap,
  Target,
  Mic
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { buildUserContextString } from '../utils/userPreferences';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { journalAPI } from '../utils/api';
import VoiceJournalButton from '../components/VoiceJournalButton';
import ConfirmationModal from '../components/ConfirmationModal';

const Journal = () => {
  const { applyAdaptiveTheme } = useTheme();
  const { user } = useAuth(); // Use authenticated user
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChatbotButton, setShowChatbotButton] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    entryId: null,
    entryTitle: ''
  });

  // Load journal entries from API - extracted as reusable function
  const loadJournalEntries = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const entries = await journalAPI.listByUser(user.id);
      // Additional safety check for the data structure
      console.log('Backend response:', entries);
      setJournalEntries(Array.isArray(entries) ? entries : []);
    } catch (err) {
      console.error('Error loading journal entries:', err);
      setError('Failed to load your journal. Please check your connection.');
      // Initialize with empty array to prevent map errors
      setJournalEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load journal entries on mount
  useEffect(() => {
    loadJournalEntries();
  }, [user]);

  // AI Emotion Analysis using Gemini API with language detection
  const analyzeEmotion = async (text) => {
    try {
      // Support both Vite and standard env vars safely
      let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey && typeof process !== 'undefined' && process.env) {
        apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      }

      if (!apiKey) {
        console.error("❌ API Key missing! Check .env file for VITE_GEMINI_API_KEY");
      }

      // First check for critical negative keywords - bypass AI if found
      const lowerText = text.toLowerCase();

      // Comprehensive Keyword Check (Run this FIRST for speed and safety)
      // NOTE: We only keep CRITICAL safety keywords here. For general emotions (happy, sad, etc),
      // we rely entirely on the AI model as per user request for better nuance.
      const keywords = {
        critical: ['kill myself', 'suicide', 'suicidal', 'die', 'death', 'end it all', 'not worth living', 'main mar jaon', 'khudkushi'],
      };

      // Detect Roman Urdu
      const romanUrduKeywords = ['main', 'app', 'kia', 'merai', 'sath', 'hua', 'hun', 'hai', 'kya', 'kyun', 'kaise', 'gaya'];
      const isRomanUrdu = romanUrduKeywords.some(keyword => lowerText.includes(keyword));
      const detectedLanguage = isRomanUrdu ? 'urdu' : 'english';

      // Priority check: If any HIGH SEVERITY keywords are found, return immediately without API
      // This stops "Neutral" results for serious topics like "death" or "suicide"
      const criticalList = [...keywords.critical];
      for (const keyword of criticalList) {
        if (lowerText.includes(keyword)) {
          console.log(`🚨 CRITICAL SAFETY KEYWORD DETECTED: "${keyword}"`);
          return { emotion: 'depressed', language: detectedLanguage, intensity: 95 };
        }
      }

      const userContext = buildUserContextString();

      // Simple, direct prompt as requested
      const prompt = `Analyze the following text: "${text}"

      Identify:
      1. Language (English, Urdu, Arabic, etc.)
      2. Sentiment Category (Positive, Negative, Neutral)
      3. Specific Emotion (e.g. happy, sad, angry, stressed, anxious, grateful, etc.)
      4. Intensity (0-100)

      Return ONLY JSON:
      {
        "language": "detected_language",
        "sentiment": "positive/negative/neutral",
        "emotion": "specific_emotion",
        "intensity": number
      }`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                temperature: 0.7, // Increased from 0.1 to allow more nuance/inference
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 100,
                responseMimeType: "application/json"
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
          console.log('Parsed emotion:', parsed.emotion, 'Language:', parsed.language, 'Intensity:', parsed.intensity);

          // Aggressive fallback check for clearly negative text
          const lowerText = text.toLowerCase();
          const suicidalKeywords = ['kill myself', 'suicide', 'suicidal', 'die', 'death', 'end it all', 'not worth living', 'main mar jaon', 'khudkushi'];
          const depressionKeywords = ['depressed', 'depression', 'alone', 'lonely', 'useless', 'worthless', 'hopeless', 'empty', 'udaas', 'bekar', 'akela'];
          let finalEmotion = parsed.emotion?.toLowerCase() || 'neutral';

          return {
            emotion: finalEmotion,
            language: parsed.language?.toLowerCase() || 'english',
            intensity: parsed.intensity || 80
          };
        } catch (parseError) {
          console.error('Error parsing emotion response:', parseError);
          return { emotion: 'neutral', language: 'english' };
        }
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        console.error('Error details:', error.message);

        // API FAILURE FALLBACK
        // If API fails, we only check for CRITICAL safety keywords.
        // Otherwise we return neutral to avoid false positives.
        const lowerText = text.toLowerCase();

        for (const k of keywords.critical) {
          if (lowerText.includes(k)) {
            return { emotion: 'depressed', language: 'english', intensity: 90 };
          }
        }

        // Default fallback
        return { emotion: 'neutral', language: 'english', intensity: 50 };
      }
    } catch (criticalError) {
      console.error("Critical Safety Error in analyzeEmotion:", criticalError);
      return { emotion: 'neutral', language: 'english', intensity: 50 };
    }
  };

  // Fallback keyword-based emotion detection when AI analysis fails
  const detectEmotionFromKeywords = (text) => {
    const lowerText = text.toLowerCase();
    
    const emotionKeywords = {
      happy: ['happy', 'joyful', 'great', 'wonderful', 'amazing', 'excellent', 'fantastic', 'good day', 'blessed', 'thankful', 'love', 'enjoyed'],
      sad: ['sad', 'unhappy', 'down', 'blue', 'upset', 'miserable', 'depressed', 'sorry', 'lonely', 'alone'],
      stressed: ['stressed', 'stressed out', 'pressure', 'overwhelmed', 'burden', 'anxiety', 'anxious', 'worried', 'concerned'],
      angry: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated', 'rage', 'hate'],
      calm: ['calm', 'peaceful', 'relaxed', 'serene', 'at peace', 'meditated', 'mindful'],
      excited: ['excited', 'thrilled', 'energized', 'pumped', 'enthusiastic', 'looking forward'],
      grateful: ['grateful', 'thankful', 'appreciate', 'blessed', 'grateful for'],
      hopeful: ['hopeful', 'positive', 'optimistic', 'believe', 'will improve', 'getting better']
    };

    let detectedEmotion = 'neutral';
    let maxMatches = 0;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedEmotion = emotion;
      }
    }

    console.log(`🔍 Keyword detection: "${text.substring(0, 40)}..." → ${detectedEmotion}`);
    
    return {
      emotion: detectedEmotion,
      language: 'english',
      intensity: maxMatches > 0 ? Math.min(95, 50 + (maxMatches * 15)) : 50
    };
  };

  // Check if emotion needs chatbot intervention
  const needsSupport = (emotion) => {
    const negativeEmotions = ['sad', 'angry', 'stressed', 'anxious', 'depressed', 'worried', 'confused', 'lonely', 'frustrated', 'overwhelmed', 'nervous', 'pessimistic'];
    const needsHelp = negativeEmotions.includes(emotion.toLowerCase());
    console.log(`Emotion: ${emotion}, Needs support: ${needsHelp}`);
    return needsHelp;
  };

  // Get multilingual chatbot response using Gemini API
  const getChatbotResponse = async (userMessage, userLanguage = 'english') => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyADqMDfILhOQvcWyAFFhpvRrxp_BQ_FSXY";

    console.log('🤖 Chatbot API call started:', { userMessage, userLanguage, apiKey: apiKey.substring(0, 10) + '...' });

    const prompt = `You are a caring, empathetic AI friend. The user is chatting with you in ${userLanguage}. Respond in the SAME language they are using. Be supportive, understanding, and helpful. Keep responses conversational and warm (2-3 sentences max).

IMPORTANT: 
- If userLanguage is "urdu", respond in Roman Urdu (using English alphabet)
- If userLanguage is "arabic", respond in Arabic  
- If userLanguage is "english", respond in English
- Be a caring friend who listens and provides emotional support
- Don't give medical advice, just be supportive

User message: "${userMessage}"

Respond in ${userLanguage} language only. Be warm and supportive.`;

    try {
      console.log('📡 Making API request to Gemini...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: 150,
            },
          }),
        }
      );

      console.log('📡 API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 API response data:', data);

      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (generatedText.trim()) {
        console.log('✅ Generated response:', generatedText.trim());
        return generatedText.trim();
      } else {
        console.error('❌ No text generated in response');
        throw new Error('No response generated');
      }
    } catch (error) {
      console.error('❌ Chatbot API error:', error);

      // Fallback responses based on language
      const fallbackResponses = {
        'urdu': [
          "Main yahan hun aapke liye. Aap apni feelings share kar sakte hain.",
          "Sab theek ho jayega. Main aapke saath hun.",
          "Aapko koi baat pareshan kar rahi hai? Main sun raha hun."
        ],
        'arabic': [
          "أنا هنا من أجلك. يمكنك مشاركة مشاعرك معي.",
          "كل شيء سيكون على ما يرام. أنا معك.",
          "هل هناك شيء يزعجك؟ أنا أستمع إليك."
        ],
        'english': [
          "I'm here for you. You can share your feelings with me.",
          "Everything will be okay. I'm with you.",
          "Is something bothering you? I'm listening."
        ]
      };

      const responses = fallbackResponses[userLanguage] || fallbackResponses['english'];
      const fallbackResponse = responses[Math.floor(Math.random() * responses.length)];
      console.log('🔄 Using fallback response:', fallbackResponse);
      return fallbackResponse;
    }
  };

  const handleSaveEntry = async () => {
    if (!newEntry.trim()) return;

    setIsAnalyzing(true);
    console.log('� Saving entry to backend for AI analysis:', newEntry.substring(0, 50) + '...');

    try {
      // ✅ Let backend do the emotion analysis with detailed AI prompt
      // Frontend just sends the raw content, no emotion detection here
      const entryData = {
        userId: user.id,
        content: newEntry.trim(),
        // Removed: emotion (let backend analyze)
        // Removed: emotionConfidence (let backend detect)
        // Removed: analyzeEmotion() call (too unreliable on frontend)
        language: 'english',
        mood: 5, // Default mood scale
        tags: []
      };

      console.log('📤 Sending entry to backend:', entryData);
      const createdEntry = await journalAPI.create(entryData);

      if (createdEntry && (createdEntry.id || createdEntry._id)) {
        console.log('✅ Entry saved with backend emotion analysis:', {
          emotion: createdEntry.emotion,
          confidence: createdEntry.emotionConfidence,
          stressLevel: createdEntry.stressLevel
        });

        setJournalEntries(prev => [createdEntry, ...(prev || [])]);
        setNewEntry('');
        setIsWriting(false);

        // Show chatbot button if backend detected negative emotion
        if (createdEntry.emotion && needsSupport(createdEntry.emotion)) {
          applyAdaptiveTheme(createdEntry.emotion);
          setTimeout(() => {
            setShowChatbotButton(true);
            localStorage.setItem('neurocompanion-user-language', 'english');
          }, 2000);
        }
      } else {
        throw new Error('Invalid entry data returned from API');
      }

    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save journal entry. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (newEntry.trim() && editingEntry) {
      setIsAnalyzing(true);

      try {
        // ✅ Let backend re-analyze emotion with detailed AI prompt
        const updateData = {
          content: newEntry.trim(),
          // Removed: emotion (let backend analyze)
          // Removed: language (backend will detect)
        };

        console.log('📝 Updating entry, backend will re-analyze emotion');
        const updatedEntry = await journalAPI.update(editingEntry.id || editingEntry._id, updateData);

        setJournalEntries(prev => prev.map(entry =>
          (entry.id === editingEntry.id || entry._id === editingEntry._id) ? updatedEntry : entry
        ));

        setNewEntry('');
        setIsWriting(false);
        setEditingEntry(null);

        // Show chatbot button if backend detected negative emotion
        if (updatedEntry.emotion && needsSupport(updatedEntry.emotion)) {
          console.log('Negative emotion detected, showing chatbot button');
          applyAdaptiveTheme(updatedEntry.emotion);

          setTimeout(() => {
            setShowChatbotButton(true);
            localStorage.setItem('neurocompanion-user-language', 'english');
          }, 2000);
        }
      } catch (error) {
        console.error('Error updating:', error);
        // Fallback update
        try {
          const updateData = { content: newEntry.trim() };
          const updatedEntry = await journalAPI.update(editingEntry.id || editingEntry._id, updateData);
          setJournalEntries(prev => prev.map(entry =>
            (entry.id === editingEntry.id || entry._id === editingEntry._id) ? updatedEntry : entry
          ));
        } catch (e) {
          console.error('Failed fallback update', e);
        }
        setNewEntry('');
        setIsWriting(false);
        setEditingEntry(null);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleDeleteEntry = (entryId) => {
    const entry = journalEntries.find(e => e.id === entryId || e._id === entryId);
    setDeleteConfirmModal({
      isOpen: true,
      entryId,
      entryTitle: entry?.title || new Date(entry?.createdAt || Date.now()).toLocaleDateString() || 'This entry'
    });
  };

  const confirmDeleteEntry = async () => {
    const { entryId } = deleteConfirmModal;
    try {
      await journalAPI.delete(entryId);
      setJournalEntries(prev => prev.filter(entry => entry.id !== entryId && entry._id !== entryId));
      setDeleteConfirmModal({ isOpen: false, entryId: null, entryTitle: '' });
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry(entry.content);
    setIsWriting(true);
  };

  const handleChatbotSend = async () => {
    if (!chatbotInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: chatbotInput,
      sender: 'user',
      timestamp: new Date()
    };

    // Store the input before clearing it
    const messageText = chatbotInput.trim();

    setChatbotMessages(prev => [...prev, userMessage]);
    setChatbotInput('');
    setIsTyping(true);

    try {
      // Get user's language from localStorage or detect from current message
      const storedLanguage = localStorage.getItem('neurocompanion-user-language') || 'english';
      console.log('Sending message to chatbot:', messageText, 'Language:', storedLanguage);

      const response = await getChatbotResponse(messageText, storedLanguage);
      console.log('Received chatbot response:', response);

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

      // Add fallback message
      const fallbackMessage = {
        id: Date.now() + 1,
        text: "I'm here for you. How can I help you feel better?",
        sender: 'bot',
        timestamp: new Date()
      };

      setTimeout(() => {
        setChatbotMessages(prev => [...prev, fallbackMessage]);
        setIsTyping(false);
      }, 1000);
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
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
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
      // Use emotion for stats grouping, fallback to 'neutral'
      const emotion = entry.emotion || 'neutral';
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    // Debug: Log emotion distribution
    console.log('📊 Mood Distribution Debug:', {
      totalEntries: journalEntries.length,
      emotions: moodCounts,
      sampleEntries: journalEntries.slice(0, 3).map(e => ({ emotion: e.emotion, content: e.content?.substring(0, 30) }))
    });

    const totalEntries = journalEntries.length;
    const positiveMoods = ['happy', 'calm', 'excited', 'grateful', 'hopeful', 'peaceful', 'content', 'optimistic'];
    const negativeMoods = ['sad', 'angry', 'stressed', 'anxious', 'depressed', 'worried', 'confused', 'lonely', 'frustrated', 'overwhelmed', 'nervous', 'pessimistic'];

    const positiveCount = Object.keys(moodCounts).reduce((sum, mood) =>
      positiveMoods.includes(mood) ? sum + moodCounts[mood] : sum, 0);
    const negativeCount = Object.keys(moodCounts).reduce((sum, mood) =>
      negativeMoods.includes(mood) ? sum + moodCounts[mood] : sum, 0);

    const result = {
      positive: totalEntries > 0 ? (positiveCount / totalEntries * 100).toFixed(1) : 0,
      negative: totalEntries > 0 ? (negativeCount / totalEntries * 100).toFixed(1) : 0,
      neutral: totalEntries > 0 ? ((totalEntries - positiveCount - negativeCount) / totalEntries * 100).toFixed(1) : 0
    };

    console.log('📈 Mood Stats Result:', result);
    return result;
  };

  const getWeeklyMoodData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayEntries = journalEntries.filter(entry => {
        const entryDate = entry.createdAt || entry.timestamp;
        if (!entryDate) return false;
        const d = new Date(entryDate);
        if (isNaN(d.getTime())) return false;
        return d.toISOString().split('T')[0] === date;
      });

      const avgMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => {
          // If mood is already a number (from DB), use it. otherwise map emotion string to score.
          if (typeof entry.mood === 'number') return sum + entry.mood;

          const moodScores = {
            happy: 5, excited: 5, grateful: 5, hopeful: 5, peaceful: 5, content: 5, optimistic: 5,
            calm: 4, neutral: 3,
            sad: 2, anxious: 2, worried: 2, confused: 2, lonely: 2, nervous: 2, pessimistic: 2,
            angry: 1, stressed: 1, depressed: 1, frustrated: 1, overwhelmed: 1
          };
          return sum + (moodScores[entry.emotion || 'neutral'] || 3);
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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 animate-pulse">Loading your journal...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
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
                      {journalEntries.reduce((total, entry) => total + (entry.content?.trim().split(/\s+/).length || 0), 0)}
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

                {/* Mood Distribution - Fixed Pie Chart */}
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: parseFloat(moodStats.positive), color: '#10B981' },
                            { name: 'Neutral', value: parseFloat(moodStats.neutral), color: '#6B7280' },
                            { name: 'Negative', value: parseFloat(moodStats.negative), color: '#EF4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Positive', value: parseFloat(moodStats.positive), color: '#10B981' },
                            { name: 'Neutral', value: parseFloat(moodStats.neutral), color: '#6B7280' },
                            { name: 'Negative', value: parseFloat(moodStats.negative), color: '#EF4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--theme-card)',
                            borderColor: 'var(--theme-border)',
                            borderRadius: '0.75rem',
                            color: 'var(--theme-text)'
                          }}
                        />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold" fill="var(--theme-primary)">
                          {moodStats.positive}%
                        </text>
                        <legend />
                      </PieChart>
                    </ResponsiveContainer>
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
                  <div className="flex items-center gap-3">
                    <VoiceJournalButton 
                      userId={user.id}
                      onCallComplete={loadJournalEntries}
                    />
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
                  </div>
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
                        {/* Use emotion for emoji lookup, not numeric mood */}
                        <span className="text-2xl">{getMoodEmoji(entry.emotion || 'neutral')}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>
                              {formatDate(entry.createdAt || entry.timestamp)}
                            </p>
                            {/* Voice entry indicator */}
                            {entry.isVoiceEntry && (
                              <span 
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                style={{
                                  backgroundColor: 'var(--theme-primary)',
                                  color: 'white',
                                  opacity: 0.9
                                }}
                              >
                                <Mic size={12} />
                                <span>Voice</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                              {formatTime(entry.createdAt || entry.timestamp)}
                            </p>
                            {/* Voice duration */}
                            {entry.isVoiceEntry && entry.voiceDuration && (
                              <span className="text-xs opacity-50" style={{ color: 'var(--theme-text)' }}>
                                • {Math.floor(entry.voiceDuration / 60)}:{String(entry.voiceDuration % 60).padStart(2, '0')}
                              </span>
                            )}
                          </div>
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
                    <p className="opacity-90 leading-relaxed mb-4" style={{ color: 'var(--theme-text)' }}>{entry.content}</p>
                    
                    {/* AI Analysis Section */}
                    {entry.aiAnalysis && (
                      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex items-start space-x-2">
                          <Brain size={16} className="mt-1 opacity-70" style={{ color: 'var(--theme-text)' }} />
                          <p className="text-sm opacity-80" style={{ color: 'var(--theme-text)' }}>{entry.aiAnalysis}</p>
                        </div>
                      </div>
                    )}

                    {/* Topics */}
                    {entry.topics && entry.topics.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Tag size={14} className="opacity-70" style={{ color: 'var(--theme-text)' }} />
                          <span className="text-xs font-semibold opacity-70" style={{ color: 'var(--theme-text)' }}>Topics</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {entry.topics.slice(0, 6).map((topic, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: 'var(--theme-primary)',
                                color: 'white',
                                opacity: 0.9
                              }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {entry.keywords && entry.keywords.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target size={14} className="opacity-70" style={{ color: 'var(--theme-text)' }} />
                          <span className="text-xs font-semibold opacity-70" style={{ color: 'var(--theme-text)' }}>Key Insights</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {entry.keywords.slice(0, 5).map((kw, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full border"
                              style={{
                                borderColor: 'var(--theme-border)',
                                color: 'var(--theme-text)',
                                opacity: 0.7 + (kw.relevance || 0.5) * 0.3
                              }}
                            >
                              {kw.word} <span className="opacity-50">•</span> {((kw.relevance || 0) * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stress Indicators */}
                    {(entry.stressLevel || entry.stressTriggers?.length > 0) && (
                      <div className="mb-3 p-3 rounded-lg" style={{
                        backgroundColor: entry.stressLevel === 'high' ? 'rgba(239, 68, 68, 0.1)' :
                                       entry.stressLevel === 'medium' ? 'rgba(251, 191, 36, 0.1)' :
                                       'rgba(34, 197, 94, 0.1)'
                      }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Activity size={14} style={{
                              color: entry.stressLevel === 'high' ? '#ef4444' :
                                     entry.stressLevel === 'medium' ? '#f59e0b' : '#22c55e'
                            }} />
                            <span className="text-xs font-semibold" style={{
                              color: entry.stressLevel === 'high' ? '#ef4444' :
                                     entry.stressLevel === 'medium' ? '#f59e0b' : '#22c55e'
                            }}>
                              Stress: {entry.stressLevel || 'low'} {entry.stressScore !== undefined && `(${entry.stressScore}/10)`}
                            </span>
                          </div>
                          {entry.emotionalIntensity !== undefined && (
                            <div className="flex items-center space-x-1">
                              <Zap size={12} className="opacity-70" style={{ color: 'var(--theme-text)' }} />
                              <span className="text-xs opacity-70" style={{ color: 'var(--theme-text)' }}>
                                Intensity: {entry.emotionalIntensity}/10
                              </span>
                            </div>
                          )}
                        </div>
                        {entry.stressTriggers && entry.stressTriggers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {entry.stressTriggers.slice(0, 4).map((trigger, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: 'rgba(0,0,0,0.2)',
                                  color: 'var(--theme-text)',
                                  opacity: 0.8
                                }}
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm opacity-70" style={{ color: 'var(--theme-text)' }}>
                      <div className="flex items-center space-x-3">
                        <span>{entry.content?.trim().split(/\s+/).length || 0} words</span>
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
                        {getMoodIcon(entry.emotion || 'neutral')}
                        <span className={`font-medium ${getMoodColor(entry.emotion || 'neutral')}`}>
                          {(entry.emotion || 'neutral').charAt(0).toUpperCase() + (entry.emotion || 'neutral').slice(1)}
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
      )}

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

            {/* Chatbot Button - No Animation */}
            <motion.button
              onClick={openChatbot}
              className="w-16 h-16 rounded-full shadow-lg border flex items-center justify-center relative"
              style={{
                backgroundColor: 'var(--theme-primary)',
                borderColor: 'var(--theme-border)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="h-8 w-8 text-white" />
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
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.sender === 'user'
                    ? 'text-white'
                    : 'text-white'
                    }`}
                    style={{
                      backgroundColor: message.sender === 'user'
                        ? 'var(--theme-primary)'
                        : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'var(--theme-border)',
                      border: '1px solid'
                    }}>
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
                  <div
                    className="px-3 py-2 rounded-lg text-sm text-white"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'var(--theme-border)',
                      border: '1px solid'
                    }}
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                  className="px-3 py-2 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        title="Delete Journal Entry"
        message={`Are you sure you want to delete "${deleteConfirmModal.entryTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEntry}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, entryId: null, entryTitle: '' })}
        type="error"
        isDangerous={true}
      />
    </div>
  );
};

export default Journal;