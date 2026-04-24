import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatWindow = () => {
  const { activeChat, messages, loading, error, sendMessage } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🧊 Empty state
  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full 
        text-center px-6 
        bg-gradient-to-br from-[#0f0f10] via-[#1a1a1c] to-[#0f0f10]">

        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">
          🤖 AI Chat Platform
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md">
          Select a chat from the sidebar or create a new one to get started
        </p>
      </div>
    );
  }

  // 🚫 Token exhausted state
  if (activeChat.status === 'token_exhausted') {
    return (
      <div className="flex flex-col items-center justify-center h-full 
        text-center px-6 
        bg-gradient-to-br from-[#0f0f10] via-[#1a1a1c] to-[#0f0f10]">

        <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">
          🚫 Token Limit Reached
        </h2>
        <p className="text-zinc-400 max-w-md">
          This chat has reached its daily token limit. Create a new chat with a different model.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full 
      bg-gradient-to-br from-[#0f0f10] via-[#1a1a1c] to-[#0f0f10]">

      {/* Header */}
      <div className="px-4 sm:px-6 py-3 
        border-b border-zinc-700 
        flex items-center justify-between 
        backdrop-blur-lg 
        bg-[#1a1a1c]/70">

        <h3 className="text-sm sm:text-lg font-semibold text-zinc-100 truncate">
          {activeChat.title}
        </h3>

        <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full 
          bg-zinc-800 text-zinc-400 border border-zinc-700">
          {activeChat.provider} / {activeChat.model}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">

        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex gap-1 items-center px-2">
            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-300"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 sm:mx-6 mb-2 px-4 py-2 
          text-xs sm:text-sm text-red-300 
          bg-red-900/30 border border-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
};

export default ChatWindow;