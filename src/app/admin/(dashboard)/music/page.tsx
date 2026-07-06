'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { adminFetch } from '@/lib/admin-fetch';
import { API } from '@/constants/api';
import type { Song } from '@/stores/music-store';
import { Edit, Trash2, Music } from 'lucide-react';

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MusicPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(API.ADMIN.MUSIC + '?pageSize=50');
      const data = await res.json();
      if (data.code === 200) {
        setSongs(data.data.list ?? data.data ?? []);
      }
    } catch {
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleToggleActive = async (song: Song) => {
    try {
      const res = await adminFetch(API.ADMIN.MUSIC_DETAIL(song.id), {
        method: 'PUT',
        body: JSON.stringify({ isActive: !song.isActive }),
      });
      const data = await res.json();
      if (data.code === 200) {
        fetchSongs();
      }
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该歌曲？')) return;
    try {
      const res = await adminFetch(API.ADMIN.MUSIC_DETAIL(id), {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSongs();
      }
    } catch {}
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text">音乐管理</h1>
        <Link
          href="/admin/music/new"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
        >
          新增歌曲
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">歌曲名</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">演唱者</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">时长</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">播放次数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : songs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-text-light">
                  暂无数据
                </td>
              </tr>
            ) : (
              songs.map((song) => (
                <tr key={song.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-bg flex items-center justify-center text-text-light">
                          <Music className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-text">{song.title}</p>
                        {song.album && (
                          <p className="text-xs text-text-light">{song.album}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-text-light">{song.artist || '--'}</td>
                  <td className="px-4 py-4 text-sm text-text-light">{formatDuration(song.duration)}</td>
                  <td className="px-4 py-4 text-sm text-text-light">{song.playCount}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(song)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        song.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          song.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/music/${song.id}/edit`}
                        className="p-2 text-text-light hover:text-accent transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(song.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
