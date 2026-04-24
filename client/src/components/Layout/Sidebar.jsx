import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ModelSelector from '../Chat/ModelSelector';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { chats, activeChat, loadChat, createChat, deleteChat } = useChat();
  const [showModelSelector, setShowModelSelector] = useState(false);
  const sidebarRef = useRef();

  // 🔥 Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCreateChat = async (provider, model) => {
    try {
      await createChat(provider, model);
      setShowModelSelector(false);
      toast.success(`Chat created with ${model}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create chat');
    }
  };

  const formatModelName = (model) => {
    if (!model) return '';
    return model.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 z-50 
        transform transition-transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-gradient-to-b from-[#1a1a1c] to-[#0f0f10] 
        border-r border-zinc-700 
        backdrop-blur-xl 
        shadow-[0_0_40px_rgba(0,0,0,0.8)] 
        flex flex-col`}
      >

        {/* Header */}
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Chats</h2>
          <button
            onClick={() => setShowModelSelector(true)}
            className="text-xs font-semibold uppercase tracking-widest 
            px-3 py-2 border border-zinc-400 
            bg-gradient-to-r from-zinc-200 to-zinc-400 
            text-zinc-900 rounded-md 
            hover:bg-transparent hover:text-zinc-100 transition"
          >
            + New
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {chats.length === 0 ? (
            <div className="text-zinc-500 text-sm text-center mt-10">
              No chats yet 🚀
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => {
                  loadChat(chat._id);
                  onClose?.(); // close on mobile after click
                }}
                className={`group p-3 rounded-lg cursor-pointer transition 
                ${
                  activeChat?._id === chat._id
                    ? 'bg-zinc-700/60'
                    : 'hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex justify-between items-start">

                  <div className="flex-1">
                    <div className="text-sm font-semibold text-zinc-100 truncate">
                      {chat.title || 'Untitled Chat'}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                      <span className="px-2 py-[2px] bg-zinc-700 rounded text-zinc-300">
                        {chat.status}
                      </span>
                      <span className="px-2 py-[2px] bg-zinc-800 rounded text-zinc-400">
                        {chat.provider}
                      </span>
                      <span className="px-2 py-[2px] bg-zinc-900 rounded text-zinc-500">
                        {formatModelName(chat.model)}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this chat?')) {
                        deleteChat(chat._id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 
                    text-zinc-400 hover:text-red-400 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Model Selector */}
        {showModelSelector && (
          <ModelSelector
            onSelect={handleCreateChat}
            onClose={() => setShowModelSelector(false)}
          />
        )}
      </div>
    </>
  );
};

export default Sidebar;