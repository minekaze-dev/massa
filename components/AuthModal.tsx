
import React, { useState } from 'react';
import { User, Theme, Language } from '../types';
import { translations } from '../translations';
import { MOCK_USERS, CURRENT_USER } from '../constants';
import * as Icons from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  theme: Theme;
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, theme, language }) => {
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (authView === 'forgot') {
      setSuccess(language === 'id' ? 'Tautan atur ulang sandi telah dikirim ke email Anda.' : 'Password reset link has been sent to your email.');
      return;
    }

    if (authView === 'register') {
      const formattedHandle = `@${handle.toLowerCase().trim().replace(/\s+/g, '').replace(/^@/, '')}`;
      const isTaken = MOCK_USERS.some(u => u.handle.toLowerCase() === formattedHandle.toLowerCase());
      
      if (isTaken) {
        setError(language === 'id' ? 'Username sudah digunakan.' : 'Username already taken.');
        return;
      }

      if (handle.length < 3) {
        setError(language === 'id' ? 'Username terlalu pendek.' : 'Username too short.');
        return;
      }

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || 'User Baru',
        handle: formattedHandle,
        avatar: `https://picsum.photos/seed/${email}/100/100`,
        lastHandleUpdate: Date.now()
      };
      onLogin(mockUser);
    } else {
      // Logic for the specific dummy account
      if (email === 'budi@massa.com' && password === 'budi123') {
        onLogin(CURRENT_USER);
      } else if (email && password) {
        // Fallback for other accounts to keep the prototype interactive
        const mockUser: User = {
          id: 'u-logged-in',
          name: email.split('@')[0] || 'User',
          handle: `@${email.split('@')[0] || 'user'}`,
          avatar: `https://picsum.photos/seed/${email}/100/100`
        };
        onLogin(mockUser);
      } else {
        setError(language === 'id' ? 'Email atau password salah.' : 'Incorrect email or password.');
      }
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-md p-10 rounded-[3rem] border shadow-2xl animate-in zoom-in duration-300 ${
        isDark ? 'bg-[#262626] border-gray-800 shadow-black/40' : 'bg-white border-gray-100 shadow-gray-200/50'
      }`}>
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icons.Plus className="w-6 h-6 rotate-45" />
        </button>

        <div className="text-center mb-10 mt-4">
          <Icons.Logo className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h1 className={`text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>massa</h1>
          <p className="text-gray-400 font-medium italic text-[11px] tracking-tight">
            {authView === 'forgot' ? (language === 'id' ? 'Atur ulang kata sandi' : 'Reset your password') : t.authSlogan}
          </p>
          {authView === 'login' && (
            <div className="mt-2 text-[10px] text-gray-500 opacity-60">
              Demo: budi@massa.com / budi123
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest leading-relaxed">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authView === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.fullName}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${
                    isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/\s+/g, '').replace(/^@/, ''))}
                    className={`w-full pl-10 pr-6 py-4 rounded-2xl outline-none border transition-all text-sm ${
                      isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                    }`}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.email}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${
                isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
              }`}
            />
          </div>

          {authView !== 'forgot' && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.password}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${
                  isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                }`}
              />
              {authView === 'login' && (
                <div className="flex justify-end pt-1">
                   <button 
                    type="button"
                    onClick={() => { setAuthView('forgot'); setError(''); setSuccess(''); }}
                    className="text-[9px] font-bold text-gray-400 hover:text-indigo-500 uppercase tracking-widest transition-colors"
                   >
                     {t.forgotPassword}
                   </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.25em] mt-6 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            {authView === 'login' ? t.login : authView === 'register' ? t.register : (language === 'id' ? 'Kirim Tautan' : 'Send Link')}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          {authView !== 'forgot' ? (
            <button
              onClick={() => {
                setAuthView(authView === 'login' ? 'register' : 'login');
                setError('');
                setSuccess('');
              }}
              className="text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase tracking-[0.1em] transition-colors"
            >
              {authView === 'login' ? t.noAccount : t.hasAccount}
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthView('login');
                setError('');
                setSuccess('');
              }}
              className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.1em] transition-colors"
            >
              ← {language === 'id' ? 'Kembali ke Masuk' : 'Back to Login'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
