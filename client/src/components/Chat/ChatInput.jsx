import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSend, disabled, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef();

  // 🔥 Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 md:px-10 py-4 
      bg-gradient-to-t from-[#0f0f10] via-[#1a1a1c] to-transparent 
      border-t border-zinc-700">

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">

        <div className="flex items-end gap-3 
          bg-gradient-to-b from-[#2a2a2d]/90 to-[#1a1a1c]/90 
          backdrop-blur-lg 
          border border-zinc-700 
          rounded-xl px-3 py-2 
          shadow-[0_5px_30px_rgba(0,0,0,0.6)]">

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent 
            text-sm sm:text-base text-zinc-100 
            placeholder:text-zinc-500 
            outline-none 
            max-h-40 overflow-y-auto"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="flex items-center justify-center 
            w-10 h-10 sm:w-11 sm:h-11 
            rounded-lg 
            bg-gradient-to-r from-zinc-200 to-zinc-400 
            text-zinc-900 
            font-bold 
            transition-all duration-300 
            hover:bg-transparent hover:text-zinc-100 
            disabled:opacity-40"
          >
            {disabled ? (
              <span className="animate-pulse">•••</span>
            ) : (
              <span className="transform transition-transform hover:translate-x-1">
                ➤
              </span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ChatInput;