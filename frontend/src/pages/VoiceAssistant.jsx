import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot, User, Heart, Brain, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const VoiceAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your NeuroCompanion voice assistant. I'm here to support you with empathy and understanding. How are you feeling today?",
      sender: 'assistant',
      timestamp: new Date(),
      type: 'greeting'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for speech recognition support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak now!');
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        setInputText(transcript);
        
        // Don't auto-send, let user review and send manually
        toast.success('Speech converted to text! Review and send when ready.');
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch(event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            toast.error('Microphone not accessible. Please check permissions.');
            break;
          case 'not-allowed':
            toast.error('Microphone permission denied. Please allow microphone access.');
            break;
          default:
            toast.error('Speech recognition failed. Please try again.');
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setSpeechSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const getTherapeuticResponse = async (userMessage) => {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    // Enhanced therapeutic prompt
    const therapeuticPrompt = `You are Dr. Sarah, a compassionate and experienced mental health therapist and doctor. The user has shared: "${userMessage}"

As Dr. Sarah, respond with:
1. Empathetic acknowledgment of their feelings
2. Professional guidance and coping strategies
3. Practical steps they can take right now
4. Gentle encouragement and support
5. Only recommend professional help if the situation is severe or dangerous

Your response should be:
- Warm and understanding (2-3 sentences)
- Actionable and helpful
- Professional but not clinical
- Focused on immediate support and guidance

Remember: You ARE the doctor/therapist they're talking to. Provide direct help and guidance, don't just refer them elsewhere unless absolutely necessary.`;

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
                parts: [{ text: therapeuticPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I understand you're going through a difficult time. Remember, it's okay to feel this way, and reaching out for support is a sign of strength.";
    } catch (error) {
      console.error('Error getting therapeutic response:', error);
      return "I'm here to listen and support you. Your feelings are valid, and it's important to take care of yourself. Would you like to talk more about what's on your mind?";
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await getTherapeuticResponse(textToSend);
      
      const assistantMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'therapeutic'
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500); // Simulate typing delay

    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
    }
  };

  const handleStartListening = () => {
    if (!speechSupported) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start speech recognition. Please try again.');
      }
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleQuickResponse = async (response) => {
    const userMessage = {
      id: Date.now(),
      text: response,
      sender: 'user',
      timestamp: new Date(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    try {
      const aiResponse = await getTherapeuticResponse(response);
      const assistantMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'therapeutic'
      };
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I'm having trouble sleeping",
    "I feel overwhelmed",
    "I'm feeling lonely",
    "I need coping strategies",
    "I want to talk about my mood"
  ];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3" style={{ color: 'var(--theme-text)' }}>
              <Brain className="h-8 w-8" style={{ color: 'var(--theme-primary)' }} />
              <span>Voice Assistant & Therapeutic Support</span>
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--theme-text)' }}>
              Your compassionate AI companion for mental health support
            </p>
          </div>

          {/* Voice Interface - Simplified */}
          <div 
            className="rounded-2xl p-6 shadow-lg border text-center"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
                Voice Assistant & Therapeutic Support
              </h2>
              <p className="opacity-70" style={{ color: 'var(--theme-text)' }}>
                {speechSupported 
                  ? 'Speak or type your thoughts - I\'m here to listen and help'
                  : 'Type your thoughts below - I\'m here to listen and help'
                }
              </p>
            </div>
          </div>

          {/* Chat Container */}
          <div className="card h-96 flex flex-col" style={{ backgroundColor: 'var(--theme-card)' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Conversation History</h3>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-blue-500' 
                          : message.type === 'therapeutic' 
                            ? 'bg-green-500' 
                            : 'bg-gray-500'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Heart className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.type === 'therapeutic'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-100'
                      }`}>
                        <p className={`text-sm ${
                          message.sender === 'user' 
                            ? 'text-white' 
                            : message.type === 'therapeutic'
                              ? 'text-green-800'
                              : 'text-gray-800'
                        }`}>
                          {message.text}
                        </p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Area at Bottom */}
            <div className="border-t p-4" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Share how you're feeling or what's on your mind..."
                    className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      backgroundColor: 'var(--theme-card)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isTyping}
                  />
                  
                  {/* Small microphone icon */}
                  <button
                    onClick={isListening ? handleStopListening : handleStartListening}
                    disabled={!speechSupported || isTyping}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : speechSupported
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? (
                      <MicOff size={16} />
                    ) : (
                      <Mic size={16} />
                    )}
                  </button>
                  
                  {/* Listening indicator */}
                  {isListening && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-red-500 animate-pulse"></div>
                    </div>
                  )}
                </div>
                
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Quick Responses */}
          <div 
            className="rounded-2xl p-6 shadow-lg border"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--theme-text)' }}>
              <MessageCircle className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
              <span>Quick Responses</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickResponses.map((response, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="btn-secondary text-left p-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {response}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VoiceAssistant;