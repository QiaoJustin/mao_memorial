import { Metadata, ResolvingMetadata } from 'next';
import TimelineDetailView from '@/components/timeline/TimelineDetailView';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }, _parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  let title = '时间节点详情';
  let description = '毛泽东主席生平中的重要时间节点';

  try {
    // P0-6: 使用环境变量，避免硬编码 localhost 导致生产环境 SEO 失效
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${siteUrl}/api/v1/timeline/${id}`);
    const data = await res.json();
    if (data.data) {
      title = data.data.title;
      description = data.data.description?.slice(0, 150) || description;
    }
  } catch {}

  return {
    title,
    description,
    openGraph: {
      title: `${title} - 毛主席生平纪念网站`,
      description,
    },
  };
}

export default async function TimelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  return <TimelineDetailView id={id} />;
}