
import React from 'react';
import { Theme, Language, User } from '../types';
import { translations } from '../translations';
import * as Icons from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, theme, toggleTheme, language, setLanguage, user, onLogout
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-sm p-8 rounded-[2.5rem] border shadow-2xl animate-in zoom-in duration-200 ${
        isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>{t.settings}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icons.Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Theme Setting */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t.theme}</p>
            <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
              <button 
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-500'
                }`}
              >
                <Icons.Sun className="w-3.5 h-3.5" />
                {t.light}
              </button>
              <button 
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  theme === 'dark' ? (isDark ? 'bg-gray-700 text-white' : 'bg-white text-black shadow-sm') : 'text-gray-500'
                }`}
              >
                <Icons.Moon className="w-3.5 h-3.5" />
                {t.dark}
              </button>
            </div>
          </div>

          {/* Language Setting */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{t.language}</p>
            <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
              <button 
                onClick={() => setLanguage('id')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  language === 'id' ? (isDark ? 'bg-gray-700 text-white' : 'bg-white text-black shadow-sm') : 'text-gray-500'
                }`}
              >
                🇮🇩 ID
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  language === 'en' ? (isDark ? 'bg-gray-700 text-white' : 'bg-white text-black shadow-sm') : 'text-gray-500'
                }`}
              >
                🇺🇸 EN
              </button>
            </div>
          </div>

          {user && (
            <button 
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-4 mt-4 text-[10px] font-bold text-red-500 bg-red-500/5 rounded-2xl hover:bg-red-500/10 transition-all uppercase tracking-[0.2em]"
            >
              {t.logout}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
