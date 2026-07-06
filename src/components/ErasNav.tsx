import Link from 'next/link';

interface Era {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

interface ErasNavProps {
  eras: Era[];
  currentEra?: string;
  variant?: 'horizontal' | 'vertical';
  baseUrl?: string;
}

export default function ErasNav({ eras, currentEra, variant = 'horizontal', baseUrl = '/timeline' }: ErasNavProps) {
  if (variant === 'vertical') {
    return (
      <nav className="space-y-1">
        <h3 className="font-serif font-semibold text-text mb-3">年代分类</h3>
        <Link
          href={baseUrl}
          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
            !currentEra ? 'bg-primary text-white' : 'text-text-light hover:bg-surface'
          }`}
        >
          全部
        </Link>
        {eras.map((era) => (
          <Link
            key={era.id}
            href={`${baseUrl}?era=${encodeURIComponent(era.name)}`}
            className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
              currentEra === era.name
                ? 'bg-primary text-white'
                : 'text-text-light hover:bg-surface'
            }`}
          >
            {era.name}
            <span className="ml-2 text-xs opacity-60">({era.startYear}-{era.endYear})</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2 min-w-max">
        <Link
          href={baseUrl}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !currentEra
              ? 'bg-primary text-white'
              : 'bg-surface text-text-light hover:bg-primary/10 hover:text-primary'
          }`}
        >
          全部
        </Link>
        {eras.map((era) => (
          <Link
            key={era.id}
            href={`${baseUrl}?era=${encodeURIComponent(era.name)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              currentEra === era.name
                ? 'bg-primary text-white'
                : 'bg-surface text-text-light hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {era.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}