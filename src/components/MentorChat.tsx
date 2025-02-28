import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble.tsx';
import { sendMessageToGemini } from '../api/gemini.ts';
import styles from './MentorChat.module.css';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const MentorChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add the hardcoded initial message when the component mounts
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your financial mentor. How can I assist you today?"
      }
    ]);
  }, []);

  const handleSendMessage = async (userMessageContent: string) => { // Consolidated function
    if (isLoading) return;

    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: userMessageContent.trim()
    };

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const maxHistoryTokens = 1000;
      const history = getLimitedHistory(messages, userMessage, maxHistoryTokens);

      const aiResponse = await sendMessageToGemini([
        {
          role: 'system',
          content: 'Finance mentor. Use **bold** concepts. Suggest YouTube videos.'
        },
        ...history,
      ]);

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(`Error: ${errorMessage}`);
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSendMessage(input);
    setInput("");
  };

  const handleOptionSelect = async (option: string) => {
    handleSendMessage(option);
  };

  const getLimitedHistory = (messages: Message[], newMessage: Message, maxTokens: number): Message[] => {
    let currentTokens = 0;
    const limitedHistory: Message[] = [];

    currentTokens += countTokens(newMessage.content);
    limitedHistory.unshift(newMessage);

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = countTokens(message.content);

      if (currentTokens + messageTokens <= maxTokens) {
        currentTokens += messageTokens;
        limitedHistory.unshift(message);
      } else {
        break;
      }
    }

    return limitedHistory;
  };

  const countTokens = (text: string): number => {
    return text.split(/\s+/).length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            onOptionSelect={handleOptionSelect}
          />
        ))}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        {isLoading && (
          <div className={styles.loading}>
            AI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
