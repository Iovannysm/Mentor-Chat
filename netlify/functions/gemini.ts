// netlify/functions/gemini.js

import fetch, { Response } from 'node-fetch';
import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from '@aws-lambda';

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages } = JSON.parse(event.body);
  const GEMINI_API_URL: string =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const API_KEY: string = process.env.VITE_GEMINI_API_KEY!; // Non-null assertion, ensure API key is set

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
                  .map(
                    (msg) =>
                      `${
                        msg.role === 'system'
                          ? 'Instructions: '
                          : msg.role === 'user'
                          ? 'User: '
                          : 'Assistant: '
                      }${msg.content}`
                  )
                  .join('\n'),
              },
            ],
          },
        ],
      }),
    });

    const data: any = await response.json();

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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from Gemini' }),
    };
  }
};