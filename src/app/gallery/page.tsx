'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
  }, [selectedEra, searchQuery]);

  useEffect(() => {
    async function fetchPhotosData() {
      if (!hasMore) return;
      setIsLoading(true);
      try {
        let url = `/api/v1/photos?page=${page}&pageSize=16`;
        if (selectedEra) url += `&era=${encodeURIComponent(selectedEra)}`;
        if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 200) {
          const newPhotos = data.data.list || [];
          if (page === 1) {
            setPhotos(newPhotos);
          } else {
            setPhotos((prev) => [...prev, ...newPhotos]);
          }
          setTotal(data.data.total || 0);
          setHasMore(newPhotos.length > 0);
        } else {
          setHasMore(false);
        }
      } catch {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhotosData();
  }, [page, selectedEra, searchQuery, hasMore]);

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
            onEraChange={setSelectedEra}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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