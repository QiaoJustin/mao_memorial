'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/use-in-view';
import { useUIStore } from '@/stores/ui-store';
import { Eye, MapPin } from 'lucide-react';

interface TimelineNodeProps {
  index: number;
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  viewCount: number;
  eraName: string;
  photoUrl?: string;
}

export default function TimelineNodeComponent({
  index,
  id,
  title,
  description,
  date,
  location,
  viewCount,
  eraName,
  photoUrl,
}: TimelineNodeProps) {
  const setSelectedNodeId = useUIStore((state) => state.setSelectedNodeId);
  const [ref, isInView] = useInView<HTMLDivElement>({ once: true });

  const isLeft = index % 2 === 0;

  const handleClick = () => {
    setSelectedNodeId(id);
  };

  return (
    <div
      ref={ref}
      className={`flex items-start gap-4 md:gap-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'} md:flex-row`}
    >
      <motion.div
        className="flex-1 w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          onClick={handleClick}
          className="card p-4 md:p-6 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
            <span className="tag bg-primary/10 text-primary text-xs md:text-sm">{eraName}</span>
            <span className="text-accent font-serif font-bold text-base md:text-lg">{date}</span>
          </div>
          <h3 className="font-serif text-lg md:text-xl font-semibold text-text mb-2 md:mb-3 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-text-light text-sm line-clamp-3 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
            {location && (
              <span className="text-xs text-text-light flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
            <span className="text-xs text-text-light flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="hidden md:flex flex-col items-center">
        <motion.div
          className="w-4 h-4 rounded-full bg-accent glow-gold"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
        <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent min-h-[100px]" />
      </div>

      <motion.div
        className="hidden md:block w-48 h-32 flex-shrink-0"
        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -30 : 30 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        {photoUrl ? (
          <div
            onClick={handleClick}
            className="w-full h-full rounded-lg overflow-hidden cursor-pointer group"
          >
            <img
              src={photoUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-lg bg-surface flex items-center justify-center">
            <span className="text-text-light text-sm">暂无照片</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}