'use client';

import dynamic from 'next/dynamic';

const MusicPlayer = dynamic(() => import('@/components/music/MusicPlayer'), { ssr: false });

export default function MusicPlayerWrapper() {
  return <MusicPlayer />;
}
