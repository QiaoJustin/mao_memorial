import useSWR from 'swr';

interface AdjacentNode {
  id: number;
  title: string;
  date: string;
}

interface AdjacentResponse {
  prev: AdjacentNode | null;
  next: AdjacentNode | null;
}

export function useAdjacentNodes(id: number | null) {
  const { data, error, isLoading } = useSWR<AdjacentResponse>(
    id ? `/api/v1/timeline/${id}/adjacent` : null,
    async (url) => {
      const res = await fetch(url);
      const response = await res.json();
      return response.data || { prev: null, next: null };
    },
    { revalidateOnFocus: false }
  );

  return {
    prev: data?.prev || null,
    next: data?.next || null,
    isLoading,
    error,
  };
}