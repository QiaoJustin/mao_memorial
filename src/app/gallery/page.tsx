'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Lightbox from '@/components/gallery/Lightbox';
import GalleryFilter from '@/components/gallery/GalleryFilter';
import PhotoGallery from '@/components/gallery/PhotoGallery';

interface Era {
  id: number;
  name: string;
}

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  year?: number;
}

export default function GalleryPage() {
  const [eras, setEras] = useState<Era[]>([]);
  const [selectedEra, setSelectedEra] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // P1-8: 使用 ref 跟踪 hasMore，避免 useEffect 依赖 hasMore state 导致循环
  const hasMoreRef = useRef(true);

  useEffect(() => {
    async function fetchErasData() {
      try {
        const res = await fetch('/api/v1/eras', { cache: 'force-cache' });
        const data = await res.json();
        setEras(data.data || []);
      } catch {
        setEras([]);
      }
    }
    fetchErasData();
  }, []);

  // P1-8: 合并原 Effect 2 和 3，添加 AbortController 取消旧请求
  // - 移除 hasMore 依赖（用 ref 替代），避免 setHasMore 触发 Effect 循环
  // - page=1 时清空照片列表（合并原 Effect 2 的重置逻辑）
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhotosData() {
      // page=1 时清空照片列表（筛选/搜索变化后的首次加载）
      if (page === 1) {
        setPhotos([]);
        setHasMore(true);
        hasMoreRef.current = true;
      }

      // 已无更多数据时跳过（非首页情况）
      if (!hasMoreRef.current && page > 1) return;

      setIsLoading(true);
      try {
        let url = `/api/v1/photos?page=${page}&pageSize=16`;
        if (selectedEra) url += `&era=${encodeURIComponent(selectedEra)}`;
        if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (controller.signal.aborted) return;

        if (data.code === 200) {
          const newPhotos = data.data.items || [];
          if (page === 1) {
            setPhotos(newPhotos);
          } else {
            setPhotos((prev) => [...prev, ...newPhotos]);
          }
          setTotal(data.data.total || 0);
          setHasMore(newPhotos.length > 0);
          hasMoreRef.current = newPhotos.length > 0;
        } else {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    fetchPhotosData();
    return () => controller.abort();
  }, [page, selectedEra, searchQuery]);

  // P1-8: 筛选/搜索变化时重置 page=1，触发上面的 Effect 重新加载
  const handleEraChange = (era?: string) => {
    setSelectedEra(era);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-crimson">
        <div className="container-page">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">照片画廊</h1>
          <p className="text-white/80 mb-6">浏览记录毛泽东主席生平的珍贵历史照片</p>
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="container-page">
          <GalleryFilter
            eras={eras}
            selectedEra={selectedEra}
            onEraChange={handleEraChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-text-light">
              {selectedEra && `当前筛选：${selectedEra}`}
              {searchQuery && selectedEra && ' · '}
              {searchQuery && `搜索：${searchQuery}`}
              {!selectedEra && !searchQuery && '全部照片'}
            </span>
            <span className="text-sm text-text-light">
              共 {total.toLocaleString()} 张照片
            </span>
          </div>

          <PhotoGallery
            photos={photos}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={handleLoadMore}
          />
        </div>
      </section>

      <Footer />

      <Lightbox />
    </div>
  );
}