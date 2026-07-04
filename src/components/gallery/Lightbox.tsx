'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useKeyboard } from '@/hooks/use-keyboard';

export default function Lightbox() {
  const { lightboxOpen, lightboxImageIndex, lightboxImages, setLightbox } = useUIStore();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  useBodyScrollLock(lightboxOpen);

  const handleClose = useCallback(() => {
    setLightbox(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [setLightbox]);

  const handlePrev = useCallback(() => {
    if (lightboxImages.length === 0) return;
    const newIndex = lightboxImageIndex > 0 ? lightboxImageIndex - 1 : lightboxImages.length - 1;
    setLightbox(true, lightboxImages, newIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [lightboxImages, lightboxImageIndex, setLightbox]);

  const handleNext = useCallback(() => {
    if (lightboxImages.length === 0) return;
    const newIndex = lightboxImageIndex < lightboxImages.length - 1 ? lightboxImageIndex + 1 : 0;
    setLightbox(true, lightboxImages, newIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [lightboxImages, lightboxImageIndex, setLightbox]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 1));
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(4, Math.max(1, prev + delta)));
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      handleReset();
    } else {
      handleZoomIn();
    }
  }, [scale, handleReset, handleZoomIn]);

  useKeyboard({
    onEscape: handleClose,
    onArrowLeft: handlePrev,
    onArrowRight: handleNext,
  }, [lightboxImages, lightboxImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handleZoomIn, handleZoomOut]);

  const currentImage = lightboxImages[lightboxImageIndex];

  return (
    <AnimatePresence>
      {lightboxOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[100] flex flex-col"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClose}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8" onWheel={handleWheel}>
            <motion.img
              ref={imageRef}
              key={lightboxImageIndex}
              src={currentImage.url}
              alt={currentImage.caption}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                scale,
                x: position.x,
                y: position.y,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onDoubleClick={handleDoubleClick}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </div>

          <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-center">
              <p className="text-white text-sm">{currentImage.caption}</p>
              <p className="text-white/60 text-xs mt-1">
                {lightboxImageIndex + 1} / {lightboxImages.length}
              </p>
            </div>

            {lightboxImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide justify-center">
                {lightboxImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox(true, lightboxImages, index);
                      setScale(1);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === lightboxImageIndex ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}