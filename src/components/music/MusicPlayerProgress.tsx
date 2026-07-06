'use client';

import { useCallback, useRef } from 'react';
import { useMusicStore } from '@/stores/music-store';

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MusicPlayerProgress() {
  const { currentTime, duration, seek, currentSong } = useMusicStore();
  const isDragging = useRef(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      seek(newTime);
    },
    [duration, seek],
  );

  if (!currentSong) {
    return (
      <div className="px-1">
        <div className="mb-1 flex items-center justify-between text-xs text-text-light">
          <span>0:00</span>
          <span>0:00</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/10" />
      </div>
    );
  }

  return (
    <div className="px-1">
      <div className="mb-1 flex items-center justify-between text-xs text-text-light">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        onChange={handleChange}
        onMouseDown={() => {
          isDragging.current = true;
        }}
        onMouseUp={() => {
          isDragging.current = false;
        }}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-accent
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-accent
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md"
        style={{
          background: `linear-gradient(to right, #D4AF37 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
        }}
      />
    </div>
  );
}
