
import React, { useState } from 'react';
import { User, Theme, Language } from '../types';
import { translations } from '../translations';
import { MOCK_USERS } from '../constants';
import * as Icons from '../components/Icons';

interface AuthPageProps {
  onLogin: (user: User) => void;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, theme, toggleTheme, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      const formattedHandle = `@${handle.toLowerCase().trim().replace(/\s+/g, '').replace(/^@/, '')}`;
      const isTaken = MOCK_USERS.some(u => u.handle.toLowerCase() === formattedHandle.toLowerCase());
      
      if (isTaken) {
        setError(language === 'id' ? 'Username sudah digunakan.' : 'Username already taken.');
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
      const mockUser: User = {
        id: 'u-logged-in',
        name: email.split('@')[0],
        handle: `@${email.split('@')[0]}`,
        avatar: `https://picsum.photos/seed/${email}/100/100`
      };
      onLogin(mockUser);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#1A1A1A]' : 'bg-[#FAFAF8]'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Icons.Logo className={`w-16 h-16 mx-auto mb-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h1 className={`text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-black'}`}>massa</h1>
          <p className="text-gray-400 font-medium italic text-sm tracking-tight">{t.authSlogan}</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all ${
          isDark ? 'bg-[#262626] border-gray-800 shadow-black/40' : 'bg-white border-gray-100 shadow-gray-200/50'
        }`}>
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.fullName}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-5 py-4 rounded-2xl outline-none border transition-all text-sm ${
                      isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Username (@handle)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/\s+/g, '').replace(/^@/, ''))}
                      className={`w-full pl-9 pr-5 py-4 rounded-2xl outline-none border transition-all text-sm ${
                        isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl outline-none border transition-all text-sm ${
                  isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.password}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl outline-none border transition-all text-sm ${
                  isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] mt-6 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              {isLogin ? t.login : t.register}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase tracking-[0.1em] transition-colors"
            >
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
