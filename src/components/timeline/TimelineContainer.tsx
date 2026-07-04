'use client';

import { useEffect, useRef } from 'react';
import TimelineNodeComponent from './TimelineNode';
import TimelineSkeleton from './TimelineSkeleton';

interface TimelineNode {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  viewCount: number;
  eraName: string;
  photoUrl?: string;
}

interface TimelineContainerProps {
  nodes: TimelineNode[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export default function TimelineContainer({
  nodes,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
}: TimelineContainerProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    const element = observerRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  if (isLoading && nodes.length === 0) {
    return <TimelineSkeleton />;
  }

  if (nodes.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-text-light">暂无相关记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent -translate-x-1/2 hidden md:block" />

      <div className="space-y-8 md:space-y-12">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="relative"
          >
            <div className="hidden md:block">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent" />
            </div>
            <TimelineNodeComponent {...node} index={index} />
          </div>
        ))}
      </div>

      {isLoadingMore && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div ref={observerRef} className="h-20" />
    </div>
  );
}