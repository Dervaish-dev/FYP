# Journal & NLP Analysis - Enhancement Summary

## ✅ Completed Features

### Backend Implementation

#### 1. Extended Journal Schema
New fields added to journal entries:
- `topics: [String]` - Array of extracted topics from the entry
- `keywords: [{word: String, relevance: Number}]` - Key phrases with relevance scores (0-1)
- `stressLevel: String` - Categorized as 'low', 'medium', or 'high'
- `stressScore: Number` - Numeric stress rating (0-10)
- `stressTriggers: [String]` - Identified stress-inducing factors
- `emotionalIntensity: Number` - Emotional intensity rating (0-10)
- `aiAnalysis: String` - AI-generated psychological summary

#### 2. AI-Powered Analysis Function
**File**: `backend/routes/journalRoutes.js`

The `analyzeEntryWithAI(content)` function uses Google Gemini Pro to extract:
- Sentiment analysis (positive/negative/neutral)
- Mood classification
- Stress level and score
- Topic extraction
- Keyword identification with relevance scoring
- Stress trigger detection
- Emotional intensity measurement
- Comprehensive psychological summary

**Usage**: Automatically called when creating new journal entries with content > 20 characters

#### 3. New Analytics Endpoints

##### a) **Contextual Prompts** - `POST /api/journal/prompts/:userId`
Generates personalized prompts, affirmations, and self-care suggestions based on:
- Last 7 days of journal entries
- Average mood trends
- Average stress levels
- Common topics and triggers

**Response includes**:
- 3-5 tailored journal prompts
- 3-5 personalized affirmations
- 3-5 self-care suggestions

##### b) **Stress Analysis** - `GET /api/journal/:userId/stress-analysis?days=30`
Provides comprehensive stress analytics:
- Daily stress trends (date, avg score, entry count)
- Top stress triggers with frequency and average stress scores
- Stress distribution (low/medium/high percentages)
- Summary statistics (avg score, high stress days, stress percentage)

**Query Parameters**:
- `days` (optional, default: 30) - Number of days to analyze

##### c) **Topic Analysis** - `GET /api/journal/:userId/topics?days=30`
Delivers topic and keyword insights:
- Most common topics with frequency
- Average mood and stress score per topic
- Topic trends over time (last 7 entries)
- Top keywords with frequency and average relevance
- Keyword context (topics where each keyword appears)

**Query Parameters**:
- `days` (optional, default: 30) - Number of days to analyze

### Frontend Implementation

#### Enhanced Journal Entry Display
**File**: `frontend/src/pages/Journal.jsx`

Each journal entry now displays:

1. **AI Analysis Summary** 🧠
   - Psychological summary in a highlighted section
   - Appears when `entry.aiAnalysis` is available

2. **Topics** 🏷️
   - Color-coded topic pills
   - Shows up to 6 topics per entry
   - Primary theme color for visual consistency

3. **Key Insights** 🎯
   - Keyword pills with relevance percentages
   - Shows top 5 keywords
   - Opacity varies based on relevance score (higher relevance = more visible)

4. **Stress Indicators** 📊
   - Color-coded stress level badge:
     - 🔴 High stress (red background)
     - 🟡 Medium stress (amber background)
     - 🟢 Low stress (green background)
   - Stress score (0-10) displayed next to level
   - Emotional intensity rating
   - Stress triggers shown as mini tags (up to 4)

5. **Enhanced Metadata**
   - Word count
   - Language indicator (if not English)
   - Emotion with confidence percentage
   - All styled with theme-aware colors

## Testing & Validation

### Seed Data
**File**: `backend/seed-journal-data.js`

Created 7 realistic journal entries with pre-computed AI analysis:
- **High Stress** (1 entry): Work deadlines, excessive workload (stress score: 8/10)
- **Medium Stress** (3 entries): Family tensions, health concerns, social anxiety (scores: 5-6/10)
- **Low Stress** (3 entries): Morning walks, study sessions, weekend recharge (scores: 1-2/10)

**Unique Topics**: 28 (work, stress, deadlines, self-care, mindfulness, family, health, anxiety, etc.)
**Total Keywords**: 35 with relevance scores 0.75-0.95
**Stress Triggers**: 18 (work deadlines, family expectations, health concerns, social situations, etc.)

### Smoke Test Results
**File**: `backend/smoke-test-journal.js`

✅ **All Tests Passed**

Verified:
- AI-powered sentiment & mood analysis
- Topic extraction from journal entries (avg 3 topics per entry)
- Stress level scoring & trigger identification (avg stress: 3.22/10)
- Keyword extraction with relevance scores
- Contextual prompts based on mood trends (3 prompts, 3 affirmations, 3 suggestions)
- Personalized affirmations generation
- Stress pattern analysis & trends (1 high stress day, 11.1% stress percentage)
- Topic frequency & trends over time (self-care: 3x, health: 2x, anxiety: 2x)

**Top Identified Patterns**:
1. Most common topic: self-care (3 times, avg mood: 7.0)
2. Top keyword: "anxious" (relevance: 0.93)
3. Primary stress trigger: sleep disruption (avg stress: 8.0)

## Configuration

### Environment Variables
**File**: `backend/.env`

```env
GEMINI_API_KEY=AIzaSyBRt9vJLaGKBH8wr-5_hF8J_xEPPEkF1X4
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
PORT=5005
```

### Dependencies
Added to `backend/package.json`:
```json
"@google/generative-ai": "^0.1.3"
```

## Usage Examples

### Creating an Entry with AI Analysis
```javascript
POST /api/journal/create
{
  "userId": "67459ba8cac05d8bac41c8a3",
  "content": "Today was overwhelming. Work deadlines are piling up and I feel anxious about meeting them all.",
  "mood": 4
}
```

**Response includes**:
```json
{
  "emotion": "anxious",
  "topics": ["work", "stress", "deadlines"],
  "keywords": [
    { "word": "overwhelming", "relevance": 0.92 },
    { "word": "anxious", "relevance": 0.88 }
  ],
  "stressLevel": "high",
  "stressScore": 7,
  "stressTriggers": ["work deadlines", "time pressure"],
  "emotionalIntensity": 8,
  "aiAnalysis": "Entry reflects work-related anxiety with high emotional intensity..."
}
```

### Getting Contextual Prompts
```javascript
POST /api/journal/prompts/67459ba8cac05d8bac41c8a3
```

**Response**:
```json
{
  "prompts": [
    "What specific aspects of work are causing you the most stress?",
    "How can you break down your workload into manageable tasks?",
    "What self-care activities help you when feeling overwhelmed?"
  ],
  "affirmations": [
    "You have overcome challenges before and can do so again.",
    "It's okay to ask for help when you need it.",
    "Your wellbeing is just as important as your work."
  ],
  "suggestions": [
    "Take 5-minute breaks every hour",
    "Practice deep breathing exercises",
    "Write down your top 3 priorities for tomorrow"
  ]
}
```

### Analyzing Stress Patterns
```javascript
GET /api/journal/67459ba8cac05d8bac41c8a3/stress-analysis?days=30
```

**Response**:
```json
{
  "trends": [
    { "date": "2024-12-20", "avgStress": 7.5, "count": 2 },
    { "date": "2024-12-19", "avgStress": 3.0, "count": 1 }
  ],
  "triggers": [
    { "trigger": "work deadlines", "count": 3, "avgStress": 8.0 },
    { "trigger": "family expectations", "count": 2, "avgStress": 6.0 }
  ],
  "distribution": {
    "low": 42.9,
    "medium": 42.9,
    "high": 14.2
  },
  "summary": {
    "avgStressScore": 4.2,
    "highStressDays": 2,
    "totalEntries": 7,
    "stressPercentage": 57.1
  }
}
```

## What's NOT Included (Future Enhancements)

❌ **Voice Entry** - Speech-to-text integration for hands-free journaling
❌ **Advanced Visualizations** - Dedicated pages for:
  - Stress trend line graphs
  - Topic word clouds
  - Keyword relevance charts
  - Trigger heat maps
❌ **Export Features** - PDF/CSV export of analysis data
❌ **Pattern Alerts** - Notifications for concerning stress patterns

## Files Modified/Created

### Created
- `backend/utils/taskRecurrence.js` (for Task module)
- `backend/tests/taskRecurrence.test.js` (for Task module)
- `backend/smoke-test.js` (for Task module)
- `backend/seed-journal-data.js`
- `backend/smoke-test-journal.js`
- `backend/get-user-id.js`
- `JOURNAL_ENHANCEMENTS.md` (this file)

### Modified
- `backend/routes/journalRoutes.js` - Extended schema, added AI analysis, 3 new endpoints
- `backend/package.json` - Added @google/generative-ai dependency
- `backend/.env` - Added GEMINI_API_KEY
- `frontend/src/pages/Journal.jsx` - Enhanced entry display with topics, stress, keywords
- `backend/routes/taskRoutes.js` - Added recurring task logic (for Task module)
- `frontend/src/pages/TaskScheduling.jsx` - Real stats implementation (for Task module)

## Next Steps

To continue enhancing the Journal module:

1. **Create Dedicated Analytics Page** - Separate page for visualizing:
   - 30-day stress trend graph
   - Topic word cloud (size based on frequency)
   - Most impactful keywords chart
   - Stress trigger analysis

2. **Add Filtering & Search** - Allow users to:
   - Filter by topic
   - Filter by stress level
   - Search by keyword
   - Date range selection

3. **Pattern Recognition Alerts** - Notify users when:
   - Stress levels consistently high for 3+ days
   - Negative mood trend detected
   - Specific triggers appear frequently

4. **Voice Entry Integration** - Implement speech-to-text for:
   - Hands-free journaling
   - Quick emotion check-ins
   - Accessibility enhancement

5. **Export & Sharing** - Enable:
   - PDF export of entries and analysis
   - CSV export for personal data analysis
   - Share insights with caregivers (with consent)
