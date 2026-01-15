
import React, { useState } from 'react';
import PostCard from '../components/PostCard';
import { Post, Theme, Language, User, PostType } from '../types';
import { translations } from '../translations';
import * as Icons from '../components/Icons';

interface FeedsPageProps {
  posts: Post[];
  onLike: (id: string) => void;
  onReply: (id: string, content: string) => void;
  onSave: (id: string) => void;
  savedPostIds: string[];
  theme: Theme;
  language: Language;
  user: User | null;
  onLoginClick: () => void;
}

const FeedsPage: React.FC<FeedsPageProps> = ({ 
  posts, onLike, onReply, onSave, savedPostIds, theme, language, user, onLoginClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];
  const isDark = theme === 'dark';

  // Only show posts that are either not journals or journals that are published
  const visiblePosts = posts.filter(p => p.isPublished !== false);

  const filteredPosts = visiblePosts.filter(p => {
    const matchesSearch = 
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
            {t.greeting}
          </h1>
          <p className="text-gray-500 text-sm">{t.subGreeting}</p>
        </div>

        <div className={`relative flex-1 max-w-sm w-full group`}>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-600'}`}>
            <Icons.Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder={t.searchStatus}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-5 py-3.5 rounded-2xl outline-none border transition-all text-sm ${
              isDark 
                ? 'bg-[#262626] border-gray-800 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10' 
                : 'bg-white border-gray-100 text-slate-900 shadow-sm focus:border-indigo-600/30 focus:ring-4 focus:ring-indigo-600/5'
            }`}
          />
          {searchQuery && (
             <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
             >
               <Icons.Plus className="w-4 h-4 rotate-45" />
             </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {filteredPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={onLike} 
            onReply={onReply} 
            onSave={onSave}
            isSaved={savedPostIds.includes(post.id)}
            theme={theme} 
            language={language}
            user={user}
            onLoginClick={onLoginClick}
          />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
          <div className="text-4xl mb-4 grayscale opacity-40">🍃</div>
          <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
            {searchQuery 
              ? (language === 'id' ? `Tidak ada hasil untuk "${searchQuery}"` : `No results for "${searchQuery}"`) 
              : t.noPosts
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedsPage;
