import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

const LoginForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans 
      bg-gradient-to-br from-[#0f0f10] via-[#2a2a2d] to-[#0f0f10]">

      {/* Card */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl 
        rounded-2xl border border-zinc-700 
        bg-gradient-to-b from-[#2c2c2f]/90 to-[#1a1a1c]/90 
        backdrop-blur-xl 
        p-6 sm:p-8 md:p-10 
        shadow-[0_10px_60px_rgba(0,0,0,0.8)]">

        {/* Header */}
        <div className="mb-8 sm:mb-10 text-left">
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-100">
            Login
          </h2>
          <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-zinc-400 to-transparent"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">

          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="YOUR@EMAIL.COM"
              className="w-full border-b border-zinc-600 bg-transparent py-2 text-sm text-zinc-100 
              placeholder:text-zinc-500 outline-none transition-all 
              focus:border-zinc-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full border-b border-zinc-600 bg-transparent py-2 text-sm text-zinc-100 
              placeholder:text-zinc-500 outline-none transition-all 
              focus:border-zinc-300"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="group mt-4 flex items-center justify-between 
            border border-zinc-300 
            bg-gradient-to-r from-zinc-200 to-zinc-400 
            px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest 
            text-zinc-900 
            transition-all duration-300 
            hover:bg-transparent hover:text-zinc-100 
            disabled:opacity-50 rounded-md"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && (
              <span className="text-lg transform transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 sm:mt-10 border-t border-zinc-700 pt-5">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-500 text-center sm:text-left">
            New to the platform?{' '}
            <button
              onClick={onToggle}
              className="font-bold text-zinc-300 hover:text-white underline underline-offset-4"
            >
              Create Account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;