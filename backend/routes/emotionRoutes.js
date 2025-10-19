import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";

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

    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    const imagePath = req.file.path;
    
    // Read the uploaded image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    console.log(`Analyzing image: ${req.file.originalname} (${req.file.size} bytes)`);

    // Gemini API endpoint - using free model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Look at this face. Is the person crying, smiling, angry, or calm? Answer with one word: Happy, Sad, Angry, Calm, Neutral, Stressed, Excited, Worried, Confused, Surprised.",
                },
                {
                  inline_data: {
                    mime_type: req.file.mimetype,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 20,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // Extract emotion from response - handle different response formats
    let detectedEmotion = "Neutral";
    let rawText = "";
    
    // Try different response formats
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = data.candidates[0].content.parts[0].text.trim();
    } else if (data?.output_text) {
      rawText = data.output_text.trim();
    } else if (data?.text) {
      rawText = data.text.trim();
    }
    
    if (rawText) {
      // Clean up the response to extract just the emotion
      detectedEmotion = rawText.split('\n')[0].trim();
      
      // Validate emotion is in our expected list
      const validEmotions = ['Happy', 'Sad', 'Calm', 'Angry', 'Stressed', 'Neutral', 'Excited', 'Worried', 'Confused', 'Surprised'];
      if (!validEmotions.includes(detectedEmotion)) {
        detectedEmotion = "Neutral";
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
      confidence: "high",
      timestamp: new Date().toISOString()
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
    
    res.status(500).json({ 
      error: "Emotion analysis failed",
      details: err.message 
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
