import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import sharp from "sharp";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/emotion/analyze
router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in .env');
    }
    const imagePath = req.file.path;
    
    // Read + downscale/compress the uploaded image file (keeps Gemini payload small)
    const originalBuffer = fs.readFileSync(imagePath);
    const processedBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64Image = processedBuffer.toString("base64");

    console.log(
      `Analyzing image: ${req.file.originalname} (upload=${req.file.size} bytes, processed=${processedBuffer.length} bytes)`
    );

    const model = process.env.GEMINI_EMOTION_MODEL || 'gemini-flash-latest';

    // Gemini API endpoint
    const userContext = String(req.get('X-User-Context') || '').trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are analyzing a human face photo to infer the most likely emotion and its intensity. " +
                    "Return ONLY valid JSON with these keys: \"emotion\", \"intensity\", \"confidence\". " +
                    "- emotion: one of [Happy, Sad, Angry, Calm, Neutral, Stressed, Excited, Worried, Confused, Surprised]. " +
                    "- intensity: integer 1-10 (1=very mild, 10=very intense). " +
                    "- confidence: number 0-1 (how confident you are in the emotion). " +
                    (userContext ? `User context (may help disambiguate): ${userContext}. ` : "") +
                    "No markdown. No extra text.",
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errorText);

      // Clean up temporary file
      try {
        fs.unlinkSync(imagePath);
      } catch (unlinkError) {
        console.warn('Failed to delete temporary file:', unlinkError.message);
      }

      const downstreamStatus = response.status === 429 ? 429 : 502;

      return res.status(downstreamStatus).json({
        success: false,
        message: 'Gemini emotion analysis failed',
        status: response.status,
        statusText: response.statusText,
        details: String(errorText || '').slice(0, 2000)
      });
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // Extract emotion/intensity from response - handle different response formats
    let detectedEmotion = "Neutral";
    let detectedIntensity = 5;
    let detectedConfidence = null;

    let rawText = "";
    
    // Try different response formats
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = data.candidates[0].content.parts[0].text.trim();
    } else if (data?.output_text) {
      rawText = data.output_text.trim();
    } else if (data?.text) {
      rawText = data.text.trim();
    }
    
    const validEmotions = ['Happy', 'Sad', 'Calm', 'Angry', 'Stressed', 'Neutral', 'Excited', 'Worried', 'Confused', 'Surprised'];

    if (rawText) {
      const candidate = rawText.trim();
      // Prefer JSON (new format)
      try {
        const parsed = JSON.parse(candidate);
        const emotion = String(parsed?.emotion || '').trim();
        const intensity = Number(parsed?.intensity);
        const confidence = parsed?.confidence;

        if (validEmotions.includes(emotion)) {
          detectedEmotion = emotion;
        }

        if (Number.isFinite(intensity)) {
          const rounded = Math.round(intensity);
          detectedIntensity = Math.min(10, Math.max(1, rounded));
        }

        if (confidence !== undefined && confidence !== null) {
          const confNum = Number(confidence);
          if (Number.isFinite(confNum)) {
            detectedConfidence = Math.min(1, Math.max(0, confNum));
          }
        }
      } catch {
        // Fallback: older behavior (single-word emotion)
        const firstLine = candidate.split('\n')[0].trim();
        if (validEmotions.includes(firstLine)) {
          detectedEmotion = firstLine;
        }
      }
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(imagePath);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file:', unlinkError.message);
    }

    res.json({
      emotion: detectedEmotion,
      intensity: detectedIntensity,
      confidence: detectedConfidence,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Emotion analysis error:', err);
    
    // Clean up temporary file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.warn('Failed to delete temporary file after error:', unlinkError.message);
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Emotion analysis failed',
      error: err.message
    });
  }
});

// GET /api/emotion/status - Health check endpoint
router.get("/status", (req, res) => {
  res.json({ 
    status: "Emotion analysis service is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
