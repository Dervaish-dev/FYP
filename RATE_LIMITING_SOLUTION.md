# Gemini API Rate Limiting Solution

## Problem Identified

You were getting **429 Too Many Requests** errors even with a new API key because:

### 1. **Multiple Concurrent API Requests** (Main Culprit)
   - **journalRoutes.js**: Makes API calls when creating/updating journal entries
   - **emotionRoutes.js**: Makes API calls for image emotion analysis  
   - **wellnessRoutes.js**: Makes API calls for mood pattern analysis
   - **All happening simultaneously** without any throttling or queuing

### 2. **Hardcoded Fallback API Keys** (Secondary Issue)
   - emotionRoutes.js had: `AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0` (old, expired quota)
   - wellnessRoutes.js had: `AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0` (old, expired quota)
   - These were being used INSTEAD of your .env key when `process.env.GEMINI_API_KEY` was undefined

### 3. **No Retry Logic with Backoff**
   - When quota errors happened, requests failed immediately
   - No exponential backoff to allow quota to reset

## Solution Implemented

### 1. ✅ Removed Hardcoded API Keys
   - **emotionRoutes.js**: Now requires `process.env.GEMINI_API_KEY` from .env
   - **wellnessRoutes.js**: Now requires `process.env.GEMINI_API_KEY` from .env
   - No fallback to old keys anymore

### 2. ✅ Created Rate Limiter Utility
   Location: `backend/utils/geminiRateLimiter.js`
   
   **Features:**
   - **Max 2 concurrent requests** (prevents overwhelming the API)
   - **30 requests per minute limit** (respects Gemini API quotas)
   - **3 retry attempts** with exponential backoff
   - **Automatic queue management** - requests wait if limit reached
   - **Smart error detection** - distinguishes quota errors from other errors

### 3. ✅ Integrated Rate Limiter
   - **journalRoutes.js**: Wrapped all Gemini calls with rate limiter
   - All API requests now go through the rate limiter queue

## How It Works

```
Request comes in
    ↓
Rate Limiter checks:
  - Are there < 2 concurrent requests?
  - Have we made < 30 requests in the last minute?
    ↓
If YES → Execute immediately
If NO → Wait and retry
    ↓
If API returns 429 → Exponential backoff retry
  (Wait 1s, then 2s, then 4s)
    ↓
If still fails after 3 attempts → Return error + use fallback
```

## Example Console Output

```
🚀 Gemini Rate Limiter initialized: {
  maxConcurrent: 2,
  requestsPerMin: 30,
  retryAttempts: 3
}

📤 Executing: Emotion Analysis (attempt 1/3)
📡 Sending request to Gemini API with rate limiting...
✅ Success: Emotion Analysis
✅ Successfully parsed AI analysis: {
  mood: 'happy',
  sentiment: 'positive',
  stressScore: 3,
  emotionalIntensity: 7
}
```

## What to Check Now

1. **Verify .env has correct API key:**
   ```bash
   cat backend/.env | grep GEMINI_API_KEY
   ```

2. **Test with multiple concurrent requests:**
   ```bash
   # Create 3 entries quickly - should queue them
   for i in 1 2 3; do
     curl -X POST http://localhost:5005/api/journal/create \
       -H "Content-Type: application/json" \
       -d '{"userId":"test","content":"Entry '$i' - Happy time!"}'
   done
   ```

3. **Watch server logs for rate limiter info:**
   - Should see "executing" and "queuing" messages
   - Should see exponential backoff if hitting quota

## Expected Behavior Now

✅ New requests will be **queued** if rate limit reached
✅ No more instant 429 errors
✅ Automatic retry with exponential backoff
✅ All routes use **same API key** from .env
✅ Keyword fallback if API quota still exceeded

## Next Steps if Still Getting Rate Limited

If still getting 429 errors after 3 retries:

1. **Check quota:**
   - Go to https://console.cloud.google.com/apis/dashboard
   - Check Generative Language API quotas
   - May need to wait for daily limit reset (usually at midnight UTC)

2. **Upgrade Plan:**
   - Go to https://ai.google.dev/
   - Upgrade to higher quota tier

3. **Fallback Works:**
   - Even if API fails, keyword-based emotion detection activates
   - Entries still get emotional analysis (just not AI-powered)
   - Check backend logs for "Using keyword fallback"

## Rate Limiter Configuration

Edit `backend/utils/geminiRateLimiter.js` to adjust:

```javascript
new GeminiRateLimiter({
  maxConcurrentRequests: 2,        // Increase if needed
  requestsPerMinute: 30,            // Respects Gemini limits
  retryAttempts: 3,                 // Number of retries
  retryDelayMs: 1000                // Starting retry delay (grows exponentially)
});
```

## Summary

**Before:** Multiple routes competing for API quota → Immediate 429 errors  
**After:** Single queued rate limiter → Controlled request flow → Better quota management → Fallback when needed
