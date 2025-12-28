import fetch from 'node-fetch';

const testGeminiAPI = async () => {
  try {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    console.log('Testing Gemini 2.5 Flash API with more tokens...');
    
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
                  text: "What emotion do you detect in this text: 'I am feeling happy today'? Respond with only the emotion word."
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 50,
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

testGeminiAPI();
