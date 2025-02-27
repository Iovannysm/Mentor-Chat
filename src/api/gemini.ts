import { Message } from "../components/MentorChat";

export async function sendMessageToGemini(messages: Message[]): Promise<string> {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!data.response) {
      throw new Error('Invalid response format from Gemini Function');
    }

    return data.response;
  } catch (error) {
    console.error("Gemini Function Error:", error);
    throw new Error("Failed to get response from Gemini Function");
  }
}