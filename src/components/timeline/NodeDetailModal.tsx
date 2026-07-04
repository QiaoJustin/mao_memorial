'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye, Heart } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useNodeDetail } from '@/hooks/use-node-detail';
import { useAdjacentNodes } from '@/hooks/use-adjacent-nodes';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useKeyboard } from '@/hooks/use-keyboard';
import ImageCarousel from './ImageCarousel';

export default function NodeDetailModal() {
  const { selectedNodeId, setSelectedNodeId } = useUIStore();
  const { node, isLoading, mutate } = useNodeDetail(selectedNodeId);
  const { prev, next } = useAdjacentNodes(selectedNodeId);
  const modalRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!selectedNodeId);

  useEffect(() => {
    if (selectedNodeId) {
      fetch(`/api/v1/timeline/${selectedNodeId}/view`, { method: 'POST' }).catch(() => {});
      mutate();
    }
  }, [selectedNodeId, mutate]);

  const handleClose = () => {
    setSelectedNodeId(null);
  };

  const handlePrev = () => {
    if (prev) {
      setSelectedNodeId(prev.id);
    }
  };

  const handleNext = () => {
    if (next) {
      setSelectedNodeId(next.id);
    }
  };

  useKeyboard({
    onEscape: handleClose,
    onArrowLeft: handlePrev,
    onArrowRight: handleNext,
  }, [prev, next]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <AnimatePresence>
      {selectedNodeId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={handleClose}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-4xl md:mx-4 bg-bg md:rounded-xl z-50 overflow-hidden max-h-full md:max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-bg z-10 border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {prev && (
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-surface text-text-light hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                <span className="text-sm text-text-light">
                  {node?.date || '加载中...'}
                </span>
                {next && (
                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-surface text-text-light hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-surface text-text-light hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-12 bg-text-light/20 rounded animate-pulse" />
                  <div className="h-6 bg-text-light/20 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-text-light/20 rounded animate-pulse" />
                    <div className="h-4 bg-text-light/20 rounded animate-pulse" />
                    <div className="h-4 bg-text-light/20 rounded animate-pulse" />
                  </div>
                </div>
              ) : node ? (
                <>
                  {node.photos.length > 0 && (
                    <div className="mb-6">
                      <ImageCarousel photos={node.photos} onClose={handleClose} />
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="font-serif text-2xl font-bold text-text mb-3">
                      {node.title}
                    </h2>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="tag bg-primary/10 text-primary">{node.eraName}</span>
                      {node.location && (
                        <span className="text-sm text-text-light">{node.location}</span>
                      )}
                    </div>
                    <p className="text-text leading-relaxed whitespace-pre-line">
                      {node.description}
                    </p>
                  </div>

                  {node.historicalContext && (
                    <div className="mb-6">
                      <h3 className="font-serif font-semibold text-text mb-3">历史背景</h3>
                      <div className="border-t border-border pt-4">
                        <p className="text-text-light leading-relaxed whitespace-pre-line">
                          {node.historicalContext}
                        </p>
                      </div>
                    </div>
                  )}

                  {node.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-serif font-semibold text-text mb-3">相关标签</h3>
                      <div className="flex flex-wrap gap-2">
                        {node.tags.map((tag) => (
                          <span key={tag.id} className="tag bg-accent/10 text-accent">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-text-light">
                      <Eye className="w-5 h-5" />
                      <span>{node.viewCount.toLocaleString()} 浏览</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-light">
                      <Heart className="w-5 h-5" />
                      <span>0 点赞</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <p className="text-text-light">未找到该节点</p>
                  <button
                    onClick={handleClose}
                    className="mt-4 text-primary hover:underline"
                  >
                    关闭
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}