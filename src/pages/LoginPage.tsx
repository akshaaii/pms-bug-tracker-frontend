import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  Bug as BugIcon,
  User as UserIcon,
  Lock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { USERS } from '../constants';

/**
 * Login page. Handles credential submission, quick-login shortcuts, and
 * redirects to /dashboard on success. handleLogin / handleSwitchUser in
 * AppContext are async since they call the real Spring Boot backend, so
 * this component awaits them and shows a brief "logging in..." state.
 */
export default function LoginPage() {
  const { currentUser, handleLogin, handleSwitchUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already authenticated — send straight to dashboard
  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');
    try {
      const error = await handleLogin(usernameInput, passwordInput);
      if (error) {
        setLoginError(error);
      } else {
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = async (username: string) => {
    setIsSubmitting(true);
    setLoginError('');
    try {
      await handleSwitchUser(username);
      navigate(from, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1226] flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 font-sans select-none relative overflow-hidden">
      {/* Abstract background decorative patterns */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#294fdb]/5 rounded-full blur-3xl" />

      {/* Logo & Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-950/70 border border-[#2a2d3e] rounded-xl mb-4 shadow-xl">
          <BugIcon className="w-10 h-10 text-[#b8c3ff]" />
        </div>
        <h2 className="text-3xl font-black font-sans tracking-tight text-[#dee1fd]">CSE – PMS</h2>
        <p className="mt-1.5 text-xs text-[#8e90a0] font-sans tracking-wide uppercase">
          Project Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#161a2e] py-8 px-6 shadow-2xl border border-[#2a2d3e]/85 rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Error Banner */}
            {loginError && (
              <div id="login-error-banner" className="bg-[#93000a]/20 border border-[#93000a]/72 text-[#ffb4ab] text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-300" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a0]">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="Enter username (e.g. tester)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#0d1226]/80 border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all placeholder:text-[#8e90a0]/40 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-black text-[#8e90a0] uppercase tracking-wider">
                Password (match username)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a0]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#0d1226]/80 border border-[#2a2d3e] text-xs text-[#dee1fd] rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-[#b8c3ff] focus:border-[#b8c3ff] outline-none transition-all placeholder:text-[#8e90a0]/40 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-xs font-sans font-bold text-[#dee1fd] bg-[#294fdb] hover:bg-[#4a6cf7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#294fdb] transition-all cursor-pointer shadow-[#001e77]/40 text-center active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Logging in...' : 'Login Secure Gateway'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-6 pt-5 border-t border-[#2a2d3e]/55 text-center">
            <span className="text-[10px] font-mono font-black text-[#8e90a0] uppercase tracking-wider block mb-3">
              Quick-Login Interactive Roles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-quick-qa"
                disabled={isSubmitting}
                onClick={() => quickLogin('tester')}
                className="bg-[#1a1f32] hover:bg-[#2f3449] border border-[#2a2d3e] text-[11px] py-2 rounded-lg font-bold font-sans text-[#b8c3ff] transition-all text-center disabled:opacity-50"
              >
                Riyaz (QA Lead)
              </button>
              <button
                type="button"
                id="btn-quick-dev"
                disabled={isSubmitting}
                onClick={() => quickLogin('developer')}
                className="bg-[#1a1f32] hover:bg-[#2f3449] border border-[#2a2d3e] text-[11px] py-2 rounded-lg font-bold font-sans text-amber-300 transition-all text-center disabled:opacity-50"
              >
                Antony Lawrence (Sr Dev)
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-5 text-center">
            <p className="text-[10px] text-[#8e90a0]/60 font-sans leading-relaxed">
              Internal Access Only. Restrict unauthorized system requests loops. Registered with TLS Encryption standards.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center max-w-sm z-10 px-4">
        <p className="text-[11px] text-[#8e90a0] font-sans leading-normal">
          &copy; 2026 Computer Science Engineering | CSE - PMS Bug Repository Workspace. Developed for extreme reliability.
        </p>
      </div>
    </div>
  );
}
