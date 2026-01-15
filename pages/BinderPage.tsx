
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Post, Theme, Language, PostType, User } from '../types';
import { translations } from '../translations';
import * as Icons from '../components/Icons';

interface BinderPageProps {
  posts: Post[];
  followedAuthorIds: string[];
  theme: Theme;
  language: Language;
  user: User | null;
  onLoginClick: () => void;
}

const BinderPage: React.FC<BinderPageProps> = ({ posts, followedAuthorIds, theme, language, user, onLoginClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'following'>('all');
  const navigate = useNavigate();
  const t = translations[language];
  const isDark = theme === 'dark';

  const journalPosts = posts.filter(p => 
    p.type === PostType.JOURNAL && 
    p.isPublished !== false &&
    (
      (p.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.content?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const displayPosts = React.useMemo(() => {
    let list = [...journalPosts];
    if (activeTab === 'all') {
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (activeTab === 'trending') {
      return list
        .filter(p => (p.views || 0) > 1000) // Threshold set to 1000 as requested
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 15);
    } else if (activeTab === 'following') {
      return list.filter(p => followedAuthorIds.includes(p.userId)).sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [journalPosts, activeTab, followedAuthorIds]);

  const getSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short'
    }).format(ts);
  };

  const handleCardClick = (post: Post) => {
    if (!user) {
      onLoginClick();
    } else {
      navigate(`/journal/${post.id}/${getSlug(post.title || "note")}`);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      onLoginClick();
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Icons.Binder className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
              {t.binder}
            </h1>
          </div>
          <p className="text-gray-500 text-sm">{t.binderSubtitle}</p>
        </div>

        <div className={`relative flex-1 max-w-sm w-full group`}>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`}>
            <Icons.Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder={t.searchBinder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-5 py-3.5 rounded-2xl outline-none border transition-all text-sm ${
              isDark 
                ? 'bg-[#262626] border-gray-800 text-white focus:border-indigo-500/50' 
                : 'bg-white border-gray-100 text-slate-900 shadow-sm focus:border-indigo-600/30'
            }`}
          />
        </div>
      </div>

      <div className={`w-full flex justify-start border-b mb-10 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex">
          <button onClick={() => setActiveTab('all')} className={`relative px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] ${activeTab === 'all' ? (isDark ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>
            {t.allNotebooks}
            {activeTab === 'all' && <div className={`absolute bottom-0 left-0 right-0 h-[2.5px] ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />}
          </button>
          <button onClick={() => setActiveTab('trending')} className={`relative px-6 py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${activeTab === 'trending' ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : 'text-gray-400'}`}>
            <Icons.Star filled={activeTab === 'trending'} className="w-3 h-3" />
            {t.trendingNotebooks}
            {activeTab === 'trending' && <div className={`absolute bottom-0 left-0 right-0 h-[2.5px] ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />}
          </button>
          <button 
            onClick={() => {
              if (!user) onLoginClick();
              else setActiveTab('following');
            }} 
            className={`relative px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] ${activeTab === 'following' ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : 'text-gray-400'}`}
          >
            {t.followingNotebooks}
            {activeTab === 'following' && <div className={`absolute bottom-0 left-0 right-0 h-[2.5px] ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayPosts.map(post => (
          <div key={post.id} className={`group relative flex flex-col min-h-[400px] rounded-[2.5rem] border overflow-hidden transition-all duration-500 hover:scale-[1.02] ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex flex-col h-full cursor-pointer" onClick={() => handleCardClick(post)}>
              {/* Cover Image Header */}
              {post.imageUrl && (
                <div className="w-full aspect-video overflow-hidden">
                  <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cover" />
                </div>
              )}
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/70">#{post.id.slice(-4)}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(post.createdAt)}</span>
                </div>
                <h3 className={`text-xl font-bold tracking-tight line-clamp-2 leading-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {post.title || 'Untitled Note'}
                </h3>
                <p className={`text-sm leading-relaxed text-justify line-clamp-[4] opacity-70 mb-6 ${isDark ? 'text-gray-200' : 'text-slate-600'}`}>
                  {post.content?.replace(/<[^>]*>/g, '')}
                </p>
                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                  <Link to={`/u/${post.user.handle.replace(/^@/, '')}`} onClick={handleProfileClick} className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
                    <img src={post.user.avatar} className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[100px] leading-tight">{post.user.name}</span>
                      <span className="text-[8px] font-medium text-gray-400 truncate max-w-[100px]">{post.user.handle}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Icons.Eye className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black">{post.views || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm font-medium">
            {activeTab === 'following' ? t.noFollowingPosts : (language === 'id' ? 'Tidak ada binder ditemukan.' : 'No binders found.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default BinderPage;
