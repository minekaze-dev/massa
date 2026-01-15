
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme, Language } from '../types';
import * as Icons from '../components/Icons';

interface TermsPageProps {
  theme: Theme;
  language: Language;
}

const TermsPage: React.FC<TermsPageProps> = ({ theme, language }) => {
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
          massa terms
        </h1>

        <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? '1. Penerimaan Ketentuan' : '1. Acceptance of Terms'}
            </h2>
            <p>
              {isIndo 
                ? 'Dengan menggunakan massa (STATUR), Anda setuju untuk terikat oleh ketentuan penggunaan ini. Platform kami fokus pada ekspresi diri melalui teks dan suara secara minimalis.'
                : 'By using massa (STATUR), you agree to be bound by these terms. Our platform focuses on minimalist self-expression through text and voice.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? '2. Durasi Konten' : '2. Content Duration'}
            </h2>
            <p>
              {isIndo 
                ? 'Kami menawarkan dua mode durasi: Sementara (24 Jam) dan Tetap. Konten sementara akan dihapus secara otomatis dari server publik kami setelah 24 jam.'
                : 'We offer two duration modes: Temporary (24 Hours) and Permanent. Temporary content will be automatically removed from our public servers after 24 hours.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? '3. Penggunaan Suara' : '3. Voice Usage'}
            </h2>
            <p>
              {isIndo 
                ? 'Anda bertanggung jawab penuh atas semua rekaman suara yang Anda unggah. Dilarang mengunggah konten yang mengandung kebencian, pelecehan, atau materi ilegal.'
                : 'You are solely responsible for all voice recordings you upload. It is forbidden to upload content containing hate speech, harassment, or illegal material.'}
            </p>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? '4. Identitas Pengguna' : '4. User Identity'}
            </h2>
            <p>
              {isIndo 
                ? 'Username (@handle) dapat diubah satu kali setiap minggu. Perubahan ini bersifat permanen selama masa kunci tersebut berlaku.'
                : 'Usernames (@handle) can be changed once per week. This change is locked for the duration of that period.'}
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

export default TermsPage;