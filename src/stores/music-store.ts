import { create } from 'zustand';
import { API } from '@/constants/api';

export interface Song {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  duration: number | null;
  audioUrl: string;
  coverUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  playCount: number;
}

interface MusicState {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isPanelOpen: boolean;
  isLoading: boolean;

  fetchSongs: () => Promise<void>;
  play: (song?: Song) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  seek: (time: number) => void;
  togglePanel: () => void;
  closePanel: () => void;
}

function getStoredVolume(): number {
  if (typeof window === 'undefined') return 0.5;
  const stored = localStorage.getItem('music-volume');
  return stored ? parseFloat(stored) : 0.5;
}

function getStoredSongId(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('music-current-song');
  return stored ? parseInt(stored, 10) : null;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  songs: [],
  currentSong: null,
  isPlaying: false,
  volume: getStoredVolume(),
  currentTime: 0,
  duration: 0,
  isPanelOpen: false,
  isLoading: false,

  fetchSongs: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch(API.MUSIC);
      const json = await res.json();
      const songs = json.data || [];
      set({ songs, isLoading: false });

      // Restore last played song
      const storedId = getStoredSongId();
      if (storedId) {
        const found = songs.find((s: Song) => s.id === storedId);
        if (found) {
          set({ currentSong: found });
          return;
        }
      }
      // Fallback to first song - 首次访问时自动播放
      if (songs.length > 0 && !get().currentSong) {
        set({ currentSong: songs[0], isPlaying: true });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  play: (song) => {
    const { songs } = get();
    if (song) {
      set({ currentSong: song, isPlaying: true, currentTime: 0 });
      localStorage.setItem('music-current-song', String(song.id));
    } else if (songs.length > 0) {
      set({ currentSong: songs[0], isPlaying: true, currentTime: 0 });
    }
  },

  pause: () => set({ isPlaying: false }),

  resume: () => {
    if (get().currentSong) {
      set({ isPlaying: true });
    }
  },

  next: () => {
    const { songs, currentSong } = get();
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    set({ currentSong: nextSong, isPlaying: true, currentTime: 0 });
    localStorage.setItem('music-current-song', String(nextSong.id));
  },

  prev: () => {
    const { songs, currentSong } = get();
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    set({ currentSong: prevSong, isPlaying: true, currentTime: 0 });
    localStorage.setItem('music-current-song', String(prevSong.id));
  },

  setVolume: (volume) => {
    set({ volume });
    localStorage.setItem('music-volume', String(volume));
  },

  setCurrentTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  seek: (time) => set({ currentTime: time }),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  closePanel: () => set({ isPanelOpen: false }),
}));
