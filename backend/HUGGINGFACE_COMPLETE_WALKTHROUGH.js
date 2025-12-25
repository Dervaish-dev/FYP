/**
 * HUGGINGFACE EMOTION DETECTION - COMPLETE CODE WALKTHROUGH
 * This shows EXACTLY what happens step-by-step
 */

// ============================================================
// STEP 1: USER UPLOADS IMAGE (Mobile/Web)
// ============================================================

// Mobile (Flutter):
File imageFile = await ImagePicker().pickImage(source: ImageSource.gallery);

// Web (JavaScript):
<input type="file" onChange={handleImageUpload} />

// ============================================================
// STEP 2: APP SENDS IMAGE TO BACKEND
// ============================================================

// Mobile sends multipart/form-data request:
POST /api/emotion/analyze-face
Headers: {
  Authorization: "Bearer <jwt_token>",
  Content-Type: "multipart/form-data"
}
Body: {
  image: <binary image file>
}

// ============================================================
// STEP 3: BACKEND RECEIVES IMAGE
// ============================================================

// In emotionRoutes.js:
router.post("/analyze-face", upload.single("image"), async (req, res) => {
  
  // 3.1 - Check if image was uploaded
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  // Now: req.file = { path: 'uploads/abc123.jpg', size: 123456, ... }

  // 3.2 - Check HuggingFace token is configured
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error('HF_TOKEN not configured');
  }
  // Now: hfToken = "hf_xxxxxxxxxxxxxxxxxxxxx" (from environment variable)

  // 3.3 - Read the uploaded image as binary data
  const imageBuffer = fs.readFileSync(req.file.path);
  // Now: imageBuffer = <Buffer ff d8 ff e0 00 10 4a 46 49 46...>

// ============================================================
// STEP 4: SEND TO HUGGINGFACE API
// ============================================================

  // 4.1 - Create HuggingFace client
  const client = new InferenceClient(hfToken);

  // 4.2 - Call image classification API
  const output = await client.imageClassification({
    data: imageBuffer,
    model: "dima806/facial_emotions_image_detection",
  });

  // IMPORTANT: The API call above does this behind the scenes:
  // 1. Uploads image to HuggingFace servers
  // 2. Runs it through the neural network model
  // 3. Model analyzes facial features (eyes, mouth, eyebrows, etc.)
  // 4. Returns probability scores for all 7 emotions

// ============================================================
// STEP 5: HUGGINGFACE RETURNS RESULTS
// ============================================================

  // Now: output = [
  //   { label: "happy",    score: 0.8723 },  // 87.23% sure it's happy
  //   { label: "neutral",  score: 0.0812 },  // 8.12% sure it's neutral
  //   { label: "surprise", score: 0.0321 },  // 3.21% sure it's surprised
  //   { label: "sad",      score: 0.0089 },  // 0.89% sure it's sad
  //   { label: "angry",    score: 0.0043 },  // 0.43% sure it's angry
  //   { label: "fear",     score: 0.0011 },  // 0.11% sure it's fearful
  //   { label: "disgust",  score: 0.0001 }   // 0.01% sure it's disgusted
  // ]

  console.log('HuggingFace returned:', output);

  // 5.1 - Clean up the temporary file
  fs.unlinkSync(req.file.path);

  // 5.2 - Handle empty response
  if (!output || output.length === 0) {
    return res.json({
      emotion: "Neutral",
      confidence: 0,
      allResults: [],
      timestamp: new Date().toISOString(),
    });
  }

// ============================================================
// STEP 6: PROCESS THE RESULTS
// ============================================================

  // 6.1 - Sort by confidence (already sorted, but just to be safe)
  const sortedResults = output.sort((a, b) => b.score - a.score);
  // Still: [{ label: "happy", score: 0.8723 }, ...]

  // 6.2 - Get the top result (most confident emotion)
  const topResult = sortedResults[0];
  // Now: topResult = { label: "happy", score: 0.8723 }

  // 6.3 - Map HuggingFace labels to our app's emotion names
  const emotionMap = {
    'angry': 'Angry',       // HuggingFace → Our App
    'disgust': 'Disgusted',
    'fear': 'Worried',      // We call "fear" → "Worried"
    'happy': 'Happy',
    'sad': 'Sad',
    'surprise': 'Surprised',
    'neutral': 'Neutral'
  };

  const detectedLabel = topResult.label.toLowerCase();
  // Now: detectedLabel = "happy"

  const detectedEmotion = emotionMap[detectedLabel] || topResult.label;
  // Now: detectedEmotion = "Happy" (capitalized)

  const confidence = topResult.score;
  // Now: confidence = 0.8723

  // 6.4 - Calculate intensity on 1-10 scale
  const intensity = Math.max(1, Math.min(10, Math.round(confidence * 10)));
  // Now: intensity = Math.round(0.8723 * 10) = Math.round(8.723) = 9

// ============================================================
// STEP 7: SEND RESPONSE TO APP
// ============================================================

  res.json({
    emotion: detectedEmotion,      // "Happy"
    confidence: confidence,          // 0.8723
    intensity: intensity,            // 9
    allResults: sortedResults.map(r => ({
      emotion: emotionMap[r.label.toLowerCase()] || r.label,
      confidence: r.score
    })),
    // allResults: [
    //   { emotion: "Happy", confidence: 0.8723 },
    //   { emotion: "Neutral", confidence: 0.0812 },
    //   { emotion: "Surprised", confidence: 0.0321 },
    //   ...
    // ]
    timestamp: new Date().toISOString()
  });

  // Response sent back to mobile/web app!
});

// ============================================================
// STEP 8: APP RECEIVES AND DISPLAYS RESULTS
// ============================================================

// In emotions_screen.dart (Flutter):
final result = await emotionService.analyzeFacialEmotion(imageFile);

// Now: result = {
//   "emotion": "Happy",
//   "confidence": 0.8723,
//   "intensity": 9,
//   "allResults": [...]
// }

// Extract data:
final emotion = result['emotion'];        // "Happy"
final confidence = result['confidence'];  // 0.8723
final intensity = result['intensity'];    // 9
final allResults = result['allResults'];  // [...]

// Display to user:
setState(() {
  _selectedEmotion = emotion.toLowerCase();  // "happy"
  _intensity = intensity.toDouble();         // 9.0
  _analysisResult = 'Detected: $emotion (${(confidence * 100).toStringAsFixed(1)}% confident)';
  // Shows: "Detected: Happy (87.2% confident)"
});

// Show all emotions:
// "All detected emotions:"
// "1. Happy: 87.2%"
// "2. Neutral: 8.1%"
// "3. Surprised: 3.2%"
// ...

// If confidence > 50%, auto-log the emotion:
if (confidence > 0.5) {
  context.read<EmotionBloc>().add(AddEmotion(
    emotion: emotion,
    intensity: intensity,
    note: 'Detected from facial image',
  ));
  // Saves to database automatically!
}

// ============================================================
// SUMMARY: THE COMPLETE FLOW
// ============================================================

/*
1. User picks image from gallery
2. App sends image to backend (/api/emotion/analyze-face)
3. Backend reads image as binary buffer
4. Backend sends buffer to HuggingFace API
5. HuggingFace analyzes face and returns 7 emotion probabilities
6. Backend takes highest probability
7. Backend maps emotion name and calculates intensity
8. Backend sends response to app
9. App displays detected emotion with confidence
10. App auto-fills emotion picker and intensity slider
11. If confident, app auto-saves emotion to database
12. User can adjust or confirm the detected emotion

THAT'S IT! 🎉
*/
