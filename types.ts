
export enum PostType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  TEXT_VOICE = 'TEXT_VOICE',
  PHOTO_VOICE = 'PHOTO_VOICE',
  JOURNAL = 'JOURNAL'
}

export enum PostDuration {
  TEMP = 'TEMP', // 24 Hours
  PERM = 'PERM'  // Permanent
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  lastHandleUpdate?: number; // Timestamp of the last @handle change
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  type: PostType;
  duration: PostDuration;
  createdAt: number;
  content?: string;
  title?: string;
  audioUrl?: string;
  imageUrl?: string;
  likes: number;
  hasLiked: boolean;
  replies: Reply[];
  isPublished?: boolean;
  views?: number;
  shares?: number;
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export type Theme = 'light' | 'dark';
export type Language = 'id' | 'en';
