'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { adminFetch } from '@/lib/admin-fetch';
import { API } from '@/constants/api';
import { ArrowLeft, Image, Upload, X, Check, Search, ListOrdered, Maximize2, HardDrive } from 'lucide-react';

interface NodeOption {
  id: number;
  title: string;
  date: string;
}

interface FormData {
  nodeId: number | null;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  width: number;
  height: number;
  fileSize: number;
  sortOrder: number;
  isCover: boolean;
}

export default function PhotoCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nodeId: null,
    url: '',
    thumbnailUrl: '',
    caption: '',
    altText: '',
    width: 0,
    height: 0,
    fileSize: 0,
    sortOrder: 0,
    isCover: false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Node selector state
  const [nodes, setNodes] = useState<NodeOption[]>([]);
  const [nodeSearchQuery, setNodeSearchQuery] = useState('');
  const [showNodeDropdown, setShowNodeDropdown] = useState(false);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const nodeDropdownRef = useRef<HTMLDivElement>(null);
  const nodeInputRef = useRef<HTMLInputElement>(null);

  // Load initial nodes
  useEffect(() => {
    fetchNodes('');
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeDropdownRef.current && !nodeDropdownRef.current.contains(e.target as Node)) {
        setShowNodeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNodes = async (query: string) => {
    setLoadingNodes(true);
    try {
      const res = await adminFetch(`${API.ADMIN.NODES}?page=1&pageSize=50&q=${encodeURIComponent(query)}&sortBy=dateSort&sortOrder=desc`);
      const data = await res.json();
      if (data.code === 200) {
        setNodes(data.data.list || []);
      }
    } catch {
      // 静默处理
    } finally {
      setLoadingNodes(false);
    }
  };

  const handleNodeSearch = (value: string) => {
    setNodeSearchQuery(value);
    setFormData((prev) => ({ ...prev, nodeId: null }));
    fetchNodes(value);
    setShowNodeDropdown(true);
  };

  const selectNode = (node: NodeOption) => {
    setFormData((prev) => ({ ...prev, nodeId: node.id }));
    setNodeSearchQuery(`${node.date} ${node.title}`);
    setShowNodeDropdown(false);
    setError('');
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    setUploading(true);
    setError('');
    setImageLoaded(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      // 上传直接使用原生 fetch，避免 adminFetch 对 FormData 的 headers 处理问题
      const res = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }
      const data = await res.json();
      if (data.code === 200) {
        setFormData((prev) => ({
          ...prev,
          url: data.data.url,
          thumbnailUrl: data.data.thumbnailUrl || data.data.url,
          width: data.data.width || 0,
          height: data.data.height || 0,
          fileSize: data.data.fileSize || 0,
        }));
      } else {
        setError(data.message || '上传失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nodeId) {
      setError('请选择所属节点');
      return;
    }
    if (!formData.url) {
      setError('请上传图片');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await adminFetch(API.ADMIN.PHOTOS, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.code === 200) {
        router.push('/admin/photos');
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
      {/* ========== HEADER ========== */}
      <div className="mb-8">
        <Link
          href="/admin/photos"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-accent transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          返回照片列表
        </Link>
        <h1 className="text-2xl font-serif font-bold text-text tracking-tight">新增照片</h1>
        <p className="text-sm text-text-light/70 mt-1">上传照片并填写相关信息</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ========== ERROR BANNER ========== */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ===== LEFT: METADATA ===== */}
          <div className="lg:col-span-3 space-y-6">
            {/* Section: Basic Info */}
            <div className="rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-1 h-5 bg-accent rounded-full" />
                <span className="text-sm font-semibold text-text tracking-wide">基本信息</span>
              </div>
              <div className="p-6 space-y-5">
                {/* Node Selector */}
                <div ref={nodeDropdownRef} className="relative">
                  <label className="block text-sm font-medium text-text-light mb-2">
                    所属节点 <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light/40 pointer-events-none" />
                    <input
                      ref={nodeInputRef}
                      type="text"
                      value={nodeSearchQuery}
                      onChange={(e) => handleNodeSearch(e.target.value)}
                      onFocus={() => setShowNodeDropdown(true)}
                      className="w-full pl-10 pr-4 py-3 bg-bg border border-white/10 rounded-xl
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="搜索并选择时间节点..."
                    />
                    {loadingNodes && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {showNodeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-56 overflow-y-auto
                                    rounded-xl border border-white/10 bg-bg/95 backdrop-blur-xl shadow-2xl">
                      {nodes.length > 0 ? (
                        <div className="py-1">
                          {nodes.map((node) => (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => selectNode(node)}
                              className={`w-full px-4 py-3 text-left text-sm transition-colors duration-150
                                         hover:bg-accent/10 flex items-center gap-3
                                         ${formData.nodeId === node.id ? 'bg-accent/10 text-accent' : 'text-text'}`}
                            >
                              <span className="shrink-0 text-xs text-text-light/50 font-mono min-w-[5rem]">{node.date}</span>
                              <span className="truncate">{node.title}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-text-light/50">
                          {nodeSearchQuery ? '未找到匹配的节点' : '暂无数据'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">图片说明</label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                    className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                               text-text placeholder:text-text-light/30
                               focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                               transition-all duration-200"
                    placeholder="图片描述信息"
                  />
                </div>

                {/* Alt Text + Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      替代文本 (Alt)
                    </label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="SEO 优化描述"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5" />
                        排序序号
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Cover Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-bg/50 rounded-xl border border-white/5">
                  <input
                    type="checkbox"
                    id="isCover"
                    checked={formData.isCover}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isCover: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-accent focus:ring-accent/30 bg-bg"
                  />
                  <div className="flex-1">
                    <label htmlFor="isCover" className="text-sm font-medium text-text cursor-pointer">
                      设为封面
                    </label>
                    <p className="text-xs text-text-light/50 mt-0.5">将此照片设为所属节点的封面图片</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Image Info */}
            <div className="rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-1 h-5 bg-accent rounded-full" />
                <span className="text-sm font-semibold text-text tracking-wide">图片信息</span>
                {formData.url && (
                  <span className="text-xs text-text-light/40 font-normal">自动获取</span>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5" />
                        宽度 (px)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData((prev) => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="自动获取"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 rotate-90" />
                        高度 (px)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData((prev) => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="自动获取"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        文件大小
                      </span>
                    </label>
                    <div className="w-full px-4 py-3 bg-bg/50 border border-white/5 rounded-xl text-text-light/70 text-sm flex items-center gap-2">
                      {formData.fileSize > 0 ? (
                        <>
                          <span className="text-text">
                            {formData.fileSize < 1024
                              ? `${formData.fileSize} B`
                              : formData.fileSize < 1024 * 1024
                                ? `${(formData.fileSize / 1024).toFixed(1)} KB`
                                : `${(formData.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                          </span>
                          <span className="text-xs text-text-light/40">自动检测</span>
                        </>
                      ) : formData.url ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          正在获取...
                        </>
                      ) : (
                        <span className="text-text-light/40">上传图片后自动获取</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">缩略图地址</label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                                 text-text placeholder:text-text-light/30
                                 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                                 transition-all duration-200"
                      placeholder="留空则使用原图"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: IMAGE UPLOAD ===== */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-1 h-5 bg-accent rounded-full" />
                <span className="text-sm font-semibold text-text tracking-wide">图片上传</span>
                {formData.url && (
                  <span className="text-xs text-text-light/40 font-normal">
                    {imageLoaded ? '上传成功' : '加载中...'}
                  </span>
                )}
              </div>
              <div className="p-6">
                {formData.url ? (
                  <div className="relative group">
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={formData.thumbnailUrl || formData.url}
                        alt={formData.altText || formData.caption || '预览'}
                        className="w-full aspect-[4/3] object-contain bg-bg/80"
                        onLoad={() => setImageLoaded(true)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            url: '',
                            thumbnailUrl: '',
                            width: 0,
                            height: 0,
                            fileSize: 0,
                          }));
                          setImageLoaded(false);
                        }}
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
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className={`flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed rounded-xl
                               cursor-pointer transition-all duration-200
                               ${dragOver
                                 ? 'border-accent bg-accent/10 scale-[1.02]'
                                 : 'border-white/10 bg-bg/50 hover:border-accent/40 hover:bg-accent/5'
                               }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
                                    ${dragOver ? 'bg-accent/20 scale-110' : 'bg-white/5'}`}>
                      <Image className={`w-7 h-7 transition-colors duration-200 ${dragOver ? 'text-accent' : 'text-text-light/50'}`} />
                    </div>
                    <span className={`text-base mt-4 font-medium transition-colors duration-200 ${dragOver ? 'text-accent' : 'text-text-light/60'}`}>
                      点击或拖拽上传图片
                    </span>
                    <span className="text-sm text-text-light/30 mt-1.5">支持 JPG、PNG、WebP、GIF</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
                {uploading && (
                  <div className="mt-4 flex items-center gap-2.5 text-sm text-text-light">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    上传中...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========== URL FIELD (full width) ========== */}
        <div className="mt-6 rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <span className="text-sm font-semibold text-text tracking-wide">图片链接</span>
          </div>
          <div className="p-6">
            <input
              type="url"
              value={formData.url}
              onChange={(e) => {
                const newUrl = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  url: newUrl,
                  thumbnailUrl: prev.thumbnailUrl || newUrl,
                }));
              }}
              className="w-full px-4 py-3 bg-bg border border-white/10 rounded-xl
                         text-text placeholder:text-text-light/30 font-mono text-sm
                         focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                         transition-all duration-200"
              placeholder="图片 URL 地址，上传后自动填充"
            />
          </div>
        </div>

        {/* ========== FOOTER ACTIONS ========== */}
        <div className="mt-8 flex items-center justify-center gap-4 pt-6 border-t border-white/5 mb-20">
          <Link
            href="/admin/photos"
            className="px-6 py-2.5 rounded-xl border border-white/10 text-text-light
                       hover:bg-white/5 transition-all duration-200 text-sm"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.url || !formData.nodeId}
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
