
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Theme, User, Language } from '../types';
import { translations } from '../translations';
import SettingsModal from './SettingsModal';
import * as Icons from './Icons';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  user: User | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, toggleTheme, user, language, setLanguage, onLogout, onLoginClick 
}) => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const t = translations[language];
  const isDark = theme === 'dark';
  
  const isActive = (path: string) => location.pathname === path;

  const profilePath = user ? `/u/${user.handle.replace(/^@/, '')}` : '/profile';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 border-b transition-colors duration-300 ${
        theme === 'light' ? 'bg-white/80 border-gray-100' : 'bg-[#1A1A1A]/80 border-gray-800'
      } backdrop-blur-md`}>
        <div className="max-w-[1000px] mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-1 group">
            <Icons.Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
            <span className={`font-bold text-xl tracking-tight transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              massa
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-6 mr-4">
              <Link 
                to="/" 
                className={`text-[10px] font-bold tracking-[0.15em] transition-colors ${
                  isActive('/') 
                    ? (theme === 'dark' ? 'text-white' : 'text-indigo-600') 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.feeds.toUpperCase()}
              </Link>
              
              <Link 
                to="/binder" 
                className={`text-[10px] font-bold tracking-[0.15em] transition-colors ${
                  isActive('/binder') 
                    ? (theme === 'dark' ? 'text-white' : 'text-indigo-600') 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.binder.toUpperCase()}
              </Link>
            </div>

            {user && (
              <Link 
                to="/post" 
                className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all ${
                  isActive('/post')
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${theme === 'dark' && !isActive('/post') ? 'bg-gray-800 text-gray-300' : ''}`}
              >
                <Icons.Plus />
              </Link>
            )}
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full transition-colors ${
                theme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-800 hover:bg-gray-700'
              } text-gray-500`}
            >
              <Icons.Settings />
            </button>

            <div className={`flex items-center ml-1 ${user ? '' : 'sm:pl-2 sm:border-l ' + (isDark ? 'border-gray-800' : 'border-gray-100')}`}>
              {user ? (
                <Link to={profilePath} className="flex items-center">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border border-gray-200 object-cover hover:ring-2 hover:ring-indigo-500 transition-all"
                  />
                </Link>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className={`text-[10px] font-bold uppercase tracking-widest px-4 sm:px-6 py-2.5 rounded-full transition-all shadow-sm active:scale-95 ${
                    isDark ? 'bg-white text-black' : 'bg-indigo-600 text-white shadow-indigo-500/20'
                  }`}
                >
                  {t.login}
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        user={user}
        onLogout={onLogout}
      />
    </>
  );
};

export default Header;
