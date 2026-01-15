
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme, Language, User } from '../types';
import * as Icons from '../components/Icons';

interface ReportPageProps {
  theme: Theme;
  language: Language;
  user: User | null;
}

const ReportPage: React.FC<ReportPageProps> = ({ theme, language, user }) => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isDark = theme === 'dark';
  const isIndo = language === 'id';

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setDescription('');
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-600 transition-colors"
      >
        <Icons.Plus className="w-3 h-3 rotate-[135deg]" />
        {isIndo ? 'Kembali' : 'Back'}
      </button>

      <div className={`p-10 sm:p-14 rounded-[3rem] border shadow-2xl ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'}`}>
        <h1 className={`text-3xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isIndo ? 'Laporkan Masalah' : 'Report a Problem'}
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          {isIndo 
            ? 'Bantu kami menjadikan MASSA lebih baik dengan melaporkan bug atau konten yang tidak pantas.' 
            : 'Help us make MASSA better by reporting bugs or inappropriate content.'}
        </p>

        {isSuccess ? (
          <div className="py-12 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.CheckCircle className="w-10 h-10" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isIndo ? 'Laporan Terkirim!' : 'Report Sent!'}
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              {isIndo 
                ? 'Terima kasih atas kontribusi Anda. Kami akan segera meninjaunya.' 
                : 'Thank you for your contribution. We will review it shortly.'}
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:underline"
            >
              {isIndo ? 'Kirim Laporan Lain' : 'Send Another Report'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {isIndo ? 'Tipe Laporan' : 'Report Type'}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'bug', label: isIndo ? 'Bug Aplikasi' : 'App Bug' },
                  { id: 'content', label: isIndo ? 'Konten Negatif' : 'Bad Content' },
                  { id: 'other', label: isIndo ? 'Lainnya' : 'Other' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setReportType(type.id)}
                    className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      reportType === type.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : `${isDark ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-400'}`
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {isIndo ? 'Deskripsi' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isIndo ? "Jelaskan detail masalahnya..." : "Explain the details of the problem..."}
                className={`w-full min-h-[150px] p-5 rounded-2xl outline-none border transition-all text-sm resize-none ${
                  isDark 
                    ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5'
              } bg-indigo-600 text-white`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                isIndo ? 'Kirim Laporan' : 'Send Report'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
