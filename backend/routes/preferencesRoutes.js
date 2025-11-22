import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// User Preferences Schema
const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  age: {
    type: Number,
    min: 1,
    max: 120,
    default: null
  },
  neurotype: {
    type: String,
    enum: ['ADHD', 'Autism', 'Anxiety', 'Dyslexia', 'Depression', 'Bipolar', 'OCD', 'PTSD', 'Other', 'None'],
    default: 'None'
  },
  preferredNotificationTimes: [{
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night']
  }],
  defaultTheme: {
    type: String,
    enum: ['ocean', 'coral', 'dark', 'mint', 'lavender', 'golden'],
    default: 'ocean'
  },
  personalGoals: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  adaptiveMode: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'english'
  },
  timezone: {
    type: String,
    default: 'UTC'
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
userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

// GET /api/preferences/:userId - Get user preferences
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let preferences = await UserPreferences.findOne({ userId });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = new UserPreferences({
        userId,
        fullName: '',
        age: null,
        neurotype: 'None',
        preferredNotificationTimes: [],
        defaultTheme: 'ocean',
        personalGoals: '',
        notificationsEnabled: true,
        adaptiveMode: true,
        language: 'english',
        timezone: 'UTC'
      });

      await preferences.save();
    }

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences',
      error: error.message
    });
  }
});

// POST /api/preferences - Create or update user preferences
router.post("/", async (req, res) => {
  try {
    const { 
      userId, 
      fullName, 
      age, 
      neurotype, 
      preferredNotificationTimes, 
      defaultTheme, 
      personalGoals, 
      notificationsEnabled, 
      adaptiveMode, 
      language, 
      timezone 
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userId'
      });
    }

    // Check if preferences already exist
    let preferences = await UserPreferences.findOne({ userId });

    if (preferences) {
      // Update existing preferences
      preferences.fullName = fullName || preferences.fullName;
      preferences.age = age !== undefined ? age : preferences.age;
      preferences.neurotype = neurotype || preferences.neurotype;
      preferences.preferredNotificationTimes = preferredNotificationTimes || preferences.preferredNotificationTimes;
      preferences.defaultTheme = defaultTheme || preferences.defaultTheme;
      preferences.personalGoals = personalGoals || preferences.personalGoals;
      preferences.notificationsEnabled = notificationsEnabled !== undefined ? notificationsEnabled : preferences.notificationsEnabled;
      preferences.adaptiveMode = adaptiveMode !== undefined ? adaptiveMode : preferences.adaptiveMode;
      preferences.language = language || preferences.language;
      preferences.timezone = timezone || preferences.timezone;

      await preferences.save();
    } else {
      // Create new preferences
      preferences = new UserPreferences({
        userId,
        fullName: fullName || '',
        age: age || null,
        neurotype: neurotype || 'None',
        preferredNotificationTimes: preferredNotificationTimes || [],
        defaultTheme: defaultTheme || 'ocean',
        personalGoals: personalGoals || '',
        notificationsEnabled: notificationsEnabled !== false,
        adaptiveMode: adaptiveMode !== false,
        language: language || 'english',
        timezone: timezone || 'UTC'
      });

      await preferences.save();
    }

    res.json({
      success: true,
      message: 'User preferences saved successfully',
      data: preferences
    });

  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save user preferences',
      error: error.message
    });
  }
});

// PUT /api/preferences/:userId - Update user preferences
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'User preferences updated successfully',
      data: preferences
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user preferences',
      error: error.message
    });
  }
});

// DELETE /api/preferences/:userId - Delete user preferences
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedPreferences = await UserPreferences.findOneAndDelete({ userId });

    if (!deletedPreferences) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found'
      });
    }

    res.json({
      success: true,
      message: 'User preferences deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user preferences',
      error: error.message
    });
  }
});

// GET /api/preferences/:userId/export - Export user preferences
router.get("/:userId/export", async (req, res) => {
  try {
    const { userId } = req.params;

    const preferences = await UserPreferences.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found'
      });
    }

    // Create export data (excluding sensitive fields)
    const exportData = {
      fullName: preferences.fullName,
      age: preferences.age,
      neurotype: preferences.neurotype,
      preferredNotificationTimes: preferences.preferredNotificationTimes,
      defaultTheme: preferences.defaultTheme,
      personalGoals: preferences.personalGoals,
      notificationsEnabled: preferences.notificationsEnabled,
      adaptiveMode: preferences.adaptiveMode,
      language: preferences.language,
      timezone: preferences.timezone,
      exportedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Error exporting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user preferences',
      error: error.message
    });
  }
});

export default router;
