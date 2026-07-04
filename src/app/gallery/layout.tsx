import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '照片画廊',
  description: '浏览记录毛泽东主席生平的100多张珍贵历史照片，重温伟人风采',
  openGraph: {
    title: '照片画廊 - 毛主席生平纪念网站',
    description: '浏览记录毛泽东主席生平的100多张珍贵历史照片，重温伟人风采',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}