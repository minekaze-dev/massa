
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Theme, Language, User } from '../types';
import { translations } from '../translations';
import * as Icons from './Icons';

interface BottomNavProps {
  theme: Theme;
  language: Language;
  user: User | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ theme, language, user }) => {
  const location = useLocation();
  const t = translations[language];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] h-16 sm:hidden border-t border-white/5 bg-black">
      <div className="h-full flex items-center justify-between px-6 relative">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${
            isActive('/') 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          <Icons.Home className={isActive('/') ? 'w-6 h-6' : 'w-5 h-5 opacity-70'} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t.feeds}</span>
        </Link>

        {/* Floating Action Button for mobile */}
        <div className="flex-1 flex justify-center -mt-8">
          <Link 
            to={user ? "/post" : "/"} 
            className={`w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border-4 border-black transition-transform active:scale-90`}
          >
            <Icons.Plus className="w-7 h-7" />
          </Link>
        </div>

        <Link 
          to="/binder" 
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${
            isActive('/binder') 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          <Icons.Binder className={isActive('/binder') ? 'w-6 h-6' : 'w-5 h-5 opacity-70'} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t.binder}</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
