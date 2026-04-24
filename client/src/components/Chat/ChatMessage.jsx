import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`w-full flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>

      {/* AI Avatar (left) */}
      {!isUser && (
        <div className="w-8 h-8 flex items-center justify-center rounded-full 
          bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm">
          🤖
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[85%] sm:max-w-[70%] 
        px-4 py-3 rounded-xl 
        text-sm sm:text-base 
        shadow-md 
        ${
          isUser
            ? 'bg-gradient-to-r from-zinc-200 to-zinc-400 text-zinc-900'
            : 'bg-zinc-800/70 text-zinc-100 border border-zinc-700'
        }`}>

        {/* Role */}
        <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60">
          {isUser ? 'You' : 'AI Assistant'}
        </div>

        {/* Markdown Content */}
        <div className="prose prose-invert prose-sm max-w-none 
          prose-p:my-1 
          prose-pre:bg-black/40 
          prose-pre:p-3 
          prose-pre:rounded-lg 
          prose-code:text-zinc-300">

          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Time */}
        {message.createdAt && (
          <div className="text-[10px] mt-2 opacity-50 text-right">
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* User Avatar (right) */}
      {isUser && (
        <div className="w-8 h-8 flex items-center justify-center rounded-full 
          bg-gradient-to-br from-zinc-300 to-zinc-500 text-sm text-black">
          👤
        </div>
      )}

    </div>
  );
};

export default ChatMessage;