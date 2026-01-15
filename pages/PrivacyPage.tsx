
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme, Language } from '../types';
import * as Icons from '../components/Icons';

interface PrivacyPageProps {
  theme: Theme;
  language: Language;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ theme, language }) => {
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
          Privacy Policy
        </h1>

        <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Data yang Kami Kumpulkan' : 'Data We Collect'}
            </h2>
            <p>
              {isIndo 
                ? 'Kami mengumpulkan data minimal yang diperlukan untuk menjalankan layanan, termasuk profil dasar, konten teks, dan file audio yang Anda bagikan secara sukarela.'
                : 'We collect the minimal data necessary to run our service, including basic profile info, text content, and audio files you voluntarily share.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Keamanan Audio' : 'Audio Security'}
            </h2>
            <p>
              {isIndo 
                ? 'Rekaman suara Anda disimpan dengan enkripsi. Kami tidak menggunakan data suara Anda untuk melatih model AI pihak ketiga tanpa izin eksplisit.'
                : 'Your voice recordings are stored with encryption. We do not use your voice data to train third-party AI models without explicit permission.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Penyimpanan Lokal' : 'Local Storage'}
            </h2>
            <p>
              {isIndo 
                ? 'Kami menggunakan penyimpanan lokal browser Anda untuk menyimpan preferensi tema, bahasa, dan data sesi agar pengalaman Anda lebih cepat dan personal.'
                : 'We use your browser\'s local storage to save theme preferences, language, and session data for a faster and more personalized experience.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Penghapusan Data' : 'Data Deletion'}
            </h2>
            <p>
              {isIndo 
                ? 'Anda dapat menghapus status Anda kapan saja. Untuk konten "Sementara", penghapusan otomatis akan terjadi setelah 24 jam.'
                : 'You can delete your statuses at any time. For "Temporary" content, automatic deletion occurs after 24 hours.'}
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

export default PrivacyPage;
