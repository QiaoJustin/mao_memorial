'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye, MapPin, Calendar } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useNodeDetail } from '@/hooks/use-node-detail';
import { useAdjacentNodes } from '@/hooks/use-adjacent-nodes';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useKeyboard } from '@/hooks/use-keyboard';
import ImageCarousel from './ImageCarousel';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-5xl max-h-screen md:max-h-[85vh] bg-bg overflow-hidden flex flex-col md:rounded-2xl shadow-2xl border border-border/40"
            style={{
              backgroundImage: [
                'radial-gradient(circle at 1px 1px, rgba(139,0,0,0.035) 1px, transparent 0)',
                'linear-gradient(180deg, rgba(212,175,55,0.02) 0%, transparent 100%)',
              ].join(', '),
              backgroundSize: '24px 24px, 100% 100%',
            }}
          >
            {/* Decorative gold bar */}
            <div className="h-[3px] shrink-0 bg-gradient-to-r from-accent/30 via-accent to-accent/30" />

            {/* === Scrollable Content === */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <div className="p-8 md:p-10 space-y-6">
                  {/* Image skeleton */}
                  <div className="aspect-video bg-text-light/5 rounded-xl animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-text-light/10 rounded animate-pulse" />
                    <div className="h-10 w-3/4 bg-text-light/10 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-text-light/10 rounded animate-pulse" />
                    <div className="space-y-2 pt-4">
                      <div className="h-3 w-full bg-text-light/10 rounded animate-pulse" />
                      <div className="h-3 w-full bg-text-light/10 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-text-light/10 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : node ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="p-6 md:p-8 lg:p-10"
                >
                  {/* === Hero Image Area === */}
                  {node.photos.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="-mx-6 md:-mx-8 lg:-mx-10 mb-8 md:mb-10"
                    >
                      <ImageCarousel photos={node.photos} onClose={handleClose} />
                      {/* Decorative bottom line */}
                      <div className="mt-3 mx-6 md:mx-8 lg:mx-10 h-px bg-gradient-to-r from-accent/20 via-accent/10 to-transparent" />
                    </motion.div>
                  )}

                  {/* === Metadata Bar === */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center gap-3 mb-5"
                  >
                    {/* Era badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      {node.eraName}
                    </span>
                    {/* Date */}
                    <span className="flex items-center gap-1.5 text-xs text-text-light/70">
                      <Calendar className="w-3.5 h-3.5" />
                      {node.date}
                    </span>
                    {/* Location */}
                    {node.location && (
                      <span className="flex items-center gap-1.5 text-xs text-text-light/70">
                        <MapPin className="w-3.5 h-3.5" />
                        {node.location}
                      </span>
                    )}
                  </motion.div>

                  {/* === Title === */}
                  <motion.h2
                    variants={itemVariants}
                    className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-text leading-tight tracking-wide mb-6"
                  >
                    {node.title}
                  </motion.h2>

                  {/* === Decorative Divider === */}
                  <motion.div
                    variants={itemVariants}
                    className="w-16 h-[2px] bg-gradient-to-r from-accent/60 to-transparent mb-6"
                  />

                  {/* === Description === */}
                  <motion.div
                    variants={itemVariants}
                    className="prose prose-sm max-w-none text-text leading-[1.85] text-[15px] md:text-base whitespace-pre-line mb-8"
                  >
                    {node.description}
                  </motion.div>

                  {/* === Historical Context (blockquote style) === */}
                  {node.historicalContext && (
                    <motion.div
                      variants={itemVariants}
                      className="relative pl-5 md:pl-6 mb-8"
                    >
                      {/* Decorative left border */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary via-primary/70 to-primary/20 rounded-full" />
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent/40 via-accent/20 to-transparent rounded-full ml-[1px]" />
                      <h3 className="font-serif text-sm font-semibold text-primary/80 uppercase tracking-[0.15em] mb-3">
                        历史背景
                      </h3>
                      <p className="text-text-light leading-relaxed text-sm md:text-base whitespace-pre-line italic">
                        {node.historicalContext}
                      </p>
                    </motion.div>
                  )}

                  {/* === Tags (seal-stamp style) === */}
                  {node.tags.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="mb-8"
                    >
                      {/* Divider */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[11px] font-medium text-text-light/50 uppercase tracking-[0.15em]">标签</span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {node.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium
                              bg-accent/8 text-accent/90 border border-accent/20
                              hover:bg-accent/15 hover:border-accent/30 transition-colors cursor-default
                              tracking-wider"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* === Footer: Stats === */}
                  <motion.div
                    variants={itemVariants}
                    className="pt-5 border-t border-border/60"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-text-light/60 text-sm">
                        <Eye className="w-4 h-4" />
                        <span className="font-mono text-xs">{node.viewCount.toLocaleString()}</span>
                        <span className="text-xs text-text-light/40">浏览</span>
                      </div>
                      <div className="w-px h-4 bg-border/60" />
                      <div className="flex items-center gap-2 text-text-light/60 text-sm">
                        <span className="font-serif text-xs text-accent/70">{node.eraName}</span>
                        <span className="text-xs text-text-light/40">·</span>
                        <span className="font-mono text-xs text-text-light/40">{node.date}</span>
                      </div>
                    </div>
                    {/* Archival ref number */}
                    <div className="mt-3 text-[10px] text-text-light/25 font-mono tracking-[0.2em] select-none">
                      ARCHIVE · NODE-{String(node.id).padStart(4, '0')}
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <span className="text-2xl font-serif text-primary/40">?</span>
                  </div>
                  <p className="text-text-light/60 font-serif text-lg mb-2">未找到该节点</p>
                  <p className="text-text-light/40 text-sm mb-6">该时间节点可能已被移除或不存在</p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClose}
                    className="px-6 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
                  >
                    关闭
                  </motion.button>
                </div>
              )}
            </div>

            {/* === Bottom Navigation Bar === */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 shrink-0 border-t border-border/50">
              {prev && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handlePrev}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-light hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline font-medium">上一个</span>
                </motion.button>
              )}
              <span className="text-[11px] text-text-light/50 px-2 font-mono tracking-[0.15em] uppercase select-none">
                {node?.date || (isLoading ? '加载中...' : '')}
              </span>
              {next && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleNext}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-light hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  <span className="text-xs hidden sm:inline font-medium">下一个</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
              <div className="w-px h-5 bg-border/40 mx-1" />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-light/60 hover:text-text hover:bg-surface/80 transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
