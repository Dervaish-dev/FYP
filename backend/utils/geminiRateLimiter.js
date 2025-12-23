/**
 * Rate Limiter for Gemini API
 * Prevents overwhelming the API with concurrent requests
 */

class GeminiRateLimiter {
  constructor(options = {}) {
    this.maxConcurrentRequests = options.maxConcurrentRequests || 2; // Max 2 concurrent requests
    this.requestsPerMinute = options.requestsPerMinute || 30; // 30 requests per minute max
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelayMs = options.retryDelayMs || 1000; // Start with 1 second
    
    this.activeRequests = 0;
    this.requestQueue = [];
    this.requestTimestamps = [];
    
    console.log('🚀 Gemini Rate Limiter initialized:', {
      maxConcurrent: this.maxConcurrentRequests,
      requestsPerMin: this.requestsPerMinute,
      retryAttempts: this.retryAttempts
    });
  }

  /**
   * Check if we can make a request based on rate limits
   */
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean up old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);

    // Check rate limit (requests per minute)
    if (this.requestTimestamps.length >= this.requestsPerMinute) {
      const oldestRequest = this.requestTimestamps[0];
      const timeToWait = (oldestRequest + 60000) - now;
      console.log(`⏳ Rate limit reached. Wait ${Math.ceil(timeToWait / 1000)}s before next request.`);
      return false;
    }

    // Check concurrent requests
    if (this.activeRequests >= this.maxConcurrentRequests) {
      console.log(`⏳ Max concurrent requests (${this.maxConcurrentRequests}) reached. Queuing...`);
      return false;
    }

    return true;
  }

  /**
   * Execute function with rate limiting and retry logic
   */
  async execute(fn, label = 'API Call') {
    return new Promise((resolve, reject) => {
      const executeWithRetry = async (attempt = 1) => {
        // Wait until we can make a request
        while (!this.canMakeRequest()) {
          await this.sleep(500);
        }

        this.activeRequests++;
        const now = Date.now();
        this.requestTimestamps.push(now);

        console.log(`📤 Executing: ${label} (attempt ${attempt}/${this.retryAttempts})`);

        try {
          const result = await fn();
          this.activeRequests--;
          console.log(`✅ Success: ${label}`);
          resolve(result);
        } catch (error) {
          this.activeRequests--;
          
          // Check if it's a rate limit error
          const isRateLimit = 
            error.message?.includes('429') || 
            error.message?.includes('Too Many Requests') ||
            error.message?.includes('quota');

          if (isRateLimit && attempt < this.retryAttempts) {
            const delayMs = this.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`⏳ Rate limited. Retrying in ${delayMs}ms... (attempt ${attempt}/${this.retryAttempts})`);
            console.log(`   Error: ${error.message}`);
            
            await this.sleep(delayMs);
            executeWithRetry(attempt + 1);
          } else if (attempt < this.retryAttempts && !isRateLimit) {
            // Retry other errors too (connection issues, etc)
            const delayMs = this.retryDelayMs * Math.pow(2, attempt - 1);
            console.log(`🔄 Error occurred. Retrying in ${delayMs}ms... (attempt ${attempt}/${this.retryAttempts})`);
            console.log(`   Error: ${error.message}`);
            
            await this.sleep(delayMs);
            executeWithRetry(attempt + 1);
          } else {
            console.error(`❌ Failed: ${label} after ${attempt} attempts`);
            console.error(`   Error: ${error.message}`);
            reject(error);
          }
        }
      };

      executeWithRetry();
    });
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  getStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestTimestamps.filter(ts => ts > oneMinuteAgo).length;

    return {
      activeRequests: this.activeRequests,
      recentRequests,
      requestsPerMinuteLimit: this.requestsPerMinute,
      maxConcurrentRequests: this.maxConcurrentRequests,
      queueLength: this.requestQueue.length
    };
  }
}

export default new GeminiRateLimiter({
  maxConcurrentRequests: 2,
  requestsPerMinute: 30,
  retryAttempts: 3,
  retryDelayMs: 1000
});
