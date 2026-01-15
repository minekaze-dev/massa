
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme, Language } from '../types';
import * as Icons from '../components/Icons';

interface CookiesPageProps {
  theme: Theme;
  language: Language;
}

const CookiesPage: React.FC<CookiesPageProps> = ({ theme, language }) => {
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const isIndo = language === 'id';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-600 transition-colors"
      >
        <Icons.Plus className="w-3 h-3 rotate-[135deg]" />
        {isIndo ? 'Kembali' : 'Back'}
      </button>

      <div className={`p-10 sm:p-16 rounded-[3rem] border shadow-2xl ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'}`}>
        <h1 className={`text-4xl font-bold tracking-tight mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Cookies Policy
        </h1>

        <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Penggunaan Teknologi Penyimpanan' : 'Use of Storage Technology'}
            </h2>
            <p>
              {isIndo 
                ? 'MASSA tidak menggunakan cookie pelacakan iklan tradisional. Kami mengandalkan LocalStorage untuk fungsi teknis dasar.'
                : 'MASSA does not use traditional ad tracking cookies. We rely on LocalStorage for basic technical functions.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'LocalStorage Fungsional' : 'Functional LocalStorage'}
            </h2>
            <p>
              {isIndo 
                ? 'Teknologi ini memungkinkan kami mengingat apakah Anda menggunakan mode Gelap atau Terang, serta pilihan bahasa Anda (ID/EN).'
                : 'This technology allows us to remember whether you use Dark or Light mode, as well as your language choice (ID/EN).'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Manajemen Sesi' : 'Session Management'}
            </h2>
            <p>
              {isIndo 
                ? 'Informasi login minimal disimpan secara lokal untuk menjaga Anda tetap masuk ke akun Anda tanpa harus memasukkan kredensial berulang kali.'
                : 'Minimal login information is stored locally to keep you signed in to your account without having to re-enter credentials repeatedly.'}
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {isIndo ? 'Terakhir diperbarui: Maret 2024' : 'Last updated: March 2024'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
