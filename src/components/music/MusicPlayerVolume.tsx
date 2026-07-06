'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useMusicStore } from '@/stores/music-store';

export default function MusicPlayerVolume() {
  const { volume, setVolume } = useMusicStore();

  const isMuted = volume === 0;

  return (
    <div className="flex items-center gap-2 px-1">
      <button
        onClick={() => setVolume(isMuted ? 0.5 : 0)}
        className="flex-shrink-0 rounded-md p-1 text-text-light transition-colors hover:text-white"
        title={isMuted ? '取消静音' : '静音'}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none
          [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-accent
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125
          [&::-moz-range-thumb]:h-3.5
          [&::-moz-range-thumb]:w-3.5
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-accent
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md"
        style={{
          background: `linear-gradient(to right, #D4AF37 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
        }}
      />
    </div>
  );
}
