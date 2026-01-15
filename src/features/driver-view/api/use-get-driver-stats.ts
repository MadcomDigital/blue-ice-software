import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

const STATS_POLLING_INTERVAL = 30000; // 30 seconds

export const useGetDriverStats = () => {
  return useQuery({
    queryKey: ['driver-stats'],
    queryFn: async () => {
      const response = await client.api.drivers.me.stats.$get();
      if (!response.ok) throw new Error('Failed to fetch stats');
      const { data } = await response.json();
      return data;
    },
    refetchInterval: STATS_POLLING_INTERVAL,
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchOnWindowFocus: true,
  });
};
