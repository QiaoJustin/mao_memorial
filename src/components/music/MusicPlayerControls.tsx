'use client';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useMusicStore } from '@/stores/music-store';

export default function MusicPlayerControls() {
  const { isPlaying, currentSong, play, pause, resume, next, prev } = useMusicStore();

  const handlePlayPause = () => {
    if (!currentSong) return;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handlePrev = () => {
    if (currentSong) prev();
  };

  const handleNext = () => {
    if (currentSong) next();
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous */}
      <button
        onClick={handlePrev}
        disabled={!currentSong}
        className="rounded-full p-2 text-text-light transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        title="上一首"
      >
        <SkipBack className="h-5 w-5" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        disabled={!currentSong}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all hover:bg-accent/80 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        title={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
      </button>

      {/* Next */}
      <button
        onClick={handleNext}
        disabled={!currentSong}
        className="rounded-full p-2 text-text-light transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        title="下一首"
      >
        <SkipForward className="h-5 w-5" />
      </button>
    </div>
  );
}
