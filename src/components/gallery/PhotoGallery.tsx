'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { useUIStore } from '@/stores/ui-store';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  year?: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

function PhotoItem({ photo, index, onClick }: { photo: Photo; index: number; onClick: () => void }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onClick}
      className="group relative rounded-lg overflow-hidden aspect-square bg-surface cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      <img
        src={photo.thumbnailUrl || photo.url}
        alt={photo.caption}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        {photo.year && (
          <span className="inline-block self-start px-2 py-1 bg-accent/80 text-white text-xs font-medium rounded mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {photo.year}年
          </span>
        )}
        <p className="text-white text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {photo.caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function PhotoGallery({ photos, isLoading, hasMore, loadMore }: PhotoGalleryProps) {
  const setLightbox = useUIStore((state) => state.setLightbox);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
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
  }, [hasMore, isLoading, loadMore]);

  const handlePhotoClick = (photo: Photo, index: number) => {
    const images = photos.map((p) => ({
      url: p.url,
      caption: p.caption,
    }));
    setLightbox(true, images, index);
  };

  if (photos.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-text-light">暂无相关照片</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <PhotoItem
          key={photo.id}
          photo={photo}
          index={index}
          onClick={() => handlePhotoClick(photo, index)}
        />
      ))}

      {isLoading && (
        <div className="col-span-full text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div ref={observerRef} className="h-8" />
    </div>
  );
}