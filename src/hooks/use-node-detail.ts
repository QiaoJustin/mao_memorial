import useSWR from 'swr';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  caption: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Era {
  id: number;
  name: string;
}

export interface TimelineNodeDetail {
  id: number;
  title: string;
  description: string;
  historicalContext: string;
  date: string;
  location: string;
  viewCount: number;
  isFeatured: boolean;
  era: Era;
  photos: Photo[];
  tags: Tag[];
}

interface UseNodeDetailReturn {
  node: TimelineNodeDetail | null;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useNodeDetail(id: number | null): UseNodeDetailReturn {
  const { data, error, isLoading, mutate } = useSWR<TimelineNodeDetail>(
    id ? `/api/v1/timeline/${id}` : null,
    async (url) => {
      const res = await fetch(url);
      const response = await res.json();
      return response.data || null;
    },
    { revalidateOnFocus: false }
  );

  return {
    node: data ?? null,
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
}