'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMusicStore } from '@/stores/music-store';
import MusicPlayerButton from './MusicPlayerButton';
import MusicPlayerProgress from './MusicPlayerProgress';
import MusicPlayerControls from './MusicPlayerControls';
import MusicPlayerVolume from './MusicPlayerVolume';
import MusicPlayerPlaylist from './MusicPlayerPlaylist';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    isPanelOpen,
    setCurrentTime,
    setDuration,
    seek,
    next,
    closePanel,
    fetchSongs,
  } = useMusicStore();

  // Fetch songs on mount
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Sync audio src when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (audio.src !== currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.load();
    }
  }, [currentSong]);

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay might be blocked by browser
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Sync seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Only seek if the difference is significant (to avoid loops)
    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, currentSong]);

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, [setCurrentTime]);

  // Loaded metadata handler
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  }, [setDuration]);

  // Ended handler
  const handleEnded = useCallback(() => {
    next();
  }, [next]);

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Floating button */}
      <MusicPlayerButton />

      {/* Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0 flex-1 pr-2">
                <div className="truncate text-sm font-medium text-white">
                  {currentSong?.title ?? '未选择歌曲'}
                </div>
                {currentSong?.artist && (
                  <div className="truncate text-xs text-text-light">
                    {currentSong.artist}
                  </div>
                )}
              </div>
              <button
                onClick={closePanel}
                className="flex-shrink-0 rounded-full p-1.5 text-text-light transition-colors hover:bg-white/10 hover:text-white"
                title="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 p-4">
              {/* Progress */}
              <MusicPlayerProgress />

              {/* Controls */}
              <MusicPlayerControls />

              {/* Volume */}
              <MusicPlayerVolume />

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Playlist */}
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-light">
                  播放列表
                </div>
                <MusicPlayerPlaylist />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
