'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { adminFetch } from '@/lib/admin-fetch';
import { API } from '@/constants/api';
import type { Song } from '@/stores/music-store';
import { Edit, Trash2, Music, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { AdminPagination } from '@/components/admin/AdminPagination';

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
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`${API.ADMIN.MUSIC}?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      if (data.code === 200) {
        setSongs(data.data.list ?? data.data ?? []);
        setTotal(data.data.total ?? 0);
      }
    } catch {
      setSongs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const moveSong = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === songs.length - 1)
    ) {
      return;
    }

    const newSongs = [...songs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSongs[index], newSongs[targetIndex]] = [newSongs[targetIndex], newSongs[index]];
    setSongs(newSongs);
    setHasChanges(true);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const items = songs.map((song, i) => ({
        id: song.id,
        sortOrder: i,
      }));
      const res = await adminFetch(API.ADMIN.MUSIC_REORDER, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setHasChanges(false);
        await fetchSongs();
      } else {
        alert(data.message || '排序失败');
      }
    } catch {
      alert('排序失败');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存排序'}
            </button>
          )}
          <Link
            href="/admin/music/new"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
          >
            新增歌曲
          </Link>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
          排序已修改，点击「保存排序」使更改生效
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light w-10">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">歌曲名</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">演唱者</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">时长</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">播放次数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">排序</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </td>
              </tr>
            ) : songs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-light">
                  暂无数据
                </td>
              </tr>
            ) : (
              songs.map((song, index) => (
                <tr key={song.id} className="border-b border-border hover:bg-bg transition-colors">
                  <td className="px-4 py-4 text-sm text-text-light/50 font-mono">
                    {index + 1}
                  </td>
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
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveSong(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 text-text-light/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="上移"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSong(index, 'down')}
                        disabled={index === songs.length - 1}
                        className="p-0.5 text-text-light/40 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="下移"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
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
        {!isLoading && songs.length > 0 && (
          <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        )}
      </div>
    </>
  );
}
