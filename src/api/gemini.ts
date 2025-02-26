import { Message } from "../components/MentorChat";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function sendMessageToGemini(messages: Message[]): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
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
      throw new Error('Invalid response format from Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from Gemini");
  }
} 