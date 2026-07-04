import Link from 'next/link';
import { Calendar, Eye, MapPin } from 'lucide-react';

interface TimelineCardProps {
  id: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  viewCount: number;
  eraName: string;
  photoUrl?: string;
}

export default function TimelineCard({
  id,
  title,
  description,
  date,
  location,
  viewCount,
  eraName,
  photoUrl,
}: TimelineCardProps) {
  return (
    <Link
      href={`/timeline/${id}`}
      className="card group flex flex-col md:flex-row gap-4 p-4 hover:shadow-lg transition-all"
    >
      {photoUrl && (
        <div className="w-full md:w-48 h-32 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="tag bg-primary/10 text-primary">{eraName}</span>
            <span className="text-xs text-text-light flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          </div>
          <h3 className="font-serif font-semibold text-text text-lg mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-light line-clamp-2">{description}</p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
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
    </Link>
  );
}