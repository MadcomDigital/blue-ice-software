import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetDriverStats = (date?: string) => {
  return useQuery({
    queryKey: ['driver-stats', date],
    queryFn: async () => {
      // If date is provided, filter by that date (start and end of same day)
      // Note: The backend expects startDate/endDate for filtering
      const query = date ? { startDate: date, endDate: date } : {};

      const response = await client.api.drivers.me.stats.$get({ query });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const { data } = await response.json();
      return data;
    },
    refetchInterval: false,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};
