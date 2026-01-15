
import React from 'react';
import { Link } from 'react-router-dom';
import { Theme, Language } from '../types';

interface FooterProps {
  theme: Theme;
  language: Language;
}

const Footer: React.FC<FooterProps> = ({ theme, language }) => {
  const isDark = theme === 'dark';
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'massa Terms', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Cookies Policy', path: '/cookies' },
    { label: 'Report a problem', path: '/report' },
  ];

  return (
    <footer className={`mt-24 pb-16 px-4 transition-colors duration-300 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-medium tracking-tight">
        <span className="opacity-80">© {currentYear}</span>
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="hover:text-indigo-500 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
