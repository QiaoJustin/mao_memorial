import type { Metadata } from 'next';
import { Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

/**
 * 字体配置
 * - Noto Serif SC：衬线字体，用于标题（庄重肃穆）
 * - Noto Sans SC：无衬线字体，用于正文（清晰易读）
 */
const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * 网站元数据（SEO）
 * 文档参考：docs/01 需求文档
 */
export const metadata: Metadata = {
  title: {
    default: '毛主席生平纪念网站',
    template: '%s | 毛主席生平纪念网站',
  },
  description:
    '以100张珍贵历史照片为核心载体，按时间顺序展示毛泽东主席从1918年到1965年的98个重要时间节点和重大事件，缅怀伟人波澜壮阔的一生。',
  keywords: ['毛泽东', '毛主席', '纪念', '历史照片', '时间轴', '红色文化', '革命历程'],
  authors: [{ name: '毛主席纪念网站' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '毛主席生平纪念网站',
    description: '100张珍贵照片，重温伟人波澜壮阔的一生',
    type: 'website',
    locale: 'zh_CN',
  },
};

/**
 * 根布局
 * - 设置字体变量
 * - 配置语言为中文
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerifSC.variable} ${notoSansSC.variable}`} data-scroll-behavior="smooth">
      <body className="font-sans">{children}</body>
    </html>
  );
}
