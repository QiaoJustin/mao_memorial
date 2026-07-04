'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Save, Image, Calendar, Tag, Globe } from 'lucide-react';

interface Era {
  id: string;
  name: string;
}

interface Photo {
  id?: number;
  url: string;
  caption: string;
  isCover: boolean;
}

interface NodeDetail {
  id: number;
  date: string;
  year: number;
  eraId: string;
  title: string;
  description: string;
  historicalContext: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  isFeatured: boolean;
  photos: { id: number; url: string; caption: string; isCover: boolean }[];
}

export default function EditNodePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [eras, setEras] = useState<Era[]>([]);
  const [formData, setFormData] = useState<NodeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEras();
    fetchNode();
  }, []);

  const fetchEras = async () => {
    try {
      const res = await fetch('/api/v1/eras', { cache: 'force-cache' });
      const data = await res.json();
      setEras(data.data || []);
    } catch {
      setEras([]);
    }
  };

  const fetchNode = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/nodes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.code === 200) {
        setFormData(data.data);
      }
    } catch {
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !formData) return;

    setUploading(true);
    const formDataUpload = new FormData();
    Array.from(files).forEach((file) => formDataUpload.append('files', file));

    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch('/api/v1/admin/upload/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.code === 200) {
        const newPhotos = data.data.results.map((result: { url: string }) => ({
          id: undefined,
          url: result.url,
          caption: '',
          isCover: false,
        }));
        setFormData((prev) => ({
          ...prev!,
          photos: prev!.photos.length === 0 ? newPhotos.map((p: Photo, i: number) => ({ ...p, isCover: i === 0 })) : [...prev!.photos, ...newPhotos],
        }));
      }
    } catch {}
    setUploading(false);
  };

  const handlePhotoRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev!,
      photos: prev!.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSetCover = (index: number) => {
    setFormData((prev) => ({
      ...prev!,
      photos: prev!.photos.map((p, i) => ({ ...p, isCover: i === index })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !formData.title || !formData.date || !formData.eraId) {
      alert('请填写必填字段');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/v1/admin/nodes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.code === 200) {
        router.push('/admin/nodes');
      } else {
        alert(data.message || '更新失败');
      }
    } catch {
      alert('更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="编辑节点">
        <div className="card p-6">
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!formData) {
    return (
      <AdminLayout title="编辑节点">
        <div className="card p-6">
          <p className="text-text-light text-center py-8">节点不存在</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="编辑节点"
      breadcrumbs={[
        { label: '节点管理', href: '/admin/nodes' },
        { label: '编辑节点' },
      ]}
    >
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">年份</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                年代 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.eraId}
                onChange={(e) => setFormData({ ...formData, eraId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                required
              >
                <option value="">请选择年代</option>
                {eras.map((era) => (
                  <option key={era.id} value={era.id}>
                    {era.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">历史背景</label>
              <textarea
                value={formData.historicalContext}
                onChange={(e) => setFormData({ ...formData, historicalContext: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Image className="inline w-4 h-4 mr-1" />
                图片管理
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 hover:text-accent transition-colors"
                >
                  <Image className="w-12 h-12 text-text-light" />
                  <span className="text-text-light">{uploading ? '上传中...' : '点击或拖拽上传图片（最多10张）'}</span>
                </label>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={photo.id || index} className="relative group">
                      <img src={photo.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSetCover(index)}
                          className="p-2 bg-white rounded-full hover:bg-accent transition-colors"
                        >
                          <Tag className={`w-4 h-4 ${photo.isCover ? 'text-accent' : 'text-text'}`} />
                        </button>
                        <button
                          onClick={() => handlePhotoRemove(index)}
                          className="p-2 bg-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <span className="text-text">×</span>
                        </button>
                      </div>
                      {photo.isCover && (
                        <span className="absolute top-1 left-1 px-2 py-0.5 bg-accent text-white text-xs rounded">封面</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                SEO 标题
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">SEO 描述</label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-text">已发布</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-text">设为精选</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/nodes')}
                className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-bg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}