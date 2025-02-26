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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const aiResponse = await sendMessageToGemini([
        {
          role: 'system',
          content: 'You are a helpful AI mentor who provides guidance and answers questions about Finances and Financial Planning. Format important concepts with **double asterisks** and suggest relevant YouTube videos at the end.'
        },
        ...messages,
        userMessage
      ]);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: Error | unknown) {
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to get response'}`);
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: option
    };

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, userMessage]);

      const aiResponse = await sendMessageToGemini([
        { role: 'system', content: '' },  // System prompt is now handled in the API
        ...messages,
        userMessage
      ]);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
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