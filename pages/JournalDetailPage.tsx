
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Post, Theme, Language, User } from '../types';
import { translations } from '../translations';
import * as Icons from '../components/Icons';

interface JournalDetailPageProps {
  posts: Post[];
  theme: Theme;
  language: Language;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  currentUser: User | null;
  onToggleFollowAuthor?: (authorId: string) => void;
  followedAuthorIds?: string[];
}

const JournalDetailPage: React.FC<JournalDetailPageProps> = ({ 
  posts, theme, language, onLike, onDelete, currentUser, onToggleFollowAuthor, followedAuthorIds = [] 
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = translations[language];
  const isDark = theme === 'dark';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const post = posts.find(p => p.id === id);
  const isOwner = currentUser && post && currentUser.id === post.userId;
  const isFollowing = post && followedAuthorIds.includes(post.userId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-gray-400 font-bold uppercase tracking-widest mb-4">Post not found</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Go Back</button>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(ts);
  };

  const getSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleShare = async () => {
    const slug = getSlug(post.title || post.content || "catatan");
    const shareUrl = `${window.location.origin}/#/journal/${post.id}/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title || "MASSA Journal", text: post.content?.slice(0, 100).replace(/<[^>]*>/g, '') + "...", url: shareUrl });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (window.confirm(language === 'id' ? 'Hapus catatan ini selamanya?' : 'Delete this note permanently?')) {
      onDelete?.(post.id);
      navigate(-1);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 sm:px-4">
      {isCopied && <div className="fixed top-24 left-1/2 -translate-x-1/2 px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-full z-[130] shadow-2xl animate-in slide-in-from-top-4 duration-300">{t.linkCopied}</div>}
      
      <div className="mb-6 sm:mb-8 px-4 sm:px-0 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
          <Icons.Plus className="w-3 h-3 rotate-[135deg]" />
          {language === 'id' ? 'Kembali' : 'Back'}
        </button>
        <span className="text-gray-200 dark:text-gray-800 text-xs">/</span>
        <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400/50' : 'text-indigo-600/50'}`}>
          {t.notebook}
        </div>
      </div>

      <div className={`relative w-full rounded-none border shadow-2xl overflow-hidden transition-colors ${isDark ? 'bg-[#1E1E1E] border-gray-800 text-gray-100' : 'bg-white border-gray-100 text-gray-800'}`}>
        
        {post.imageUrl && (
          <div className="w-full aspect-[21/9] sm:aspect-[21/9] overflow-hidden">
            <img src={post.imageUrl} className="w-full h-full object-cover" alt="Cover" />
          </div>
        )}

        <div className="p-5 sm:p-20 relative">
          <div className="absolute top-6 right-5 sm:top-10 sm:right-10 flex items-center gap-2 sm:gap-3">
             <button onClick={handleShare} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-500'}`} title={t.share}><Icons.Share className="w-3 h-3 sm:w-4 sm:h-4" /></button>
             <button onClick={() => onLike(post.id)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${post.hasLiked ? 'bg-red-500 border-red-400 text-white' : (isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-500')}`}><Icons.Heart filled={post.hasLiked} className="w-3 h-3 sm:w-4 sm:h-4" /></button>
             
             {isOwner && (
               <>
                 <Link to={`/journal/edit/${post.id}`} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                   <Icons.Pen className="w-3 h-3 sm:w-4 sm:h-4" />
                 </Link>
                 <button onClick={handleDelete} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 border ${isDark ? 'bg-red-900/50 border-red-800 text-red-400' : 'bg-red-50 border-red-100 text-red-500'}`}>
                   <Icons.Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                 </button>
               </>
             )}
          </div>
          
          <div className="mb-8 sm:mb-12 flex flex-col gap-2" style={{ lineHeight: '1.2' }}>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/70">#{post.id.slice(-4)}</span>
            <h1 className={`text-xl sm:text-5xl font-bold tracking-tight pr-16 sm:pr-24 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title || "Untitled Note"}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-b border-gray-100 dark:border-gray-800 pb-6 sm:pb-8">
              <div className="flex items-center gap-2">
                <img src={post.user.avatar} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-100 object-cover" />
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-500 leading-none mb-1">{post.user.name}</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{post.user.handle}</p>
                </div>
              </div>

              {!isOwner && onToggleFollowAuthor && (
                <>
                  <div className="h-4 w-[1px] bg-gray-100 dark:bg-gray-800 hidden sm:block" />
                  <button 
                    onClick={() => onToggleFollowAuthor(post.userId)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      isFollowing 
                        ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                        : (isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95')
                    }`}
                  >
                    {isFollowing ? t.followingAuthor : t.followAuthor}
                  </button>
                </>
              )}

              <div className="h-4 w-[1px] bg-gray-100 dark:bg-gray-800 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Icons.Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                {formatDate(post.createdAt)}
              </div>
              {post.views !== undefined && (
                <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Icons.Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {post.views}
                </div>
              )}
            </div>
          </div>

          <div className="relative min-h-[300px]">
            {post.audioUrl && (
              <div className="float-left mr-4 sm:mr-6 mt-1 mb-2">
                <button onClick={toggleAudio} className={`w-12 h-12 sm:w-16 sm:h-16 rounded-none flex items-center justify-center transition-all shadow-xl border-2 ${isPlaying ? 'bg-indigo-600 text-white border-indigo-500' : (isDark ? 'bg-[#262626] text-white border-gray-700' : 'bg-white text-slate-900 border-gray-200')}`}>
                  {isPlaying ? <Icons.Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icons.Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                  <audio ref={audioRef} src={post.audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                </button>
              </div>
            )}
            <div 
              className={`text-[14px] sm:text-lg leading-relaxed font-medium text-justify rich-content transition-colors ${isDark ? 'text-gray-100' : 'text-slate-700'}`}
              dangerouslySetInnerHTML={{ __html: post.content || "Tanpa catatan teks..." }}
            />
          </div>

          <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-center">
            <button 
              onClick={() => navigate(-1)} 
              className={`flex items-center gap-2 sm:gap-3 px-8 sm:px-12 py-3 sm:py-4 rounded-none text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] transition-all active:scale-95 shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-black/20' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-indigo-500/10'
              }`}
            >
              <Icons.Plus className="w-3 h-3 rotate-[135deg]" />
              {language === 'id' ? 'Kembali' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetailPage;
