
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Post, PostType, PostDuration, Theme, Language, User } from '../types';
import { translations } from '../translations';
import * as Icons from './Icons';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onReply: (id: string, content: string) => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
  theme: Theme;
  language: Language;
  user: User | null;
  onLoginClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, onLike, onReply, onSave, isSaved, theme, language, user, onLoginClick
}) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = translations[language];

  const bars = useMemo(() => Array.from({ length: 45 }).map(() => 15 + Math.random() * 85), []);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t.justNow;
    if (hours < 24) return `${hours} ${t.hoursAgo}`;
    return `${Math.floor(hours / 24)} ${t.daysAgo}`;
  };

  const formatSeconds = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const userHandlePath = `/u/${post.user.handle.replace(/^@/, '')}`;

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      onLoginClick();
    }
  };

  const handleReadJournal = () => {
    if (!user) {
      onLoginClick();
      return;
    }
    const slug = getSlug(post.title || post.content || "catatan");
    navigate(`/journal/${post.id}/${slug}`);
  };

  const toggleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.duration === Infinity) {
        audio.currentTime = 1e101;
        audio.currentTime = 0;
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (isFinite(audio.duration)) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoaded = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); });
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
    };
  }, []);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(post.id, replyText);
    setReplyText('');
    setShowReply(false);
  };

  const isDark = theme === 'dark';

  const renderAudioPlayer = () => (
    <div className={`p-4 sm:p-6 rounded-[3rem] border shadow-sm flex flex-col gap-2 ${isDark ? 'bg-gray-800/40 border-gray-700/50' : 'bg-[#fcfcfc] border-gray-100'}`}>
      <div className="flex items-center gap-4">
        <button onClick={toggleAudio} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
          {isPlaying ? <Icons.Pause className="w-6 h-6" /> : <Icons.Play className="w-6 h-6" />}
        </button>
        <div className="flex-1 flex items-center h-14 gap-[4px] px-2 relative cursor-pointer overflow-hidden" onClick={handleSeek}>
          {/* Background bars represent the full duration */}
          <div className="absolute inset-0 flex items-center gap-[4px] px-2 opacity-10 pointer-events-none">
            {bars.map((height, i) => (
              <div key={`bg-${i}`} className={`flex-1 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`} style={{ height: `${height}%`, minHeight: '4px' }} />
            ))}
          </div>
          {/* Progress bars */}
          {bars.map((height, i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-300 relative z-10 ${((i / bars.length) * 100) <= progress ? (isDark ? 'bg-indigo-400' : 'bg-[#1e293b]') : 'bg-transparent'}`} style={{ height: `${height}%`, minHeight: '4px' }} />
          ))}
        </div>
        <button onClick={toggleMute} className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
          {isMuted ? <Icons.Mute className="w-5 h-5" /> : <Icons.Volume className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-gray-400">
          <span className={isDark ? 'text-indigo-400' : 'text-black'}>{formatSeconds(currentTime)}</span>
          <span className="opacity-30">/</span>
          <span>{formatSeconds(duration)}</span>
        </div>
        <span className="text-[9px] font-black text-indigo-500/40 tracking-[0.4em] uppercase">STATUR WAVE</span>
      </div>
      <audio ref={audioRef} src={post.audioUrl} className="hidden" muted={isMuted} preload="auto" />
    </div>
  );

  if (post.type === PostType.JOURNAL) {
    const cleanContent = post.content?.replace(/<[^>]*>/g, '').trim();
    return (
      <div className={`p-6 rounded-[2.5rem] border mb-4 transition-all relative ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center gap-4 mb-4">
          <Link to={userHandlePath} onClick={handleProfileClick}>
            <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full border border-gray-100 object-cover" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
              <Link to={userHandlePath} onClick={handleProfileClick} className={`text-sm font-bold hover:text-indigo-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.user.name}</Link>
              <span className="text-xs text-gray-400">{t.newJournalAnnounce}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border mb-5 flex gap-4 items-start ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50/50 border-indigo-100'}`}>
          {post.imageUrl && (
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-white/20 shadow-md shrink-0">
              <img src={post.imageUrl} className="w-full h-full object-cover" alt="Cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h5 className={`text-base font-bold mb-1 truncate ${isDark ? 'text-white' : 'text-indigo-900'}`}>{post.title || "Untitled Journal"}</h5>
            <p className={`text-xs line-clamp-2 opacity-70 mb-3 text-justify leading-relaxed ${isDark ? 'text-gray-300' : 'text-indigo-700/60'}`}>{cleanContent}</p>
            <button onClick={handleReadJournal} className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95'}`}>
              {t.readJournal}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 pt-2">
          <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 text-xs ${post.hasLiked ? 'text-red-500' : 'text-gray-400'}`}>
            <Icons.Heart filled={post.hasLiked} className="w-4 h-4" /> <span className="font-bold">{post.likes}</span>
          </button>
          <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1.5 text-xs text-gray-400">
            <Icons.Message className="w-4 h-4" /> <span className="font-bold">{post.replies.length}</span>
          </button>
        </div>
        {showReply && (
          <form onSubmit={handleReplySubmit} className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            <input type="text" placeholder={t.placeholderReply} value={replyText} onChange={(e) => setReplyText(e.target.value)} className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
          </form>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`p-6 rounded-[2.5rem] shadow-sm transition-all duration-300 mb-6 border relative group ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="absolute top-6 right-6 flex items-center gap-1.5 z-10">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${post.duration === PostDuration.PERM ? (isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-white') : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
            {post.duration === PostDuration.PERM ? <Icons.CheckCircle className="w-3 h-3" /> : <Icons.Clock className="w-3 h-3" />}
            {post.duration === PostDuration.PERM ? t.permanent : t.temp}
          </div>
        </div>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={userHandlePath} onClick={handleProfileClick}><img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full border border-gray-100 object-cover" /></Link>
            <div>
              <Link to={userHandlePath} onClick={handleProfileClick} className={`text-sm font-bold hover:text-indigo-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.user.name}</Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{post.user.handle}</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-400">{formatTime(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          {post.content && <p className={`text-[15px] leading-relaxed px-1 font-medium ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>{post.content}</p>}
          {post.imageUrl && (
            <div className={`relative rounded-[2rem] overflow-hidden border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-50'}`}>
              <img src={post.imageUrl} alt="Status" onClick={() => setIsDetailOpen(true)} className="max-h-[500px] w-full object-contain cursor-pointer" />
            </div>
          )}
          {post.audioUrl && renderAudioPlayer()}
        </div>
        <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
          <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 text-xs transition-colors ${post.hasLiked ? 'text-red-500' : 'text-gray-400'}`}>
            <Icons.Heart filled={post.hasLiked} className="w-5 h-5" />
            <span className="font-bold">{post.likes}</span>
          </button>
          <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1.5 text-xs text-gray-400">
            <Icons.Message className="w-5 h-5" />
            <span className="font-bold">{post.replies.length}</span>
          </button>
          <button onClick={() => onSave?.(post.id)} className={`flex items-center gap-1.5 text-xs transition-colors ml-auto ${isSaved ? 'text-indigo-500' : 'text-gray-400'}`}>
            <Icons.Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
        {showReply && (
          <form onSubmit={handleReplySubmit} className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
            <input type="text" placeholder={t.placeholderReply} value={replyText} onChange={(e) => setReplyText(e.target.value)} className={`w-full px-5 py-3 rounded-2xl text-sm outline-none border transition-all ${isDark ? 'bg-[#1A1A1A] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'}`} />
          </form>
        )}
      </div>
      {isDetailOpen && post.imageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setIsDetailOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl animate-in zoom-in duration-300 ${isDark ? 'bg-[#1A1A1A] border-gray-800' : 'bg-white border-gray-100'}`} onClick={e => e.stopPropagation()}>
            <div className="flex flex-col md:flex-row h-full">
              <div className="flex-1 bg-black flex items-center justify-center p-4"><img src={post.imageUrl} alt="Full" className="max-w-full h-auto max-h-[80vh] object-contain" /></div>
              <div className={`w-full md:w-80 p-6 flex flex-col ${isDark ? 'text-white' : 'text-black'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <Link to={userHandlePath}><img src={post.user.avatar} className="w-10 h-10 rounded-full object-cover" /></Link>
                  <div><Link to={userHandlePath} className="text-sm font-bold">{post.user.name}</Link><p className="text-xs text-gray-500">{post.user.handle}</p></div>
                </div>
                <div className="flex-1">{post.content && <p className="text-sm italic text-gray-600 dark:text-gray-300">"{post.content}"</p>}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
