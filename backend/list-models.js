import fetch from 'node-fetch';

const listGeminiModels = async () => {
  try {
    const apiKey = "AIzaSyCdXfMReLRX-hyc20BZ7wrO0Cw4mvVUJR0";
    
    console.log('Listing available Gemini models...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Available models:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

listGeminiModels();
