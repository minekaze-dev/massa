
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authView === 'register') {
        const formattedHandle = `@${handle.toLowerCase().trim().replace(/\s+/g, '').replace(/^@/, '')}`;
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'User Baru',
              handle: formattedHandle
            }
          }
        });

        if (signUpError) throw signUpError;
        
        setSuccess(language === 'id' 
          ? 'Pendaftaran berhasil! Silakan periksa kotak masuk email Anda (termasuk folder spam) untuk mengonfirmasi akun sebelum masuk.' 
          : 'Registration successful! Please check your email inbox (including spam folder) to confirm your account before logging in.');
      } else if (authView === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        
        // Listener di App.tsx akan mendeteksi perubahan auth dan memanggil fetchProfile
        onClose();
      } else if (authView === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        setSuccess(language === 'id' ? 'Tautan atur ulang sandi telah dikirim ke email Anda.' : 'Password reset link has been sent to your email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
               <Icons.CheckCircle className="w-8 h-8 text-indigo-500" />
            </div>
            <h4 className="text-indigo-500 font-black text-xs uppercase tracking-widest mb-2">{language === 'id' ? 'Email Terkirim' : 'Email Sent'}</h4>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-6">{success}</p>
            <button 
              onClick={() => { setAuthView('login'); setSuccess(''); }}
              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}
            >
              {language === 'id' ? 'Lanjut ke Masuk' : 'Continue to Login'}
            </button>
          </div>
        )}

        {!success && (
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
              disabled={loading}
              className={`w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.25em] mt-6 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                authView === 'login' ? t.login : authView === 'register' ? t.register : (language === 'id' ? 'Kirim Tautan' : 'Send Link')
              )}
            </button>
          </form>
        )}

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
