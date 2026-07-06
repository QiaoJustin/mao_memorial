'use client';

import { Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '@/stores/music-store';

export default function MusicPlayerButton() {
  const { togglePanel, isPlaying, currentSong, isPanelOpen } = useMusicStore();

  return (
    <AnimatePresence>
      {!isPanelOpen && (
        <motion.button
          onClick={togglePanel}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl hover:shadow-2xl"
          style={{ boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.5), 0 0 20px rgba(139, 0, 0, 0.4)' }}
          title={currentSong ? currentSong.title : '打开音乐播放器'}
        >
          <motion.div
            animate={
              isPlaying
                ? { rotate: 360 }
                : {
                    scale: [1, 1.15, 1],
                  }
            }
            transition={
              isPlaying
                ? { repeat: Infinity, duration: 4, ease: 'linear' }
                : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            }
            className="flex items-center justify-center"
          >
            <Music className="h-6 w-6 text-white" />
          </motion.div>

          {/* Tooltip */}
          <div className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            {currentSong ? currentSong.title : '打开音乐播放器'}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
