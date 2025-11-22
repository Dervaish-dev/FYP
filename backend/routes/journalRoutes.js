import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'calm', 'stressed', 'angry', 'neutral', 'excited', 'worried', 'confused', 'surprised', 'depressed', 'anxious'],
    default: 'neutral'
  },
  emotionConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  language: {
    type: String,
    default: 'english'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

// POST /api/journal/create - Create a new journal entry
router.post("/create", async (req, res) => {
  try {
    const { 
      userId, 
      title, 
      content, 
      emotion, 
      emotionConfidence, 
      language, 
      tags, 
      isPrivate, 
      mood 
    } = req.body;

    // Validate required fields
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, content'
      });
    }

    // Create new journal entry
    const journalEntry = new JournalEntry({
      userId,
      title: title?.trim() || '',
      content: content.trim(),
      emotion: emotion?.toLowerCase() || 'neutral',
      emotionConfidence: emotionConfidence || 0.5,
      language: language || 'english',
      tags: tags || [],
      isPrivate: isPrivate !== false, // Default to true
      mood: mood || 5
    });

    await journalEntry.save();

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });

  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
});

// GET /api/journal/:userId - Get journal entries for user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, emotion, mood, tags } = req.query;

    // Build query
    const query = { userId };
    if (emotion) query.emotion = emotion.toLowerCase();
    if (mood) query.mood = parseInt(mood);
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Get journal entries
    const entries = await JournalEntry
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get journal statistics
    const stats = await JournalEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          avgMood: { $avg: '$mood' },
          avgConfidence: { $avg: '$emotionConfidence' }
        }
      }
    ]);

    // Get mood trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moodTrends = await JournalEntry.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            emotion: "$emotion"
          },
          avgMood: { $avg: "$mood" },
          avgConfidence: { $avg: "$emotionConfidence" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        entries,
        stats,
        moodTrends,
        total: entries.length
      }
    });

  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries',
      error: error.message
    });
  }
});

// GET /api/journal/entry/:id - Get specific journal entry
router.get("/entry/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await JournalEntry.findById(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entry',
      error: error.message
    });
  }
});

// PUT /api/journal/:id - Update journal entry
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    // Clean up the update data
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.content) updateData.content = updateData.content.trim();
    if (updateData.emotion) updateData.emotion = updateData.emotion.toLowerCase();
    if (updateData.tags) updateData.tags = updateData.tags.map(tag => tag.trim());

    const entry = await JournalEntry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: entry
    });

  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update journal entry',
      error: error.message
    });
  }
});

// DELETE /api/journal/:id - Delete journal entry
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await JournalEntry.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
});

// GET /api/journal/:userId/search - Search journal entries
router.get("/:userId/search", async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search in title and content
    const entries = await JournalEntry
      .find({
        userId,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({
      success: true,
      data: {
        entries,
        total: entries.length,
        query: q
      }
    });

  } catch (error) {
    console.error('Error searching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search journal entries',
      error: error.message
    });
  }
});

// GET /api/journal/:userId/analytics - Get journal analytics
router.get("/:userId/analytics", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analytics data
    const analytics = await JournalEntry.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            emotion: "$emotion"
          },
          avgMood: { $avg: "$mood" },
          avgConfidence: { $avg: "$emotionConfidence" },
          count: { $sum: 1 },
          totalWords: { $sum: { $strLenCP: "$content" } }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Get emotion distribution
    const emotionDistribution = await JournalEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          avgMood: { $avg: '$mood' }
        }
      }
    ]);

    // Get writing patterns
    const writingPatterns = await JournalEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" },
            dayOfWeek: { $dayOfWeek: "$createdAt" }
          },
          count: { $sum: 1 },
          avgMood: { $avg: "$mood" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        analytics,
        emotionDistribution,
        writingPatterns,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Error fetching journal analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal analytics',
      error: error.message
    });
  }
});

export default router;
