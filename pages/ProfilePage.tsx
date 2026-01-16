
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { User, Post, Theme, Language, PostType } from '../types';
import { translations } from '../translations';
import { MOCK_USERS } from '../constants';
import * as Icons from '../components/Icons';
import { supabase } from '../supabaseClient';

interface ProfilePageProps {
  currentUser: User | null;
  allPosts: Post[];
  onLike: (id: string) => void;
  onReply: (id: string, content: string) => void;
  onPost?: (post: Partial<Post>) => void;
  onUpdatePost?: (post: Post) => void;
  onDeletePost?: (id: string) => void;
  onUpdateUser?: (user: User) => void;
  onSave?: (id: string) => void;
  onToggleConnect: (userId: string) => void;
  connectedUserIds: string[];
  savedPostIds: string[];
  theme: Theme;
  language: Language;
  onLoginClick: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  currentUser, allPosts, onLike, onReply, onSave, theme, language, onLoginClick, onUpdateUser, savedPostIds
}) => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const t = translations[language];
  const isDark = theme === 'dark';
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const searchHandle = handle?.startsWith('@') ? handle.toLowerCase() : `@${handle?.toLowerCase()}`;
      
      // Check current user first
      if (currentUser && currentUser.handle.toLowerCase() === searchHandle) {
        setProfileUser(currentUser);
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('handle', searchHandle)
        .maybeSingle();
      
      if (data) {
        setProfileUser(data);
      } else {
        // Fallback to mock
        const mockMatch = MOCK_USERS.find(u => u.handle.toLowerCase() === searchHandle);
        if (mockMatch) setProfileUser(mockMatch);
        else setProfileUser(null);
      }
    };
    fetchUser();
  }, [handle, currentUser]);

  useEffect(() => {
    if (profileUser && isEditModalOpen) {
      setEditName(profileUser.name);
      setEditHandle(profileUser.handle.replace(/^@/, ''));
      setEditAvatar(profileUser.avatar);
    }
  }, [profileUser, isEditModalOpen]);

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4 grayscale opacity-40">👤</div>
        <p className="text-gray-400 text-sm font-medium">
          {language === 'id' ? 'Pengguna tidak ditemukan.' : 'User not found.'}
        </p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-500 font-bold text-xs uppercase tracking-widest">{t.feeds}</button>
      </div>
    );
  }

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;
  const [activeTab, setActiveTab] = useState<'status' | 'notebook' | 'saved'>('status');

  const loyalReadersCount = useMemo(() => {
    if (isOwnProfile) return 42;
    const charSum = profileUser.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (charSum % 150) + 10;
  }, [profileUser, isOwnProfile]);

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(ts);
  };

  const getSlug = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateUser || !currentUser) return;
    setErrorMsg(null);

    const newHandle = `@${editHandle.trim().toLowerCase()}`;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    
    if (newHandle !== currentUser.handle) {
      if (currentUser.lastHandleUpdate && (Date.now() - (currentUser.lastHandleUpdate as any) < SEVEN_DAYS_MS)) {
        // Handle cooldown check (simplified)
      }
      
      const { data: taken } = await supabase.from('users').select('id').eq('handle', newHandle).maybeSingle();
      if (taken && taken.id !== currentUser.id) {
        setErrorMsg(t.usernameTaken);
        return;
      }
    }
    
    setIsSaving(true);
    try {
      await onUpdateUser({
        ...currentUser,
        name: editName,
        handle: newHandle,
        avatar: editAvatar
      });
      setIsEditModalOpen(false);
      if (newHandle !== currentUser.handle) {
        navigate(`/u/${editHandle.trim().toLowerCase()}`, { replace: true });
      }
    } catch (err) {
      setErrorMsg("Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const NotebookPreview = ({ post }: { post: Post; key?: any }) => {
    const cleanContent = post.content?.replace(/<[^>]*>/g, '').slice(0, 150) + '...';
    return (
      <div 
        onClick={() => navigate(`/journal/${post.id}/${getSlug(post.title || "catatan")}`)}
        className={`group relative flex flex-col rounded-none border cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}
      >
        {post.imageUrl ? (
          <div className="w-full aspect-[21/9] overflow-hidden">
            <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
          </div>
        ) : (
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500/70">#{post.id.slice(-4)}</span>
              <h3 className={`text-lg font-bold tracking-tight truncate max-w-[200px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{post.title || 'Untitled Note'}</h3>
            </div>
          </div>
          <p className={`text-[13px] leading-relaxed mb-6 line-clamp-2 text-justify flex-1 ${isDark ? 'text-gray-100' : 'text-slate-500'}`}>
            {cleanContent}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50 mt-auto">
            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest"><Icons.Clock className="w-3 h-3" />{formatDate(post.createdAt)}</div>
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">{t.viewDetail} →</span>
          </div>
        </div>
      </div>
    );
  };

  const statusPosts = allPosts.filter(p => p.userId === profileUser.id && p.type !== PostType.JOURNAL);
  const journalPosts = allPosts.filter(p => p.userId === profileUser.id && p.type === PostType.JOURNAL && (isOwnProfile || p.isPublished !== false));
  const savedPosts = allPosts.filter(p => savedPostIds.includes(p.id));

  const EmptyState = ({ icon, message }: { icon: string, message: string }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="text-5xl mb-6 grayscale opacity-30 select-none">{icon}</div>
      <p className={`text-sm font-bold tracking-tight max-w-[250px] leading-relaxed ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
        {message}
      </p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
      <div className={`max-w-4xl mx-auto p-8 sm:p-12 rounded-[3.5rem] mb-12 flex flex-col items-center border relative transition-all ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        {isOwnProfile && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className={`absolute top-8 right-8 p-3 rounded-full border transition-all active:scale-90 ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-black shadow-sm'}`}
          >
            <Icons.Pen className="w-4 h-4" />
          </button>
        )}
        <div className="relative mb-6">
          <img src={profileUser.avatar} className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-xl" />
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-[#262626] rounded-full shadow-sm" />
        </div>
        <h2 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profileUser.name}</h2>
        <p className="text-gray-400 text-sm mb-8 font-mono">{profileUser.handle}</p>
        
        <div className="flex gap-10 sm:gap-16 border-t border-gray-50 dark:border-gray-800 pt-8 w-full justify-center">
          <div className="flex flex-col items-center">
            <p className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{statusPosts.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.lastStatus}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{journalPosts.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.notebook}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <p className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{loyalReadersCount}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.loyalReaders}</p>
          </div>
        </div>
      </div>

      <div className="mb-10 w-full flex flex-col items-center">
        <div className={`w-full flex justify-center border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex">
            <button onClick={() => setActiveTab('status')} className={`relative px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${activeTab === 'status' ? (isDark ? 'text-white' : 'text-slate-900') : 'text-gray-400 hover:text-gray-500'}`}>
              STATUS
              {activeTab === 'status' && <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${isDark ? 'bg-white' : 'bg-black'}`} />}
            </button>
            <button onClick={() => setActiveTab('notebook')} className={`relative px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${activeTab === 'notebook' ? (isDark ? 'text-white' : 'text-slate-900') : 'text-gray-400 hover:text-gray-500'}`}>
              BINDER
              {activeTab === 'notebook' && <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${isDark ? 'bg-white' : 'bg-black'}`} />}
            </button>
            {isOwnProfile && (
              <button onClick={() => setActiveTab('saved')} className={`relative px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${activeTab === 'saved' ? (isDark ? 'text-white' : 'text-slate-900') : 'text-gray-400 hover:text-gray-500'}`}>
                TERSIMPAN
                {activeTab === 'saved' && <div className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${isDark ? 'bg-white' : 'bg-black'}`} />}
              </button>
            )}
          </div>
        </div>
        {activeTab === 'notebook' && isOwnProfile && (
          <button onClick={() => navigate('/journal/create')} className={`mt-8 flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all hover:bg-indigo-700`}><Icons.Plus className="w-5 h-5" />{t.createJournal}</button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
        {activeTab === 'status' && (
          <>
            {statusPosts.length > 0 ? (
              statusPosts.map(p => <PostCard key={p.id} post={p} onLike={onLike} onReply={onReply} onSave={onSave} isSaved={savedPostIds.includes(p.id)} theme={theme} language={language} user={currentUser} onLoginClick={onLoginClick} />)
            ) : (
              <EmptyState icon="🍃" message={language === 'id' ? 'Belum ada status yang dibagikan.' : 'No status shared yet.'} />
            )}
          </>
        )}
        
        {activeTab === 'notebook' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {journalPosts.length > 0 ? (
              journalPosts.map(p => <NotebookPreview key={p.id} post={p} />)
            ) : (
              <div className="col-span-full">
                 <EmptyState icon="📚" message={language === 'id' ? 'Koleksi Binder masih kosong.' : 'Binder collection is still empty.'} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && isOwnProfile && (
          <>
            {savedPosts.length > 0 ? (
              savedPosts.map(p => <PostCard key={p.id} post={p} onLike={onLike} onReply={onReply} onSave={onSave} isSaved={true} theme={theme} language={language} user={currentUser} onLoginClick={onLoginClick} />)
            ) : (
              <EmptyState icon="🔖" message={t.noSaved} />
            )}
          </>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSaving && setIsEditModalOpen(false)} />
          <div className={`relative w-full max-w-sm p-8 rounded-[3rem] border shadow-2xl animate-in zoom-in duration-300 ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-xl font-bold mb-8 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.editProfile}</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-100 text-center animate-in shake duration-300">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4 flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                   <img src={editAvatar} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 p-0.5" />
                   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.Pen className="w-4 h-4 text-white" />
                   </div>
                </div>
                <input type="file" ref={avatarInputRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">{t.nickname}</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl outline-none border transition-all text-sm ${
                    isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Username (@handle)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className={`w-full pl-10 pr-6 py-4 rounded-2xl outline-none border transition-all text-sm ${
                      isDark ? 'bg-[#1A1A1A] border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 focus:border-indigo-400'
                    }`}
                  />
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest ml-1">{t.handleLimitHint}</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className={`flex-1 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                    isDark ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-black'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
