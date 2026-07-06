'use client';

import { Play, Music } from 'lucide-react';
import { useMusicStore } from '@/stores/music-store';

function formatDuration(s: number | null): string {
  if (s === null || s === undefined || !isFinite(s)) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function MusicPlayerPlaylist() {
  const { songs, currentSong, play, isLoading } = useMusicStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-text-light">
        加载中...
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-text-light">
        暂无歌曲
      </div>
    );
  }

  return (
    <div className="max-h-[200px] space-y-0 overflow-y-auto">
      {songs.map((song) => {
        const isCurrent = currentSong?.id === song.id;

        return (
          <button
            key={song.id}
            onClick={() => play(song)}
            className={`flex w-full items-center gap-3 border-b border-white/5 px-1 py-2.5 text-left transition-colors hover:bg-white/5 ${
              isCurrent ? 'text-accent' : 'text-text-light'
            }`}
          >
            {/* Active indicator */}
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
              {isCurrent ? (
                <Play className="h-3 w-3 fill-current" />
              ) : (
                <Music className="h-3 w-3" />
              )}
            </span>

            {/* Song info */}
            <div className="min-w-0 flex-1">
              <div
                className={`truncate text-sm font-medium ${
                  isCurrent ? 'text-white' : 'text-text'
                }`}
              >
                {song.title}
              </div>
              {song.artist && (
                <div className="truncate text-xs text-text-light">{song.artist}</div>
              )}
            </div>

            {/* Duration */}
            <span className="flex-shrink-0 text-xs text-text-light">
              {formatDuration(song.duration)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
