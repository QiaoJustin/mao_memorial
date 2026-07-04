import Link from 'next/link';

interface PhotoCardProps {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
  timelineNodeId?: number;
  timelineNodeTitle?: string;
}

export default function PhotoCard({
  id,
  url,
  thumbnailUrl,
  caption,
  timelineNodeId,
}: PhotoCardProps) {
  const linkHref = timelineNodeId ? `/timeline/${timelineNodeId}` : `/photos/${id}`;

  return (
    <Link
      href={linkHref}
      className="group relative rounded-lg overflow-hidden aspect-square bg-surface hover:shadow-lg transition-all duration-300"
    >
      <img
        src={thumbnailUrl || url}
        alt={caption}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-sm font-medium line-clamp-2">{caption}</p>
      </div>
    </Link>
  );
}