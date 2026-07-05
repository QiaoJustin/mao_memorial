'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotoCard from '@/components/PhotoCard';
import ErasNav from '@/components/ErasNav';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import { Image, Filter } from 'lucide-react';

interface Era {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
}

// P3-3: 替换 any 类型，定义 API 返回的 era 原始结构
interface ApiEra {
  id: number;
  name: string;
  period?: string;
}

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  nodeId?: number | null;
}

interface PageProps {
  searchParams: Promise<{
    era?: string;
    year?: string;
    page?: string;
  }>;
}

async function fetchEras(): Promise<Era[]> {
  try {
    const res = await fetch('/api/v1/eras', { cache: 'force-cache' });
    const data = await res.json();
    const erasData = data.data || [];
    return erasData.map((era: ApiEra) => {
      const [startYear, endYear] = era.period?.split('-').map((y: string) => parseInt(y, 10)) || [0, 0];
      return {
        id: era.id,
        name: era.name,
        startYear,
        endYear,
      };
    });
  } catch {
    return [];
  }
}

async function fetchPhotos(
  era?: string,
  year?: number,
  page: number = 1
): Promise<{ list: Photo[]; total: number; totalPages: number }> {
  try {
    let url = `/api/v1/photos?page=${page}&pageSize=16`;
    if (era) url += `&era=${encodeURIComponent(era)}`;
    if (year) url += `&year=${year}`;
    
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const responseData = data.data || { items: [], total: 0, totalPages: 0 };
    return {
      list: responseData.items || [],
      total: responseData.total || 0,
      totalPages: responseData.totalPages || 0,
    };
  } catch {
    return { list: [], total: 0, totalPages: 0 };
  }
}

export default function PhotosPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  const era = resolvedParams.era;
  const year = resolvedParams.year ? parseInt(resolvedParams.year, 10) : undefined;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const [eras, setEras] = useState<Era[]>([]);
  const [photosData, setPhotosData] = useState<{ list: Photo[]; total: number; totalPages: number }>({ list: [], total: 0, totalPages: 0 });

  useEffect(() => {
    async function loadData() {
      const [erasData, photosResult] = await Promise.all([
        fetchEras(),
        fetchPhotos(era, year, page),
      ]);
      setEras(erasData);
      setPhotosData(photosResult);
    }
    loadData();
  }, [era, year, page]);

  const years = Array.from({ length: 48 }, (_, i) => 1918 + i);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-crimson">
        <div className="container-page">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">照片画廊</h1>
          <p className="text-white/80 mb-6">浏览记录毛泽东主席生平的珍贵历史照片</p>
          <div className="max-w-xl">
            <SearchBar placeholder="搜索照片..." />
          </div>
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="container-page">
          <div className="mb-8">
            <h3 className="font-serif font-semibold text-text mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              年代分类
            </h3>
            <ErasNav eras={eras} currentEra={era} baseUrl="/photos" />
          </div>

          <div className="mb-8">
            <h3 className="font-serif font-semibold text-text mb-3">年份筛选</h3>
            <div className="flex flex-wrap gap-2">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    const url = new URL('/photos', window.location.origin);
                    if (era) url.searchParams.set('era', era);
                    if (year === y) {
                      url.searchParams.delete('year');
                    } else {
                      url.searchParams.set('year', y.toString());
                    }
                    url.searchParams.delete('page');
                    window.location.href = url.toString();
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    year === y
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-light hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-text-light">
              <Filter className="w-4 h-4" />
              <span className="text-sm">
                {era && `当前筛选：${era}`}
                {era && year && ' · '}
                {year && `${year}年`}
                {!era && !year && '全部照片'}
              </span>
            </div>
            <span className="text-sm text-text-light">
              共 {photosData.total.toLocaleString()} 张照片
            </span>
          </div>

          {photosData.list.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photosData.list.map((photo) => (
                <PhotoCard key={photo.id} {...photo} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-light">暂无相关照片</p>
            </div>
          )}

          {photosData.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={photosData.totalPages}
                baseUrl={`/photos${era ? `?era=${encodeURIComponent(era)}` : ''}${year ? `&year=${year}` : ''}`}
              />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}