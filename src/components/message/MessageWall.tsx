'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageCardComponent from './MessageCard';

interface Message {
  id: number;
  content: string;
  nickname: string;
  createdAt: string;
  likeCount: number;
  isPinned?: boolean;
}

interface MessageWallProps {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  total: number;
}

export default function MessageWall({
  messages,
  isLoading,
  hasMore,
  loadMore,
  total,
}: MessageWallProps) {
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

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const regularMessages = messages.filter((m) => !m.isPinned);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-text-light">暂无留言，成为第一个留言的人吧</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold text-text">最新留言</h2>
        <span className="text-sm text-text-light">共 {total.toLocaleString()} 条</span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {pinnedMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageCardComponent {...message} />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {regularMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MessageCardComponent {...message} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div ref={observerRef} className="h-8" />
    </div>
  );
}