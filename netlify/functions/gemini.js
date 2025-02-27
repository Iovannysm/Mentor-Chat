// netlify/functions/gemini.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages } = JSON.parse(event.body);
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const API_KEY = process.env.VITE_GEMINI_API_KEY;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: messages.map(msg =>
              `${msg.role === 'system' ? 'Instructions: ' : msg.role === 'user' ? 'User: ' : 'Assistant: '}${msg.content}`
            ).join('\n')
          }]
        }]
      })
    });

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Invalid response format from Gemini' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response: data.candidates[0].content.parts[0].text }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get response from Gemini' }) };
  }
};