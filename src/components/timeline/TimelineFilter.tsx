'use client';

import { useTimelineStore } from '@/stores/timeline-store';

interface Era {
  id: number;
  name: string;
}

interface TimelineFilterProps {
  eras: Era[];
}

export default function TimelineFilter({ eras }: TimelineFilterProps) {
  const { selectedEra, setSelectedEra } = useTimelineStore();

  const handleEraClick = (eraName: string | null) => {
    setSelectedEra(eraName);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide pb-2">
      <div className="flex gap-2 min-w-max">
        <button
          onClick={() => handleEraClick(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedEra
              ? 'bg-accent text-white'
              : 'bg-surface text-text-light hover:bg-primary/10 hover:text-primary'
          }`}
        >
          全部
        </button>
        {eras.map((era) => (
          <button
            key={era.id}
            onClick={() => handleEraClick(era.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedEra === era.name
                ? 'bg-accent text-white'
                : 'bg-surface text-text-light hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {era.name}
          </button>
        ))}
      </div>
    </div>
  );
}