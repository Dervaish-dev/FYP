import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// POST /api/voice/therapeutic
// Body: { message: string }
router.post('/therapeutic', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: message',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY not configured',
      });
    }

    const model =
      process.env.GEMINI_VOICE_MODEL ||
      process.env.GEMINI_EMOTION_MODEL ||
      'gemini-flash-latest';

    const therapeuticPrompt = `You are Dr. Sarah, a compassionate and experienced mental health therapist and doctor. The user has shared: "${message}"

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: therapeuticPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 220,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      const downstreamStatus = response.status === 429 ? 429 : 502;
      return res.status(downstreamStatus).json({
        success: false,
        message: 'Gemini therapeutic response failed',
        status: response.status,
        statusText: response.statusText,
        details: String(errorText || '').slice(0, 2000),
      });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply || typeof reply !== 'string') {
      return res.status(502).json({
        success: false,
        message: 'Gemini returned no reply',
        details: JSON.stringify(data)?.slice(0, 2000),
      });
    }

    return res.json({
      success: true,
      reply,
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Voice therapeutic error:', err);
    return res.status(500).json({
      success: false,
      message: 'Voice therapeutic request failed',
      error: err.message,
    });
  }
});

export default router;
