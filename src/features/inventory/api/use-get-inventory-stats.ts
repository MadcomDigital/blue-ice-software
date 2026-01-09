import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetInventoryStats = () => {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const response = await client.api.inventory.stats.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch inventory stats');
      }

      return await response.json();
    },
  });
};
