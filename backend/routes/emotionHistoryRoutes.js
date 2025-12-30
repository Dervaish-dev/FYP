import express from "express";
import mongoose from "mongoose";
import EmotionHistory from "../models/Emotion.js";

const router = express.Router();

// EmotionHistory model imported from ../models/Emotion.js

// POST /api/emotions/history - Log new emotion
router.post("/history", async (req, res) => {
  try {
    const { userId, emotion, intensity, confidence, note, source } = req.body;

    // Validate required fields
    if (!userId || !emotion || !intensity || confidence === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, emotion, intensity, confidence'
      });
    }

    // Create new emotion history entry
    const emotionEntry = new EmotionHistory({
      userId,
      emotion: emotion.toLowerCase(),
      intensity: parseInt(intensity),
      confidence: parseFloat(confidence),
      note: note || '',
      source: source || 'manual'
    });

    await emotionEntry.save();

    res.status(201).json({
      success: true,
      message: 'Emotion logged successfully',
      data: emotionEntry
    });

  } catch (error) {
    console.error('Error logging emotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log emotion',
      error: error.message
    });
  }
});

// GET /api/emotions/history/:userId - Get emotion history for user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get emotion history for user - use lean() for read-only performance boost
    const emotions = await EmotionHistory
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Get emotion statistics
    const stats = await EmotionHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          avgIntensity: { $avg: '$intensity' },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        emotions,
        stats,
        total: emotions.length
      }
    });

  } catch (error) {
    console.error('Error fetching emotion history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emotion history',
      error: error.message
    });
  }
});

// GET /api/emotions/history/:userId/chart - Get chart data for emotion trends
router.get("/history/:userId/chart", async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get emotion data for chart
    const chartData = await EmotionHistory.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            emotion: "$emotion"
          },
          avgIntensity: { $avg: "$intensity" },
          avgConfidence: { $avg: "$confidence" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    // Transform data for chart
    const transformedData = chartData.reduce((acc, item) => {
      const date = item._id.date;
      const emotion = item._id.emotion;
      
      if (!acc[date]) {
        acc[date] = { date };
      }
      
      acc[date][emotion] = item.avgIntensity;
      acc[date][`${emotion}_confidence`] = item.avgConfidence;
      acc[date][`${emotion}_count`] = item.count;
      
      return acc;
    }, {});

    const finalData = Object.values(transformedData);

    res.json({
      success: true,
      data: finalData
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
});

// DELETE /api/emotions/history/:id - Delete specific emotion entry
router.delete("/history/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEntry = await EmotionHistory.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: 'Emotion entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Emotion entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting emotion entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emotion entry',
      error: error.message
    });
  }
});

export default router;
