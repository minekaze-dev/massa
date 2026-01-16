
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import FeedsPage from './pages/FeedsPage';
import CreatePostPage from './pages/CreatePostPage';
import CreateJournalPage from './pages/CreateJournalPage';
import ProfilePage from './pages/ProfilePage';
import BinderPage from './pages/BinderPage';
import JournalDetailPage from './pages/JournalDetailPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import ReportPage from './pages/ReportPage';
import AuthModal from './components/AuthModal';
import { Theme, User, Post, Language, PostType } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('statur-theme') as Theme) || 'light');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('statur-lang') as Language) || 'id');
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [followedAuthorIds, setFollowedAuthorIds] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUser(profile);
            fetchUserMetadata(session.user.id);
          }
        }
        await fetchPosts();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUser(profile);
          fetchUserMetadata(session.user.id);
        }
      } else {
        setUser(null);
        setSavedPostIds([]);
        setFollowedAuthorIds([]);
        setConnectedUserIds([]);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, users(*), replies(*)')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const transformed = data.map((p: any) => ({
          ...p,
          userId: p.user_id,
          user: p.users || { id: p.user_id, name: 'User', handle: '@user', avatar: 'https://picsum.photos/seed/user/100/100' },
          createdAt: new Date(p.created_at).getTime(),
          audioUrl: p.audio_url,
          imageUrl: p.image_url,
          isPublished: p.is_published,
          replies: p.replies || [],
          likes: p.likes || 0,
          hasLiked: false
        }));
        setPosts(transformed);
      }
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  };

  const fetchUserMetadata = async (userId: string) => {
    try {
      const [saved, followed, connected] = await Promise.all([
        supabase.from('saved_posts').select('post_id').eq('user_id', userId),
        supabase.from('followed_authors').select('author_id').eq('user_id', userId),
        supabase.from('connections').select('connected_user_id').eq('user_id', userId)
      ]);
      if (saved.data) setSavedPostIds(saved.data.map(i => i.post_id));
      if (followed.data) setFollowedAuthorIds(followed.data.map(i => i.author_id));
      if (connected.data) setConnectedUserIds(connected.data.map(i => i.connected_user_id));
    } catch (err) {
      console.error("Fetch metadata error:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem('statur-theme', theme);
    document.body.className = theme === 'dark' ? 'bg-[#1A1A1A] text-gray-100' : 'bg-[#FAFAF8] text-gray-900';
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleUpdateUser = async (updatedUser: User) => {
    const { error } = await supabase.from('users').upsert(updatedUser);
    if (!error) {
      setUser(updatedUser);
      fetchPosts();
    }
  };

  const handleToggleConnect = async (targetUserId: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const isConnected = connectedUserIds.includes(targetUserId);
    if (isConnected) {
      await supabase.from('connections').delete().match({ user_id: user.id, connected_user_id: targetUserId });
      setConnectedUserIds(prev => prev.filter(id => id !== targetUserId));
    } else {
      await supabase.from('connections').insert({ user_id: user.id, connected_user_id: targetUserId });
      setConnectedUserIds(prev => [...prev, targetUserId]);
    }
  };

  const handleToggleFollowAuthor = async (authorId: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const isFollowing = followedAuthorIds.includes(authorId);
    if (isFollowing) {
      await supabase.from('followed_authors').delete().match({ user_id: user.id, author_id: authorId });
      setFollowedAuthorIds(prev => prev.filter(id => id !== authorId));
    } else {
      await supabase.from('followed_authors').insert({ user_id: user.id, author_id: authorId });
      setFollowedAuthorIds(prev => [...prev, authorId]);
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const isSaved = savedPostIds.includes(postId);
    if (isSaved) {
      await supabase.from('saved_posts').delete().match({ user_id: user.id, post_id: postId });
      setSavedPostIds(prev => prev.filter(id => id !== postId));
    } else {
      await supabase.from('saved_posts').insert({ user_id: user.id, post_id: postId });
      setSavedPostIds(prev => [...prev, postId]);
    }
  };

  const handleAddPost = async (newPost: Post) => {
    if (!user) return;
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type: newPost.type,
      duration: newPost.duration,
      content: newPost.content,
      title: newPost.title,
      audio_url: newPost.audioUrl,
      image_url: newPost.imageUrl,
      is_published: newPost.isPublished ?? true
    });
    if (!error) fetchPosts();
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    await supabase.from('posts').update({
      title: updatedPost.title,
      content: updatedPost.content,
      image_url: updatedPost.imageUrl,
      is_published: updatedPost.isPublished
    }).eq('id', updatedPost.id);
    fetchPosts();
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    fetchPosts();
  };

  const handleLikePost = async (postId: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const newLikes = post.hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes, hasLiked: !p.hasLiked } : p));
  };

  const handleAddReply = async (postId: string, content: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const { error } = await supabase.from('replies').insert({
      post_id: postId,
      user_id: user.id,
      user_name: user.name,
      content
    });
    if (!error) fetchPosts();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] dark:bg-[#1A1A1A]">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <div className="text-indigo-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Memuat Semesta...</div>
    </div>
  );

  return (
    <Router>
      <div className={`min-h-screen ${theme}`}>
        <Header theme={theme} toggleTheme={toggleTheme} user={user} language={language} setLanguage={setLanguage} onLogout={() => supabase.auth.signOut()} onLoginClick={() => setIsAuthModalOpen(true)} />
        <main className="max-w-[1000px] mx-auto pt-20 px-4 pb-28 sm:pb-24">
          <Routes>
            <Route path="/" element={<FeedsPage posts={posts} onLike={handleLikePost} onReply={handleAddReply} onSave={handleToggleSave} savedPostIds={savedPostIds} theme={theme} language={language} user={user} onLoginClick={() => setIsAuthModalOpen(true)} />} />
            <Route path="/binder" element={<BinderPage posts={posts} followedAuthorIds={followedAuthorIds} theme={theme} language={language} user={user} onLoginClick={() => setIsAuthModalOpen(true)} />} />
            <Route path="/journal/:id/:slug" element={<JournalDetailPage posts={posts} theme={theme} language={language} onLike={handleLikePost} onDelete={handleDeletePost} currentUser={user} onToggleFollowAuthor={handleToggleFollowAuthor} followedAuthorIds={followedAuthorIds} />} />
            <Route path="/journal/create" element={user ? <CreateJournalPage onSave={handleAddPost} onUpdate={handleUpdatePost} user={user} theme={theme} language={language} /> : <Navigate to="/" replace />} />
            <Route path="/journal/edit/:id" element={user ? <CreateJournalPage onSave={handleAddPost} onUpdate={handleUpdatePost} user={user} theme={theme} language={language} allPosts={posts} /> : <Navigate to="/" replace />} />
            <Route path="/post" element={user ? <CreatePostPage onPost={handleAddPost} user={user} theme={theme} language={language} /> : <Navigate to="/" replace />} />
            <Route path="/u/:handle" element={<ProfilePage currentUser={user} allPosts={posts} onLike={handleLikePost} onReply={handleAddReply} onPost={handleAddPost} onUpdatePost={handleUpdatePost} onDeletePost={handleDeletePost} onUpdateUser={handleUpdateUser} onSave={handleToggleSave} onToggleConnect={handleToggleConnect} connectedUserIds={connectedUserIds} savedPostIds={savedPostIds} theme={theme} language={language} onLoginClick={() => setIsAuthModalOpen(true)} />} />
            <Route path="/terms" element={<TermsPage theme={theme} language={language} />} />
            <Route path="/privacy" element={<PrivacyPage theme={theme} language={language} />} />
            <Route path="/cookies" element={<CookiesPage theme={theme} language={language} />} />
            <Route path="/report" element={<ReportPage theme={theme} language={language} user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer theme={theme} language={language} />
        </main>
        <BottomNav theme={theme} language={language} user={user} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(u) => { setUser(u); setIsAuthModalOpen(false); }} theme={theme} language={language} />
      </div>
    </Router>
  );
};

export default App;
