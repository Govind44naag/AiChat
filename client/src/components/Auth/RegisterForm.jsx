import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';

const RegisterForm = ({ onToggle }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      localStorage.setItem('token', response.data.token);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f0f10] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#18181b] p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-400">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="johndoe"
              className="flex h-11 w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="name@example.com"
              className="flex h-11 w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-zinc-400">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              className="flex h-11 w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-zinc-100 px-8 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500">Already have an account?</span>
          <button
            onClick={onToggle}
            className="ml-1 font-medium text-zinc-200 underline-offset-4 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;