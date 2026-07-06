'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
}

interface ImageCarouselProps {
  photos: Photo[];
  onClose?: () => void;
}

export default function ImageCarousel({ photos, onClose }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setLightbox = useUIStore((state) => state.setLightbox);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleImageClick = () => {
    const images = photos.map((p) => ({ url: p.url, caption: p.caption }));
    setLightbox(true, images, currentIndex);
  };

  return (
    <div className="relative group">
      {/* Main image area */}
      <div
        onClick={handleImageClick}
        className="relative aspect-[16/9] md:aspect-[21/9] bg-neutral-900 overflow-hidden cursor-pointer"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex].url}
            alt={photos[currentIndex].caption}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none" />

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <p className="text-white/90 text-sm md:text-base font-light tracking-wide truncate max-w-[80%]">
            {photos[currentIndex].caption}
          </p>
        </div>

        {/* Photo count indicator */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/80 text-[11px] font-mono tracking-wider select-none">
            {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </div>
        )}

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full
                bg-white/10 backdrop-blur-sm flex items-center justify-center text-white
                opacity-0 group-hover:opacity-100 hover:bg-white/20
                transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0"
              aria-label="上一张"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full
                bg-white/10 backdrop-blur-sm flex items-center justify-center text-white
                opacity-0 group-hover:opacity-100 hover:bg-white/20
                transition-all duration-300 translate-x-[4px] group-hover:translate-x-0"
              aria-label="下一张"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="mt-3 px-1">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-11 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg opacity-100'
                    : 'opacity-50 hover:opacity-80'
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
        </div>
      )}
    </div>
  );
}
