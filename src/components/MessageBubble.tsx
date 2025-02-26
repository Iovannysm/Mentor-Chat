import React from 'react';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  onOptionSelect: (option: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, onOptionSelect }) => {
  const isUser = role === 'user';
  const defaultUser = {
    name: role === 'assistant' ? 'AI Assistant' : 'You',
    avatar: role === 'assistant' ? '/ai-avatar.png' : '/user-avatar.png'
  };

  const renderContent = () => {
    if (role === 'assistant') {
      const lines = content.split('\n');
      return (
        <div className="space-y-4">
          {lines.map((line, index) => {
            // Main title (first line)
            if (index === 0) {
              return (
                <h2 key={index} className="text-2xl font-bold text-gray-800 mb-6">
                  {line}
                </h2>
              );
            }

            // Section headers (ending with ':')
            if (line.trim().endsWith(':')) {
              return (
                <h3 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                  {line}
                </h3>
              );
            }

            // Topic buttons
            const parts = line.split(/(\*\*.*?\*\*)/g);
            if (parts.length > 1) {
              return (
                <div key={index} className="flex flex-wrap gap-2 items-center mb-2">
                  {parts.map((part, i) => {
                    const topicMatch = part.match(/^\*\*(.*?)\*\*$/);
                    if (topicMatch) {
                      const topic = topicMatch[1].trim();
                      // Check if this is a subtopic (shorter text followed by a colon)
                      const isSubtopic = topic.length < 30 && topic.includes(':');
                      return (
                        <button
                          key={i}
                          onClick={() => onOptionSelect(topic)}
                          className={`inline-flex px-4 py-1 bg-blue-50 text-blue-900 
                            rounded-full hover:bg-blue-100 transition-colors
                            ${isSubtopic 
                              ? 'text-xs font-medium' 
                              : 'text-base font-semibold'} 
                            border border-blue-200 hover:border-blue-300
                            shadow-sm hover:shadow whitespace-nowrap`}
                        >
                          {topic}
                        </button>
                      );
                    }
                    return part && (
                      <span key={i} className="text-base text-gray-700">
                        {part}
                      </span>
                    );
                  })}
                </div>
              );
            }

            // Questions
            if (line.trim().endsWith('?')) {
              return (
                <p key={index} className="text-base font-medium text-blue-900 mt-4">
                  {line}
                </p>
              );
            }

            // Regular text (only if not a definition)
            if (line.trim() && !line.includes(':')) {
              return (
                <p key={index} className="text-base text-gray-700">
                  {line}
                </p>
              );
            }

            // Handle video recommendations
            if (line.trim().startsWith('- "')) {
              const videoMatch = line.match(/- "(.*?)" by (.*?):/);
              if (videoMatch) {
                const [_, title, channel] = videoMatch;
                const description = line.split(': ')[1];
                // Create a search query URL for YouTube
                const searchQuery = encodeURIComponent(`${title} ${channel}`);
                const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
                
                return (
                  <a 
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index} 
                    className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50 
                      hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex-shrink-0">
                      <svg 
                        className="w-6 h-6 text-red-500 group-hover:text-red-600 transition-colors" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                        {title}
                      </h4>
                      <p className="text-xs text-gray-600">by {channel}</p>
                      {description && (
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg 
                        className="w-4 h-4 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                        />
                      </svg>
                    </div>
                  </a>
                );
              }
            }

            return null; // Skip definitions
          })}
        </div>
      );
    }
    return <p className="text-base text-gray-700">{content}</p>;
  };

  return (
    <div className={`${styles.container} ${isUser ? styles.messageRight : styles.messageLeft}`}>
      <div className={styles.userInfo}>
        <img
          src={defaultUser.avatar}
          alt={defaultUser.name}
          className={styles.avatar}
        />
        <span className={styles.userName}>{defaultUser.name}</span>
      </div>
      
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        {renderContent()}
      </div>
    </div>
  );
};