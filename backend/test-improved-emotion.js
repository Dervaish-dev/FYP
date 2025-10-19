import fetch from 'node-fetch';

const testEmotionDetection = async () => {
  try {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    console.log('Testing improved emotion detection...');
    
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
                  text: "You are an expert emotion recognition AI. Carefully analyze this facial expression image and identify the most prominent emotion. Look for facial cues like: tears, crying, open mouth, teeth showing, facial tension, eye expressions, etc. Respond with ONLY one emotion word from this list: Happy, Sad, Calm, Angry, Stressed, Neutral, Excited, Worried, Confused, Surprised. Be precise and accurate - if someone is crying or showing distress, respond with 'Sad'. If they're laughing or smiling, respond with 'Happy'. Only respond with 'Neutral' if there's truly no clear emotion visible."
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
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

testEmotionDetection();
