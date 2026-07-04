import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';

interface TimelineNode {
  id: number;
  title: string;
  description: string;
  date: string;
  dateSort: number;
  location?: string;
  viewCount: number;
  eraName: string;
  photoUrl?: string;
  isFeatured: boolean;
}

interface TimelineResponse {
  items: TimelineNode[];
  total: number;
  totalPages: number;
}

interface UseInfiniteTimelineOptions {
  era?: string;
  year?: number;
  pageSize?: number;
}

export function useInfiniteTimeline(options: UseInfiniteTimelineOptions = {}) {
  const { era, year, pageSize = 10 } = options;
  const [pages, setPages] = useState<TimelineNode[][]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getKey = (page: number) => {
    let key = `/api/v1/timeline?page=${page}&pageSize=${pageSize}`;
    if (era) key += `&era=${encodeURIComponent(era)}`;
    if (year) key += `&year=${year}`;
    return key;
  };

  const { data, error: swrError, isLoading } = useSWR<TimelineResponse>(
    getKey(1),
    async (url) => {
      const res = await fetch(url);
      const data = await res.json();
      return data.data || { list: [], total: 0, totalPages: 0 };
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    setPages([]);
  }, [era, year]);

  useEffect(() => {
    if (data && data.items && data.items.length > 0) {
      setPages([data.items]);
    }
  }, [data]);

  useEffect(() => {
    if (swrError) {
      setError(swrError);
    }
  }, [swrError]);

  const loadMore = useCallback(async () => {
    const currentPage = pages.length;
    if (isLoadingMore) return;

    const totalPages = data?.totalPages || 0;
    if (currentPage >= totalPages) return;

    setIsLoadingMore(true);

    try {
      const url = getKey(currentPage + 1);
      const res = await fetch(url);
      const response = await res.json();
      const newData: TimelineResponse = response.data || { items: [], total: 0, totalPages: 0 };

      setPages((prev) => [...prev, newData.items]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pages.length, data?.totalPages, isLoadingMore, getKey]);

  const nodes = pages.flat();
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const hasMore = pages.length < totalPages;

  return {
    nodes,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
    total,
    totalPages,
  };
}