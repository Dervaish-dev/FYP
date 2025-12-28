import fetch from 'node-fetch';

const testGeminiAPI = async () => {
  try {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    console.log('Testing Gemini API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "What emotion do you detect in this text: 'I am feeling happy today'? Respond with only the emotion word."
                }
              ]
            }
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

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Success! Gemini API response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testGeminiAPI();
