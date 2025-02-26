import { Message, ChatResponse } from '../types/mentor';

export const sendMessage = async (messages: Message[]): Promise<ChatResponse> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages
      })
    });

    const data = await response.json();
    return { message: data.choices[0].message.content };
  } catch (error) {
    return { message: '', error: 'Failed to get response from AI' };
  }
}; 