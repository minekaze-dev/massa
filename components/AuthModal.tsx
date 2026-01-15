
import React, { useState } from 'react';
import { User, Theme, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabaseClient';
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
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (authView === 'register') {
        const formattedHandle = `@${handle.toLowerCase().trim().replace(/\s+/g, '').replace(/^@/, '')}`;
        
        // 1. Sign up user via Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (signUpData.user) {
          // 2. Create profile in 'users' table
          const newUser: User = {
            id: signUpData.user.id,
            name: name || 'User',
            handle: formattedHandle,
            avatar: `https://picsum.photos/seed/${signUpData.user.id}/100/100`,
            lastHandleUpdate: Date.now()
          };
          const { error: profileError } = await supabase.from('users').insert(newUser);
          if (profileError) throw profileError;
          onLogin(newUser);
        }
      } else if (authView === 'login') {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (signInData.user) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', signInData.user.id).single();
          if (profile) onLogin(profile);
        }
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        setSuccess(language === 'id' ? 'Tautan atur ulang sandi terkirim!' : 'Reset link sent!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-md p-10 rounded-[3rem] border shadow-2xl animate-in zoom-in duration-300 ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'}`}>
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><Icons.Plus className="w-6 h-6 rotate-45" /></button>
        <div className="text-center mb-10 mt-4">
          <Icons.Logo className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h1 className="text-3xl font-bold tracking-tight mb-1 dark:text-white">massa</h1>
          <p className="text-gray-400 font-medium italic text-[11px] tracking-tight">{authView === 'forgot' ? (language === 'id' ? 'Atur ulang kata sandi' : 'Reset password') : t.authSlogan}</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center text-[10px] font-bold text-green-500 uppercase tracking-widest">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authView === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.fullName}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                  <input type="text" required value={handle} onChange={(e) => setHandle(e.target.value.replace(/\s+/g, '').replace(/^@/, ''))} className={`w-full pl-10 pr-6 py-4 rounded-2xl outline-none border transition-all text-sm ${isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.email}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
          </div>
          {authView !== 'forgot' && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.password}</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
              {authView === 'login' && <div className="flex justify-end pt-1"><button type="button" onClick={() => setAuthView('forgot')} className="text-[9px] font-bold text-gray-400 hover:text-indigo-500 uppercase tracking-widest">{t.forgotPassword}</button></div>}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.25em] mt-6 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (authView === 'login' ? t.login : authView === 'register' ? t.register : 'Reset Password')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')} className="text-[10px] text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase tracking-[0.1em] transition-colors">
            {authView === 'login' ? t.noAccount : t.hasAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
