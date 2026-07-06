'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Calendar, Image } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  width: number;
  height: number;
  node: {
    id: number;
    date: string;
    title: string;
    eraName: string;
  } | null;
}

async function fetchPhoto(id: number): Promise<Photo | null> {
  try {
    const res = await fetch(`/api/v1/photos/${id}`);
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export default function PhotoDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = parseInt(resolvedParams.id, 10);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const photoData = await fetchPhoto(id);
      setPhoto(photoData);
      setIsLoading(false);
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container-page pt-24">
          <div className="text-center py-16">
            <p className="text-text-light">加载中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container-page pt-24">
          <div className="text-center py-16">
            <Image className="w-12 h-12 text-text-light/30 mx-auto mb-4" />
            <p className="text-text-light">未找到该照片</p>
            <Link href="/photos" className="text-primary hover:underline mt-4 inline-block">
              返回照片画廊
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="pt-24 pb-8 bg-gradient-crimson">
        <div className="container-page">
          <Link
            href="/photos"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回照片画廊
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {photo.caption || '照片详情'}
          </h1>
          {photo.node && (
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {photo.node.date}
              </span>
              <span className="tag bg-white/20 text-white text-sm">
                {photo.node.eraName}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card overflow-hidden mb-8">
                <div className="relative bg-surface">
                  <img
                    src={photo.url}
                    alt={photo.altText || photo.caption}
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                </div>
                {photo.caption && (
                  <div className="p-6">
                    <p className="text-text leading-relaxed">{photo.caption}</p>
                  </div>
                )}
              </div>

              {photo.width && photo.height && (
                <div className="card p-4 mb-8">
                  <div className="flex items-center gap-4 text-sm text-text-light">
                    <span>尺寸: {photo.width} × {photo.height} px</span>
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:w-64">
              <div className="sticky top-24 space-y-6">
                {photo.node && (
                  <div className="card p-4">
                    <h3 className="font-serif font-semibold text-text mb-3">所属时间节点</h3>
                    <Link
                      href={`/timeline/${photo.node.id}`}
                      className="block"
                    >
                      <p className="text-sm text-text-light mb-1">{photo.node.date}</p>
                      <p className="text-text hover:text-accent transition-colors line-clamp-2">
                        {photo.node.title}
                      </p>
                    </Link>
                  </div>
                )}

                <div className="card p-4">
                  <h3 className="font-serif font-semibold text-text mb-3">快速导航</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/photos"
                        className="block text-text-light hover:text-primary transition-colors"
                      >
                        浏览全部照片
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/timeline"
                        className="block text-text-light hover:text-primary transition-colors"
                      >
                        查看时间轴
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}