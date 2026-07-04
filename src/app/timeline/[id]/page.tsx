import { Metadata, ResolvingMetadata } from 'next';
import TimelineDetailView from '@/components/timeline/TimelineDetailView';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  let title = '时间节点详情';
  let description = '毛泽东主席生平中的重要时间节点';

  try {
    const res = await fetch(`http://localhost:3000/api/v1/timeline/${id}`);
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