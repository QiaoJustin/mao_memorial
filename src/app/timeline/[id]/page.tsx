'use client';

import { Metadata, ResolvingMetadata } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, Eye, MapPin, Tag, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  let title = '时间节点详情';
  let description = '毛泽东主席生平中的重要时间节点';

  try {
    const res = await fetch(`/api/v1/timeline/${id}`);
    const data = await res.json();
    if (data.data) {
      title = data.data.title;
      description = data.data.description?.slice(0, 150) || description;
    }
  } catch {}

  return {
    title,
    description,
    openGraph: {
      title: `${title} - 毛主席生平纪念网站`,
      description,
    },
  };
}

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Era {
  id: number;
  name: string;
}

interface TimelineNode {
  id: number;
  title: string;
  description: string;
  historicalContext: string;
  date: string;
  location: string;
  viewCount: number;
  isFeatured: boolean;
  era: Era;
  photos: Photo[];
  tags: Tag[];
}

interface AdjacentNode {
  id: number;
  title: string;
  date: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

async function fetchNode(id: number): Promise<TimelineNode | null> {
  try {
    const res = await fetch(`/api/v1/timeline/${id}`);
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function fetchAdjacent(id: number): Promise<{ prev: AdjacentNode | null; next: AdjacentNode | null }> {
  try {
    const res = await fetch(`/api/v1/timeline/${id}/adjacent`);
    const data = await res.json();
    return data.data || { prev: null, next: null };
  } catch {
    return { prev: null, next: null };
  }
}

async function recordView(id: number) {
  try {
    await fetch(`/api/v1/timeline/${id}/view`, {
      method: 'POST',
    });
  } catch {}
}

export default function TimelineDetailPage({ params }: PageProps) {
  const id = parseInt(params.id, 10);
  const [node, setNode] = useState<TimelineNode | null>(null);
  const [adjacent, setAdjacent] = useState<{ prev: AdjacentNode | null; next: AdjacentNode | null }>({ prev: null, next: null });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [nodeData, adjacentData] = await Promise.all([
        fetchNode(id),
        fetchAdjacent(id),
      ]);
      setNode(nodeData);
      setAdjacent(adjacentData);
      setIsLoading(false);
    };

    loadData();
    recordView(id);
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

  if (!node) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="container-page pt-24">
          <div className="text-center py-16">
            <p className="text-text-light">未找到该时间节点</p>
            <Link href="/timeline" className="text-primary hover:underline mt-4 inline-block">
              返回时间轴
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
            href="/timeline"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回时间轴
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {node.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {node.date}
            </span>
            {node.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {node.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {node.viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {node.photos.length > 0 && (
                <div className="card mb-8 overflow-hidden">
                  <div className="relative aspect-video bg-surface">
                    <img
                      src={node.photos[currentPhotoIndex].url}
                      alt={node.photos[currentPhotoIndex].caption}
                      className="w-full h-full object-contain"
                    />
                    {node.photos.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : node.photos.length - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setCurrentPhotoIndex((prev) => (prev < node.photos.length - 1 ? prev + 1 : 0))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-text-light">
                      {node.photos[currentPhotoIndex].caption}
                    </p>
                    {node.photos.length > 1 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                        {node.photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === currentPhotoIndex ? 'border-accent' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={photo.thumbnailUrl || photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="card p-6 mb-8">
                <h2 className="font-serif text-xl font-semibold text-text mb-4">事件描述</h2>
                <p className="text-text leading-relaxed whitespace-pre-line">{node.description}</p>
              </div>

              {node.historicalContext && (
                <div className="card p-6 mb-8">
                  <h2 className="font-serif text-xl font-semibold text-text mb-4">历史背景</h2>
                  <p className="text-text leading-relaxed whitespace-pre-line">{node.historicalContext}</p>
                </div>
              )}

              {node.tags.length > 0 && (
                <div className="card p-6 mb-8">
                  <h2 className="font-serif text-xl font-semibold text-text mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    相关标签
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {node.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="tag bg-primary/10 text-primary"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div className="flex items-center gap-4">
                  {adjacent.prev && (
                    <Link
                      href={`/timeline/${adjacent.prev.id}`}
                      className="flex items-center gap-2 text-text-light hover:text-primary transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm">{adjacent.prev.date}</span>
                    </Link>
                  )}
                  {adjacent.next && (
                    <Link
                      href={`/timeline/${adjacent.next.id}`}
                      className="flex items-center gap-2 text-text-light hover:text-primary transition-colors"
                    >
                      <span className="text-sm">{adjacent.next.date}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <button className="flex items-center gap-2 text-text-light hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">分享</span>
                </button>
              </div>
            </div>

            <aside className="lg:w-64">
              <div className="sticky top-24 space-y-6">
                <div className="card p-4">
                  <h3 className="font-serif font-semibold text-text mb-3">年代分类</h3>
                  <span className="tag bg-primary/10 text-primary">{node.era.name}</span>
                </div>

                {adjacent.prev && (
                  <div className="card p-4">
                    <h3 className="font-serif font-semibold text-text mb-3">上一个事件</h3>
                    <Link
                      href={`/timeline/${adjacent.prev.id}`}
                      className="block"
                    >
                      <p className="text-sm text-text-light mb-1">{adjacent.prev.date}</p>
                      <p className="text-text hover:text-accent transition-colors line-clamp-2">
                        {adjacent.prev.title}
                      </p>
                    </Link>
                  </div>
                )}

                {adjacent.next && (
                  <div className="card p-4">
                    <h3 className="font-serif font-semibold text-text mb-3">下一个事件</h3>
                    <Link
                      href={`/timeline/${adjacent.next.id}`}
                      className="block"
                    >
                      <p className="text-sm text-text-light mb-1">{adjacent.next.date}</p>
                      <p className="text-text hover:text-accent transition-colors line-clamp-2">
                        {adjacent.next.title}
                      </p>
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}