import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Convert conversational transcript to first-person journal narrative
 * @param {string} transcript - Raw conversation transcript
 * @param {string} summary - Call summary
 * @returns {Promise<{content: string, emotion: object}>}
 */
export async function convertTranscriptToJournal(transcript, summary) {
  try {
    console.log('🔄 Converting transcript to journal format...');
    
    const prompt = `You are a journal writing assistant. Convert this therapy/wellness call transcript into a first-person journal entry written from the patient's perspective.

TRANSCRIPT:
${transcript}

CALL SUMMARY:
${summary}

INSTRUCTIONS:
1. Write in first-person (I, me, my)
2. Convert the conversation into flowing narrative paragraphs
3. Capture the patient's feelings, thoughts, and experiences discussed
4. Maintain the emotional tone and key topics
5. Make it read like a personal journal entry, not a transcript
6. Keep it concise (2-4 paragraphs)
7. Include what was discussed and how the patient felt

Also analyze the emotional content and provide:

Return ONLY this JSON (no markdown, no other text):
{
  "journalContent": "The journal entry in paragraph form...",
  "detectedEmotion": "happy" | "sad" | "anxious" | "calm" | "angry" | "excited" | "stressed" | "neutral" | "worried",
  "emotionalIntensity": 1-10,
  "sentiment": "positive" | "negative" | "neutral",
  "stressLevel": "low" | "medium" | "high",
  "topics": ["topic1", "topic2", "topic3"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    console.log('📡 Calling Gemini API for journal conversion...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📄 Raw response length:', text.length);
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    console.log('✅ Journal conversion successful');
    console.log('📝 Content length:', parsed.journalContent?.length || 0);
    console.log('😊 Detected emotion:', parsed.detectedEmotion);
    console.log('💪 Intensity:', parsed.emotionalIntensity);
    
    return {
      content: parsed.journalContent,
      emotion: {
        mood: parsed.detectedEmotion,
        intensity: parsed.emotionalIntensity,
        sentiment: parsed.sentiment,
        stressLevel: parsed.stressLevel,
        topics: parsed.topics || [],
        keywords: parsed.keywords || []
      }
    };
  } catch (error) {
    console.error('❌ Journal conversion error:', error.message);
    
    // Fallback: Use transcript as-is with basic formatting
    console.log('⚠️ Using fallback formatting');
    return {
      content: formatTranscriptFallback(transcript, summary),
      emotion: {
        mood: 'neutral',
        intensity: 5,
        sentiment: 'neutral',
        stressLevel: 'medium',
        topics: [],
        keywords: []
      }
    };
  }
}

/**
 * Fallback function to format transcript if AI fails
 */
function formatTranscriptFallback(transcript, summary) {
  // Remove "Agent:" and "User:" prefixes and join into paragraphs
  const lines = transcript.split('\n')
    .filter(line => line.trim())
    .map(line => {
      return line
        .replace(/^Agent:\s*/i, '')
        .replace(/^User:\s*/i, '')
        .trim();
    })
    .filter(line => line.length > 0);
  
  // Group into paragraphs (every 3-4 lines)
  const paragraphs = [];
  for (let i = 0; i < lines.length; i += 3) {
    const paragraph = lines.slice(i, i + 3).join(' ');
    if (paragraph) paragraphs.push(paragraph);
  }
  
  return `Today I had a conversation about my feelings and experiences.\n\n${paragraphs.join('\n\n')}\n\n${summary}`;
}

/**
 * Analyze journal content for emotions (standalone function)
 * @param {string} content - Journal content
 * @returns {Promise<object>}
 */
export async function analyzeJournalEmotion(content) {
  try {
    console.log('🤖 Analyzing journal emotions...');
    
    const prompt = `Analyze this journal entry for emotional content.

JOURNAL ENTRY:
${content}

Return ONLY this JSON (no markdown, no other text):
{
  "mood": "happy" | "sad" | "anxious" | "calm" | "angry" | "excited" | "stressed" | "neutral" | "worried",
  "emotionalIntensity": 1-10,
  "sentiment": "positive" | "negative" | "neutral",
  "sentimentConfidence": 0-1,
  "stressLevel": "low" | "medium" | "high",
  "stressScore": 0-10,
  "topics": ["topic1", "topic2"],
  "keywords": ["keyword1", "keyword2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ Emotion analysis complete:', parsed.mood);
    
    return parsed;
  } catch (error) {
    console.error('❌ Emotion analysis error:', error.message);
    return {
      mood: 'neutral',
      emotionalIntensity: 5,
      sentiment: 'neutral',
      sentimentConfidence: 0.5,
      stressLevel: 'medium',
      stressScore: 5,
      topics: [],
      keywords: []
    };
  }
}
