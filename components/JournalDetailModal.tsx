
import React, { useState, useRef } from 'react';
import { Post, Theme, Language, User } from '../types';
import { translations } from '../translations';
import * as Icons from './Icons';

interface JournalDetailModalProps {
  post: Post;
  user: User;
  theme: Theme;
  language: Language;
  onClose: () => void;
  onLike: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

const JournalDetailModal: React.FC<JournalDetailModalProps> = ({ 
  post, user, theme, language, onClose, onLike, onEdit, onDelete, isOwner 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isDark = theme === 'dark';
  const t = translations[language];

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(ts);
  };

  const getSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleShare = async () => {
    const slug = getSlug(post.title || post.content || "note");
    const shareUrl = `${window.location.origin}${window.location.pathname}#/journal/${post.id}/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "MASSA Journal",
          text: post.content?.slice(0, 100) + "...",
          url: shareUrl,
        });
      } catch (err) { console.debug("Share failed", err); }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />
      <div 
        className={`relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-[3rem] border shadow-2xl animate-in zoom-in duration-500 modal-content ${
          isDark ? 'bg-[#1E1E1E] border-gray-800 text-gray-200' : 'bg-[#FFFDF5] border-amber-100 text-gray-800'
        }`}
        style={{
          backgroundImage: isDark 
            ? 'linear-gradient(transparent 95%, rgba(255,255,255,0.05) 95%)' 
            : 'linear-gradient(transparent 95%, rgba(0,0,0,0.05) 95%)',
          backgroundSize: '100% 2rem',
          lineHeight: '2rem',
          backgroundPosition: '0 0.5rem'
        }}
      >
        {isCopied && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full z-[130] shadow-2xl animate-in slide-in-from-top-4 duration-300">
            {t.linkCopied}
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none z-10" />
        <div className="p-8 sm:p-14 relative">
          <div className="sticky top-4 sm:top-6 float-right z-50 flex items-center gap-2 -mr-2 sm:mr-0">
            <button 
              onClick={handleShare}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${
                isDark ? 'bg-gray-800/95 border-gray-700 text-gray-300' : 'bg-white/95 border-gray-200 text-gray-500'
              } backdrop-blur-md`}
              title={t.share}
            >
              <Icons.Share className="w-3.5 h-3.5 sm:w-4 h-4" />
            </button>
            {isOwner && (
              <>
                <button 
                  onClick={onEdit}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${
                    isDark ? 'bg-gray-800/95 border-gray-700 text-indigo-400' : 'bg-white/95 border-gray-200 text-indigo-600'
                  } backdrop-blur-md`}
                >
                  <Icons.Pen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={onDelete}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${
                    isDark ? 'bg-gray-800/95 border-gray-700 text-red-400' : 'bg-white/95 border-gray-200 text-red-500'
                  } backdrop-blur-md`}
                >
                  <Icons.Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${
                isDark 
                  ? 'bg-gray-800/95 border-gray-700 text-white backdrop-blur-md' 
                  : 'bg-slate-900/95 border-slate-700 text-white backdrop-blur-md'
              }`}
            >
              <Icons.Plus className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" />
            </button>
          </div>
          <div className="mb-10 flex flex-col justify-between gap-6" style={{ lineHeight: '1.4' }}>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/70">{language === 'id' ? 'Buku Catatan' : 'Notebook'} #{post.id.slice(-4)}</span>
              <h3 className={`text-2xl font-bold tracking-tight pr-32 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {post.title || post.content?.split(' ').slice(0, 4).join(' ') + '...'}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                <span className="flex items-center gap-1.5"><Icons.Users className="w-3 h-3" /> {post.user.name}</span>
                <span className="opacity-30">/</span>
                <span className="flex items-center gap-1.5"><Icons.Clock className="w-3 h-3" /> {formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="relative">
            {post.imageUrl && (
              <div className="float-none sm:float-right sm:ml-10 sm:mb-6 w-full sm:w-80 rotate-1 shadow-2xl relative border p-2.5 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 rounded-lg">
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/30 backdrop-blur-[2px] border border-white/20 rotate-1 shadow-sm opacity-60 z-20" />
                 <img src={post.imageUrl} alt="Notebook entry" className="w-full aspect-[4/5] object-cover rounded shadow-inner" />
              </div>
            )}
            {post.audioUrl && (
              <div className="float-left mr-4 mt-1">
                <button 
                  onClick={toggleAudio}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl border-2 ${
                    isPlaying 
                      ? 'bg-indigo-600 text-white border-indigo-500' 
                      : (isDark ? 'bg-[#262626] text-white border-gray-700' : 'bg-white text-slate-900 border-amber-100')
                  }`}
                >
                  {isPlaying ? <Icons.Pause className="w-5 h-5" /> : <Icons.Mic className="w-5 h-5" />}
                  <audio ref={audioRef} src={post.audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                </button>
              </div>
            )}
            <div className={`text-[14px] sm:text-[15px] font-medium whitespace-pre-wrap leading-[2rem] text-justify ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              {post.content || "Tanpa catatan teks..."}
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-dashed border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="flex gap-6">
               <button onClick={() => onLike(post.id)} className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${post.hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
                 <Icons.Heart filled={post.hasLiked} className="w-4 h-4" /> {post.likes}
               </button>
               <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
                 <span className="opacity-70">{t.viewsLabel}:</span>
                 <Icons.Eye className="w-4 h-4" /> {post.views || 0}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetailModal;
