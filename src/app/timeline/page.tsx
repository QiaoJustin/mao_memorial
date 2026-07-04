'use client';

import { useEffect, useState, useRef, use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TimelineContainer from '@/components/timeline/TimelineContainer';
import TimelineFilter from '@/components/timeline/TimelineFilter';
import NodeDetailModal from '@/components/timeline/NodeDetailModal';
import Lightbox from '@/components/gallery/Lightbox';
import { useInfiniteTimeline } from '@/hooks/use-infinite-timeline';
import { useTimelineStore } from '@/stores/timeline-store';
import { Clock, ChevronDown } from 'lucide-react';

interface Era {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
}

interface PageProps {
  searchParams: Promise<{
    era?: string;
  }>;
}

export default function TimelinePage({ searchParams }: PageProps) {
  const [eras, setEras] = useState<Era[]>([]);
  const { selectedEra, setSelectedEra } = useTimelineStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentYear, setCurrentYear] = useState(1918);
  const timelineRef = useRef<HTMLDivElement>(null);

  const resolvedSearchParams = use(searchParams);

  useEffect(() => {
    if (resolvedSearchParams.era) {
      setSelectedEra(resolvedSearchParams.era);
    }
  }, [resolvedSearchParams.era, setSelectedEra]);

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

  const { nodes, isLoading, isLoadingMore, hasMore, loadMore, total } = useInfiniteTimeline({
    era: selectedEra || undefined,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      const yearRange = 1965 - 1918;
      const year = 1918 + Math.floor((progress / 100) * yearRange);
      setCurrentYear(year);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToYear = (year: number) => {
    const yearRange = 1965 - 1918;
    const progress = (year - 1918) / yearRange;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = progress * docHeight;
    window.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  const years = Array.from({ length: 10 }, (_, i) => 1918 + i * 5);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <section className="pt-24 pb-12 bg-gradient-crimson">
        <div className="container-page">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">生平时间轴</h1>
          <p className="text-white/80 mb-6">按时间顺序浏览毛泽东主席生平中的重要时间节点和重大事件</p>
          <TimelineFilter eras={eras} />
        </div>
      </section>

      <section className="py-12 bg-bg relative" ref={timelineRef}>
        <div className="container-page">
          <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-1">
              <TimelineContainer
                nodes={nodes}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                loadMore={loadMore}
              />

              <div className="text-center mt-8">
                <p className="text-sm text-text-light">
                  共 {total.toLocaleString()} 个时间节点
                </p>
              </div>
            </main>

            <aside className="hidden lg:block w-48 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-surface rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-serif font-semibold text-text">时间进度</span>
                  </div>

                  <div className="relative mb-4">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2" />
                    <div
                      className="absolute left-1/2 w-0.5 bg-accent -translate-x-1/2 transition-all duration-300"
                      style={{ height: `${scrollProgress}%`, top: 0 }}
                    />
                    <div className="space-y-3">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => scrollToYear(year)}
                          className="relative w-full text-left text-sm transition-colors hover:text-accent"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${year <= currentYear ? 'text-text' : 'text-text-light'}`}>
                              {year}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full transition-colors ${
                                year <= currentYear ? 'bg-accent' : 'bg-text-light/30'
                              }`}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                    <span className="text-2xl font-serif font-bold text-accent">{currentYear}</span>
                    <span className="text-sm text-text-light">年</span>
                  </div>

                  <button
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="w-full mt-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
                  >
                    跳转到最后
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2">
          <div className="text-xs text-text-light writing-mode-vertical">
            {currentYear}年
          </div>
          <div className="w-1 h-32 bg-primary/30 rounded-full relative">
            <div
              className="absolute bottom-0 left-0 right-0 bg-accent rounded-full transition-all duration-300"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>
          <div className="text-xs text-text-light">
            {Math.round(scrollProgress)}%
          </div>
        </div>
      </section>

      <Footer />

      <NodeDetailModal />
      <Lightbox />
    </div>
  );
}