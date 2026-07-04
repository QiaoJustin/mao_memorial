import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '生平时间轴',
  description: '按时间顺序浏览毛泽东主席从1918年到1965年的98个重要时间节点和重大事件',
  openGraph: {
    title: '生平时间轴 - 毛主席生平纪念网站',
    description: '按时间顺序浏览毛泽东主席从1918年到1965年的98个重要时间节点和重大事件',
  },
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}