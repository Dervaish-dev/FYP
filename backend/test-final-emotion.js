import fetch from 'node-fetch';

const testEmotionDetection = async () => {
  try {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    console.log('Testing final emotion detection...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Look at this face. Is the person crying, smiling, angry, or calm? Answer with one word: Happy, Sad, Angry, Calm, Neutral, Stressed, Excited, Worried, Confused, Surprised."
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Success! Gemini API response:', JSON.stringify(data, null, 2));
    
    // Extract the text content
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log('Detected emotion:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('No text content found in response');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testEmotionDetection();
