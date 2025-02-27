import fetch, { Response } from 'node-fetch';
import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from '@aws-lambda';

interface GeminiResponse {
  candidates?: [{ content?: { parts?: [{ text?: string }] } }];
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages } = JSON.parse(event.body);
  const GEMINI_API_URL: string =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const API_KEY: string | undefined = process.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gemini API key not set' }),
    };
  }

  try {
    const response: Response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: messages
                  .map((msg) => {
                    const prefix =
                      msg.role === 'system'
                        ? 'Instructions: '
                        : msg.role === 'user'
                        ? 'User: '
                        : 'Assistant: ';
                    return `${prefix}${msg.content}`;
                  })
                  .join('\n'),
              },
            ],
          },
        ],
      }),
    });

    const data: GeminiResponse = await response.json();
    console.log(JSON.stringify(data));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid response format from Gemini' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        response: data.candidates[0].content.parts[0].text,
      }),
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    console.error('Gemini API Error Details:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from Gemini' }),
    };
  }
};