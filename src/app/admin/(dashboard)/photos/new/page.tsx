'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminFetch } from '@/lib/admin-fetch';
import { ArrowLeft, Upload, Check } from 'lucide-react';

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

  return (
    <AdminLayout
      title="新增照片"
      breadcrumbs={[
        { label: '照片管理', href: '/admin/photos' },
        { label: '新增照片' },
      ]}
    >
      <div className="card max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/photos" className="p-2 hover:bg-bg rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-text" />
          </Link>
          <h1 className="text-xl font-semibold text-text">新增照片</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
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
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">缩略图地址</label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="留空则使用原图"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">图片说明</label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="图片描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Alt 文本</label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData((prev) => ({ ...prev, altText: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="图片替代文本"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-light mb-2">预览</label>
              {formData.url ? (
                <img
                  src={formData.thumbnailUrl || formData.url}
                  alt={formData.altText || formData.caption}
                  className="max-w-full max-h-64 object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg text-text-light">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">请输入图片地址</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">宽度</label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData((prev) => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">高度</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData((prev) => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">文件大小 (字节)</label>
              <input
                type="number"
                value={formData.fileSize}
                onChange={(e) => setFormData((prev) => ({ ...prev, fileSize: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">排序</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent bg-bg"
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCover}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isCover: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-text-light">设为封面</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Link
              href="/admin/photos"
              className="px-6 py-2.5 border border-border rounded-lg text-text-light hover:bg-bg transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2 disabled:opacity-50"
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