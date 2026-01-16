
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, PostType, PostDuration, User, Theme, Language } from '../types';
import { translations } from '../translations';
import * as Icons from '../components/Icons';

interface CreatePostPageProps {
  onPost: (post: Partial<Post>) => void;
  user: User;
  theme: Theme;
  language: Language;
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({ onPost, user, theme, language }) => {
  const navigate = useNavigate();
  const t = translations[language];
  const [duration, setDuration] = useState<PostDuration>(PostDuration.PERM);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_RECORDING_SECONDS = 60;

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if ('vibrate' in navigator) navigator.vibrate([50, 50]);
    }
  }, []);

  const handleStartRecording = async () => {
    if (audioUrl || isRecording) return;
    setMicError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
      const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          const reader = new FileReader();
          reader.onloadend = () => {
             setAudioUrl(reader.result as string);
          };
          reader.readAsDataURL(audioBlob);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      setRecordingTime(0);
      mediaRecorder.start(200);
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            handleStopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);

      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (err: any) {
      setMicError(language === 'id' ? 'Gagal akses mikrofon.' : 'Mic access failed.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) return;

    let derivedType = PostType.TEXT;
    if (image && audioUrl) derivedType = PostType.PHOTO_VOICE;
    else if (image) derivedType = PostType.PHOTO_VOICE;
    else if (audioUrl && content.trim()) derivedType = PostType.TEXT_VOICE;
    else if (audioUrl) derivedType = PostType.VOICE;

    const newPost: Partial<Post> = {
      userId: user.id,
      type: derivedType,
      duration,
      content: content.trim() || undefined,
      imageUrl: image || undefined,
      audioUrl: audioUrl || undefined,
      isPublished: true
    };

    onPost(newPost);
    navigate('/');
  };

  const isDark = theme === 'dark';
  const hasContent = content.trim() || image || audioUrl;

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{t.createPost}</h1>
        <p className="text-gray-500 text-sm">{t.subCreate}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`p-6 sm:p-8 rounded-[3rem] border shadow-sm transition-all ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-white border-gray-100'}`}>
          <textarea
            placeholder={language === 'id' ? "Apa yang kamu pikirkan?" : "What's on your mind?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full text-lg bg-transparent border-none outline-none resize-none min-h-[120px] mb-4 ${isDark ? 'text-white' : 'text-slate-900'} placeholder-gray-300 font-medium`}
          />

          <div className="space-y-4 mb-4">
            {image && (
              <div className="relative w-fit group">
                <img src={image} alt="Preview" className="max-h-64 rounded-2xl object-cover border border-gray-100 dark:border-gray-800" />
                <button 
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center shadow-lg hover:bg-black transition-all"
                >
                  <Icons.Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            )}

            {(isRecording || audioUrl) && (
              <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all animate-in slide-in-from-left-4 duration-300 ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50 border-indigo-100'
              }`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white">
                  {isRecording ? <div className="w-3 h-3 bg-white rounded-sm animate-pulse" /> : <Icons.Mic className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                      {recordingTime < 10 ? `00:0${recordingTime}` : `00:${recordingTime}`} / 01:00
                    </span>
                    {isRecording && <span className="text-[9px] font-black uppercase tracking-widest text-red-500 animate-pulse">Recording</span>}
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300" 
                      style={{ width: `${(recordingTime / MAX_RECORDING_SECONDS) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <button 
                      type="button"
                      onClick={handleStopRecording}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <Icons.Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => { setAudioUrl(null); setRecordingTime(0); }}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-gray-400 hover:text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-2 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-50'}`}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-indigo-400' : 'hover:bg-gray-50 text-gray-500 hover:text-indigo-600'}`}
            >
              <Icons.Plus className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{language === 'id' ? 'Foto' : 'Photo'}</span>
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />

            {!audioUrl && !isRecording && (
              <button
                type="button"
                onClick={handleStartRecording}
                className={`p-3 rounded-xl transition-all flex items-center gap-2 ${isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-indigo-400' : 'hover:bg-gray-50 text-gray-500 hover:text-indigo-600'}`}
              >
                <Icons.Mic className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{language === 'id' ? 'Suara' : 'Voice'}</span>
              </button>
            )}

            {micError && <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-2">{micError}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.postDuration}</p>
          <div className={`flex p-1 rounded-full border w-fit ${isDark ? 'bg-[#262626] border-gray-800' : 'bg-gray-100 border-gray-200 shadow-sm'}`}>
            <button
              type="button"
              onClick={() => setDuration(PostDuration.TEMP)}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest ${
                duration === PostDuration.TEMP ? (isDark ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-gray-400'
              }`}
            >
              <Icons.Clock className="w-3.5 h-3.5" />
              {t.temp}
            </button>
            <button
              type="button"
              onClick={() => setDuration(PostDuration.PERM)}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest ${
                duration === PostDuration.PERM ? (isDark ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-gray-400'
              }`}
            >
              <Icons.CheckCircle className="w-3.5 h-3.5" />
              {t.permanent}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!hasContent || isRecording}
            className={`px-12 py-4 rounded-full text-[11px] font-black transition-all shadow-xl active:scale-95 uppercase tracking-[0.3em] ${
              !hasContent || isRecording
                ? (isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-300')
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {t.post}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
