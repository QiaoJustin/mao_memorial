'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminFetch } from '@/lib/admin-fetch';
import { ArrowLeft, Upload, Check, Image, X } from 'lucide-react';

interface FormData {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      alert('请填写图片地址');
      return;
    }

    setSaving(true);
    try {
      const res = await adminFetch('/api/v1/admin/photos', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.code === 200) {
        router.push('/admin/photos');
      } else {
        alert(data.message || '创建失败');
      }
    } catch {
      alert('创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminFetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
      });
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
        alert(data.message || '上传失败');
      }
    } catch {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout
      title="新增照片"
      breadcrumbs={[
        { label: '照片管理', href: '/admin/photos' },
        { label: '新增照片' },
      ]}
    >
      <div className="card max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/photos" className="p-2 hover:bg-bg rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-text" />
            </Link>
            <h1 className="text-xl font-semibold text-text">新增照片</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-border rounded-lg p-6 bg-bg/50">
            <label className="block text-sm font-medium text-text-light mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              图片上传
            </label>
            
            {formData.url ? (
              <div className="relative group">
                <img
                  src={formData.thumbnailUrl || formData.url}
                  alt={formData.altText || formData.caption}
                  className="max-w-full max-h-64 object-contain rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, url: '', thumbnailUrl: '' }))}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg text-text-light cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                <Upload className="w-10 h-10 mb-3" />
                <span className="text-sm font-medium">点击上传图片</span>
                <span className="text-xs mt-1">支持 JPG、PNG、GIF 格式</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            
            {uploading && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-text-light">上传中...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">图片地址 *</label>
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
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">缩略图地址</label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="留空则使用原图"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">图片说明</label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="图片描述信息"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Alt 文本</label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="图片替代文本（SEO优化）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">宽度 (像素)</label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData((prev) => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">高度 (像素)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData((prev) => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">文件大小 (字节)</label>
              <input
                type="number"
                value={formData.fileSize}
                onChange={(e) => setFormData((prev) => ({ ...prev, fileSize: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">排序序号</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-bg/50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCover"
                checked={formData.isCover}
                onChange={(e) => setFormData((prev) => ({ ...prev, isCover: e.target.checked }))}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="isCover" className="text-sm text-text-light cursor-pointer">
                设为封面
              </label>
            </div>
            <span className="text-xs text-text-light">将此照片设为所属节点的封面图片</span>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            <Link
              href="/admin/photos"
              className="px-6 py-2.5 border border-border rounded-lg text-text-light hover:bg-bg transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.url}
              className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              保存
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}