'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={handleImageClick}
        className="relative aspect-video bg-black/90 overflow-hidden cursor-pointer"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex].url}
            alt={photos[currentIndex].caption}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain"
          />
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{photos[currentIndex].caption}</p>
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-accent' : 'border-transparent'
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

      {photos.length > 1 && (
        <div className="text-center mt-2">
          <span className="text-sm text-text-light">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}