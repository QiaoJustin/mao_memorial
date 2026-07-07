'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { adminFetch } from '@/lib/admin-fetch';
import { API } from '@/constants/api';
import { ArrowLeft, Music, Image, Upload, X, Check, Disc3, Mic, ListOrdered } from 'lucide-react';

// 根据 URL 获取音频时长（秒），只执行一次
function useAudioDuration(audioUrl: string): number | null {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setDuration(null);
      return;
    }

    let cancelled = false;
    const audio = new Audio();
    audio.preload = 'metadata';

    audio.addEventListener('loadedmetadata', () => {
      if (!cancelled && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    }, { once: true });

    audio.addEventListener('error', () => {
      // 无法获取时长时静默忽略
      if (!cancelled) setDuration(null);
    }, { once: true });

    audio.src = audioUrl;

    return () => {
      cancelled = true;
      audio.src = '';
    };
  }, [audioUrl]);

  return duration;
}

export default function MusicNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [audioDragOver, setAudioDragOver] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);

  const duration = useAudioDuration(audioUrl);

  const handleFileUpload = async (file: File, type: 'audio' | 'image') => {
    const setUploading = type === 'audio' ? setUploadingAudio : setUploadingCover;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch(API.ADMIN.UPLOAD, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.code === 200) {
        if (type === 'audio') {
          setAudioUrl(data.data.url);
        } else {
          setCoverUrl(data.data.url);
        }
      } else {
        setError(data.message || '上传失败');
      }
    } catch {
      setError('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('请输入歌曲名');
      return;
    }
    if (!audioUrl) {
      setError('请上传音频文件');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await adminFetch(API.ADMIN.MUSIC, {
        method: 'POST',
        body: JSON.stringify({
          title,
          artist: artist || null,
          album: album || null,
          duration,
          audioUrl,
          coverUrl: coverUrl || null,
          sortOrder,
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        router.push('/admin/music');
      } else {
        setError(data.message || '创建失败');
        setSaving(false);
      }
    } catch {
      setError('创建失败');
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <Link
          href="/admin/music"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-accent transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          返回音乐列表
        </Link>
        <h1 className="text-2xl font-serif font-bold text-text tracking-tight">新增歌曲</h1>
        <p className="text-sm text-text-light/70 mt-1">填写歌曲信息并上传音频文件</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Main grid: metadata left, media right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ========== LEFT COLUMN: METADATA ========== */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section: Basic Info */}
            <div className="rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-1 h-5 bg-accent rounded-full" />
                <span className="text-sm font-semibold text-text tracking-wide">基本信息</span>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">
                    歌曲名 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl 
                               text-text placeholder:text-text-light/30
                               focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                               transition-all duration-200"
                    placeholder="输入歌曲名称"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5" />
                        演唱者
                      </span>
                    </label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl 
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="演唱者名称"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Disc3 className="w-3.5 h-3.5" />
                        专辑
                      </span>
                    </label>
                    <input
                      type="text"
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl 
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="专辑名称（可选）"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5" />
                        排序号
                      </span>
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl 
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        时长
                      </span>
                    </label>
                    <div className="w-full px-4 py-3 bg-bg/50 border border-white/5 rounded-xl text-text-light/70 text-sm flex items-center gap-2">
                      {duration != null ? (
                        <>
                          <span className="text-text">{`${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`}</span>
                          <span className="text-xs text-text-light/40">自动检测</span>
                        </>
                      ) : audioUrl ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          正在获取时长...
                        </>
                      ) : (
                        <span className="text-text-light/40">上传音频后自动获取</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== RIGHT COLUMN: MEDIA ========== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section: Cover Image */}
            <div className="rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-1 h-5 bg-accent rounded-full" />
                <span className="text-sm font-semibold text-text tracking-wide">封面图片</span>
                {!coverUrl && (
                  <span className="text-xs text-text-light/40 font-normal">可选</span>
                )}
              </div>
              <div className="p-6">
                {coverUrl ? (
                  <div className="relative group">
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={coverUrl}
                        alt="封面"
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="absolute top-3 right-3 w-9 h-9 bg-black/60 text-white 
                                   rounded-full flex items-center justify-center
                                   opacity-0 group-hover:opacity-100 transition-all duration-200
                                   hover:bg-red-500/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                    onDragLeave={() => setCoverDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCoverDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                    }}
                    className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl 
                               cursor-pointer transition-all duration-200
                               ${coverDragOver
                                 ? 'border-accent bg-accent/10 scale-[1.02]'
                                 : 'border-white/10 bg-bg/50 hover:border-accent/40 hover:bg-accent/5'
                               }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
                                    ${coverDragOver ? 'bg-accent/20 scale-110' : 'bg-white/5'}`}>
                      <Image className={`w-6 h-6 transition-colors duration-200 ${coverDragOver ? 'text-accent' : 'text-text-light/50'}`} />
                    </div>
                    <span className={`text-sm mt-3 font-medium transition-colors duration-200 ${coverDragOver ? 'text-accent' : 'text-text-light/60'}`}>
                      点击或拖拽上传封面
                    </span>
                    <span className="text-xs text-text-light/30 mt-1">支持 JPG、PNG、WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'image');
                      }}
                      className="hidden"
                      disabled={uploadingCover}
                    />
                  </label>
                )}
                {uploadingCover && (
                  <div className="mt-3 flex items-center gap-2.5 text-sm text-text-light">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    上传中...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========== FULL WIDTH: AUDIO SECTION ========== */}
        <div className="mt-6 rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <span className="text-sm font-semibold text-text tracking-wide">音频文件</span>
            <span className="text-xs text-text-light/40 font-normal">支持 MP3、OGG、WAV、FLAC</span>
          </div>
          <div className="p-6">
            {audioUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-bg/80 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">{audioUrl.split('/').pop()}</p>
                    <p className="text-xs text-text-light/40 truncate">{audioUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioUrl('')}
                    className="w-8 h-8 rounded-lg text-text-light/50 hover:text-red-400 hover:bg-red-500/10 
                               flex items-center justify-center transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <audio controls className="w-full rounded-xl" src={audioUrl}>
                  您的浏览器不支持音频播放
                </audio>
              </div>
            ) : (
              <label
                onDragOver={(e) => { e.preventDefault(); setAudioDragOver(true); }}
                onDragLeave={() => setAudioDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setAudioDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file, 'audio');
                }}
                className={`flex flex-col items-center justify-center py-14 border-2 border-dashed rounded-xl 
                           cursor-pointer transition-all duration-200
                           ${audioDragOver
                             ? 'border-accent bg-accent/10 scale-[1.01]'
                             : 'border-white/10 bg-bg/50 hover:border-accent/40 hover:bg-accent/5'
                           }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
                                ${audioDragOver ? 'bg-accent/20 scale-110' : 'bg-white/5'}`}>
                  <Upload className={`w-7 h-7 transition-colors duration-200 ${audioDragOver ? 'text-accent' : 'text-text-light/50'}`} />
                </div>
                <span className={`text-base mt-4 font-medium transition-colors duration-200 ${audioDragOver ? 'text-accent' : 'text-text-light/60'}`}>
                  点击或拖拽上传音频文件
                </span>
                <span className="text-sm text-text-light/30 mt-1.5">MP3、OGG、WAV、FLAC 格式，最大 50MB</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'audio');
                  }}
                  className="hidden"
                  disabled={uploadingAudio}
                />
              </label>
            )}
            {uploadingAudio && (
              <div className="mt-4 flex items-center gap-2.5 text-sm text-text-light">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                上传中...
              </div>
            )}
          </div>
        </div>

        {/* ========== FOOTER ACTIONS ========== */}
        <div className="mt-8 flex items-center justify-center gap-4 pt-6 border-t border-white/5 mb-20">
          <Link
            href="/admin/music"
            className="px-6 py-2.5 rounded-xl border border-white/10 text-text-light 
                       hover:bg-white/5 transition-all duration-200 text-sm"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving || !title || !audioUrl}
            className="px-7 py-2.5 rounded-xl bg-accent text-white font-medium 
                       hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200 flex items-center gap-2 text-sm
                       shadow-lg shadow-accent/10"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
