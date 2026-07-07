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
      className="card group flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* ── 图片区域 ── */}
      {photoUrl && (
        <div className="relative aspect-[3/2] overflow-hidden bg-surface">
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* 年代标签 — 左上角叠加 */}
          <span
            className="
              absolute top-3 left-3
              inline-flex items-center rounded-full px-2.5 py-0.5
              text-xs font-medium
              bg-white/85 backdrop-blur-sm text-text
              shadow-sm
            "
          >
            {eraName}
          </span>

          {/* 浏览数 — 右上角叠加 */}
          <span
            className="
              absolute top-3 right-3
              inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
              text-xs font-medium
              bg-black/50 backdrop-blur-sm text-white/90
            "
          >
            <Eye className="w-3 h-3" />
            {viewCount.toLocaleString()}
          </span>
        </div>
      )}

      {/* ── 内容区域 ── */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        {/* 日期 */}
        <div className="flex items-center gap-1 text-xs text-text-light">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{date}</span>
        </div>

        {/* 标题 */}
        <h3 className="font-serif font-semibold text-text text-base leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* 地点（可选） */}
        {location && (
          <div className="flex items-center gap-1 text-xs text-text-light mt-auto pt-2.5 border-t border-border/50">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
