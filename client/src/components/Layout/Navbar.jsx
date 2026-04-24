import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsModal from '../Settings/SettingsModal';

const Navbar = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <nav className="w-full px-4 sm:px-6 md:px-10 py-4 
        flex items-center justify-between 
        bg-gradient-to-r from-[#1a1a1c]/90 via-[#2a2a2d]/90 to-[#1a1a1c]/90 
        backdrop-blur-lg 
        border-b border-zinc-700 
        shadow-[0_5px_30px_rgba(0,0,0,0.6)]">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-100">
            🤖 AI Chat
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* ⚙️ Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg 
            text-zinc-400 hover:text-zinc-100 
            hover:bg-zinc-800 transition-all duration-300 
            transform hover:rotate-90"
            title="Settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0
                a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 
                2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 
                1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 
                1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 
                1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 
                1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37
                a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 
                0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 
                2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 
            border border-zinc-400 
            bg-gradient-to-r from-zinc-200 to-zinc-400 
            px-4 sm:px-5 py-2 
            text-xs sm:text-sm font-semibold uppercase tracking-widest 
            text-zinc-900 
            rounded-md 
            transition-all duration-300 
            hover:bg-transparent hover:text-zinc-100"
          >
            Logout
            <span className="transform transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;