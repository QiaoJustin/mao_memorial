import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索毛泽东主席生平中的时间节点、事件和珍贵照片',
  openGraph: {
    title: '搜索 - 毛主席生平纪念网站',
    description: '搜索毛泽东主席生平中的时间节点、事件和珍贵照片',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}