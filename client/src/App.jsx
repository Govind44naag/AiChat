import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

/* ================= AUTH PAGE ================= */
const AuthPage = () => {
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-[#0f0f10] via-[#1a1a1c] to-[#0f0f10]">

      <div className="w-full max-w-md">

        <h1 className="text-center text-2xl sm:text-3xl font-bold 
          text-zinc-100 mb-8 tracking-tight">
          🤖 AI Chat Platform
        </h1>

        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )}

      </div>
    </div>
  );
};

/* ================= DASHBOARD ================= */
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="h-screen flex flex-col 
      bg-gradient-to-br from-[#0f0f10] via-[#1a1a1c] to-[#0f0f10]">

      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-20 left-4 z-50 
px-3 py-2 rounded-md 
bg-zinc-800 border border-zinc-700 text-zinc-200 
shadow-md"
        >
          ☰
        </button>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>

      </div>
    </div>
  );
};

/* ================= APP ROOT ================= */
function App() {
  return (
    <ChatProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1c',
            color: '#e4e4e7',
            border: '1px solid #3f3f46',
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </ChatProvider>
  );
}

export default App;