import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Heart,
  Calendar,
  Clock
} from 'lucide-react';

const Journal = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);

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

  const handleSaveEntry = () => {
    if (newEntry.trim()) {
      const entry = {
        id: Date.now(),
        content: newEntry.trim(),
        timestamp: new Date().toISOString(),
        mood: 'neutral', // This would be detected by AI in real implementation
        wordCount: newEntry.trim().split(' ').length
      };

      const updatedEntries = [entry, ...journalEntries];
      saveEntries(updatedEntries);
      setNewEntry('');
      setIsWriting(false);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry(entry.content);
    setIsWriting(true);
  };

  const handleUpdateEntry = () => {
    if (newEntry.trim() && editingEntry) {
      const updatedEntries = journalEntries.map(entry => 
        entry.id === editingEntry.id 
          ? { ...entry, content: newEntry.trim(), wordCount: newEntry.trim().split(' ').length }
          : entry
      );
      saveEntries(updatedEntries);
      setNewEntry('');
      setIsWriting(false);
      setEditingEntry(null);
    }
  };

  const handleDeleteEntry = (entryId) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
    saveEntries(updatedEntries);
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
      stressed: 'text-red-500',
      calm: 'text-purple-500',
      neutral: 'text-gray-500'
    };
    return colors[mood] || colors.neutral;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      stressed: '😰',
      calm: '😌',
      neutral: '😐'
    };
    return emojis[mood] || emojis.neutral;
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              Journal & NLP Analysis
            </h1>
            <p className="text-lg opacity-70" style={{ color: 'var(--text-color)' }}>
              Express your thoughts and feelings
            </p>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Total Entries</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{journalEntries.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                  <BookOpen className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Words Written</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                    {journalEntries.reduce((total, entry) => total + entry.wordCount, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                  <Edit3 className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>This Week</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                    {journalEntries.filter(entry => {
                      const entryDate = new Date(entry.timestamp);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return entryDate >= weekAgo;
                    }).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                  <Calendar className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>

            <div 
              className="rounded-2xl p-6 shadow-lg border"
              style={{ 
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>Avg. Mood</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>😊</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-100)' }}>
                  <Heart className="h-6 w-6" style={{ color: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Writing Section */}
          <div 
            className="rounded-2xl p-8 shadow-lg border"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Write Your Thoughts</h2>
              {!isWriting && (
                <motion.button
                  onClick={() => setIsWriting(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--accent-color)' }}
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
                  placeholder="How are you feeling today? What's on your mind?"
                  className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ 
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-color)'
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
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
                      style={{ color: 'var(--text-color)' }}
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={editingEntry ? handleUpdateEntry : handleSaveEntry}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: 'var(--accent-color)' }}
                    >
                      <Save size={18} />
                      <span>{editingEntry ? 'Update' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Journal Entries */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Recent Entries</h2>
            
            {journalEntries.length === 0 ? (
              <div 
                className="rounded-2xl p-8 shadow-lg border text-center"
                style={{ 
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-color)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>No entries yet</h3>
                <p className="opacity-70 mb-4" style={{ color: 'var(--text-color)' }}>Start writing to track your thoughts and feelings</p>
                <button
                  onClick={() => setIsWriting(true)}
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--accent-color)' }}
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
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{formatDate(entry.timestamp)}</p>
                        <p className="text-sm opacity-70" style={{ color: 'var(--text-color)' }}>{formatTime(entry.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-2 opacity-70 hover:opacity-100 transition-colors"
                        style={{ color: 'var(--text-color)' }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 opacity-70 hover:opacity-100 transition-colors"
                        style={{ color: 'var(--text-color)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="opacity-90 leading-relaxed mb-3" style={{ color: 'var(--text-color)' }}>{entry.content}</p>
                  <div className="flex items-center justify-between text-sm opacity-70" style={{ color: 'var(--text-color)' }}>
                    <span>{entry.wordCount} words</span>
                    <span className={`font-medium ${getMoodColor(entry.mood)}`}>
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Journal;
