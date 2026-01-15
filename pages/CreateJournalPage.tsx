
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Post, Theme, Language, User, PostType, PostDuration } from '../types';
import { translations } from '../translations';
import * as Icons from '../components/Icons';

interface CreateJournalPageProps {
  onSave: (post: Post) => void;
  onUpdate: (post: Post) => void;
  user: User;
  theme: Theme;
  language: Language;
  allPosts?: Post[];
}

const CreateJournalPage: React.FC<CreateJournalPageProps> = ({ 
  onSave, onUpdate, user, theme, language, allPosts 
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const t = translations[language];
  const isDark = theme === 'dark';

  const editingPost = id && allPosts ? allPosts.find(p => p.id === id) : null;

  const [title, setTitle] = useState(editingPost?.title || '');
  const [coverImage, setCoverImage] = useState<string | null>(editingPost?.imageUrl || null);
  const [wordCount, setWordCount] = useState(0);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const MAX_VOICE_SECONDS = 30;
  
  const editorRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const calculateWords = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      if (editingPost?.content) {
        editorRef.current.innerHTML = editingPost.content;
      }
      calculateWords();
      isInitializedRef.current = true;
    }
  }, [editingPost]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInlineImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editorRef.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgHtml = `<img src="${reader.result}" class="max-w-full rounded-none my-6 block mx-auto shadow-lg border-2 border-white dark:border-gray-700" alt="Inline Image" />`;
        document.execCommand('insertHTML', false, imgHtml + '<p><br></p>');
        calculateWords();
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        insertAudioPlayer(url);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_VOICE_SECONDS - 1) {
            stopVoiceRecording();
            return MAX_VOICE_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const insertAudioPlayer = (url: string) => {
    const audioHtml = `
      <div class="my-6 p-4 rounded-none bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-4 contenteditable-false" contenteditable="false">
        <audio src="${url}" controls class="w-full h-8 brightness-90 contrast-125"></audio>
        <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest shrink-0">Voice Note</span>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, audioHtml);
    editorRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contentHtml = editorRef.current?.innerHTML || '';
    if (!user || (!contentHtml.trim() && !title.trim())) return;

    const postData: Post = {
      id: editingPost?.id || Math.random().toString(36).substr(2, 9),
      userId: user.id,
      user: user,
      type: PostType.JOURNAL,
      duration: PostDuration.PERM,
      createdAt: editingPost?.createdAt || Date.now(),
      title: title.trim(),
      content: contentHtml,
      imageUrl: coverImage || undefined,
      likes: editingPost?.likes || 0,
      hasLiked: editingPost?.hasLiked || false,
      replies: editingPost?.replies || [],
      isPublished: true
    };

    if (editingPost) onUpdate(postData); else onSave(postData);
    navigate(`/u/${user.handle.replace(/^@/, '')}`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-2 sm:px-4 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      
      <aside className="lg:sticky lg:top-24 w-full lg:w-16 flex lg:flex-col items-center gap-1.5 p-2 rounded-none border order-2 lg:order-1 transition-all shadow-xl bg-white dark:bg-[#262626] border-gray-100 dark:border-gray-800">
        <button onClick={() => execCommand('justifyLeft')} className="p-3 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" title="Align Left"><Icons.AlignLeft className="w-5 h-5" /></button>
        <button onClick={() => execCommand('justifyCenter')} className="p-3 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" title="Align Center"><Icons.AlignCenter className="w-5 h-5" /></button>
        <button onClick={() => execCommand('justifyRight')} className="p-3 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" title="Align Right"><Icons.AlignRight className="w-5 h-5" /></button>
        <button onClick={() => execCommand('justifyFull')} className="p-3 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" title="Justify"><Icons.AlignJustify className="w-5 h-5" /></button>
        
        <div className="lg:h-[1px] lg:w-8 w-[1px] h-8 bg-gray-100 dark:bg-gray-800 mx-auto my-1" />
        
        <button onClick={() => inlineInputRef.current?.click()} className="p-3 rounded-none hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600" title="Add Image"><Icons.ImageIcon className="w-5 h-5" /></button>
        
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording} 
            className={`p-3 rounded-none transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500'}`} 
            title="Add Voice (30s)"
          >
            {isRecording ? <Icons.Square className="w-5 h-5" /> : <Icons.Mic className="w-5 h-5" />}
          </button>
          
          {isRecording && (
            <div className="text-[10px] font-black text-red-500 animate-pulse tabular-nums">
              {recordingTime}s
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 w-full order-1 lg:order-2">
        <div className="flex items-center justify-between mb-8 px-2">
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
          >
            <Icons.Plus className="w-3 h-3 rotate-[135deg]" />
            {t.cancel}
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleFormSubmit}
              disabled={wordCount > 1000 || isRecording}
              className={`px-10 py-3 rounded-none font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
                wordCount > 1000 || isRecording
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700'
              }`}
            >
              {t.saveJournal}
            </button>
          </div>
        </div>

        <div className={`relative w-full rounded-none border shadow-2xl overflow-hidden transition-all ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-gray-100'}`}>
          <div 
            onClick={() => coverInputRef.current?.click()}
            className={`w-full aspect-[21/9] flex flex-col items-center justify-center cursor-pointer relative group transition-colors overflow-hidden ${!coverImage ? (isDark ? 'bg-gray-800/30' : 'bg-gray-50/50 hover:bg-gray-100/50') : ''}`}
          >
            <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverChange} />
            {coverImage ? (
              <>
                <img src={coverImage} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-6 py-2 rounded-full">{t.changePhoto}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setCoverImage(null); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors"><Icons.Plus className="w-5 h-5 rotate-45" /></button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}><Icons.ImageIcon className="w-6 h-6 text-gray-400 opacity-40" /></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">TAMBAH SAMPUL</span>
              </div>
            )}
          </div>

          <div className="mx-1 sm:mx-6 my-4 sm:my-8 relative">
            <div className="p-4 sm:p-12 relative min-h-[700px]">
              <input 
                type="text" 
                placeholder={t.journalTitle} 
                className={`w-full bg-transparent text-3xl sm:text-5xl font-bold tracking-tight outline-none transition-colors mb-8 sm:mb-12 ${isDark ? 'text-white placeholder-gray-600' : 'text-slate-900 placeholder-gray-200'}`} 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
              
              <style>{`
                .editor-content:empty:before {
                  content: attr(data-placeholder);
                  color: ${isDark ? '#4b5563' : '#e5e7eb'};
                  font-weight: 500;
                  pointer-events: none;
                  display: block;
                }
                .editor-content p { margin-bottom: 1.25rem; }
                .editor-content img { transition: transform 0.3s ease; }
                .editor-content img:hover { transform: scale(1.01); }
                .contenteditable-false { user-select: none; }
                /* Force text color in editor */
                .editor-content { color: ${isDark ? 'white' : '#334155'} !important; }
                .editor-content * { color: inherit !important; }
              `}</style>
              <div 
                ref={editorRef}
                contentEditable
                onInput={calculateWords}
                suppressContentEditableWarning={true}
                data-placeholder="Tulis cerita atau pemikiranmu di sini..."
                className={`editor-content w-full bg-transparent border-none outline-none min-h-[600px] text-[16px] sm:text-[18px] leading-relaxed font-medium text-justify transition-colors ${isDark ? 'text-white' : 'text-slate-700'}`}
              />
              <input type="file" ref={inlineInputRef} accept="image/*" className="hidden" onChange={handleInlineImage} />
            </div>
          </div>

          <div className={`px-6 sm:px-12 py-6 sm:py-8 flex items-center justify-between border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex flex-col gap-1">
               <span className={`text-[10px] font-black tracking-[0.2em] ${wordCount > 1000 ? 'text-red-500' : (isDark ? 'text-gray-500' : 'text-slate-400')}`}>
                 {wordCount} / 1000 KATA
               </span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-indigo-500/40">
              LITERACY CANVAS v2.2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJournalPage;
