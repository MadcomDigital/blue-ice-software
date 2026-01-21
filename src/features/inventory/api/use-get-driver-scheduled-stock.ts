import { useQuery } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.inventory)['driver-scheduled-stock']['$get']>;

interface UseGetDriverScheduledStockProps {
  driverId: string;
  date: string;
  enabled?: boolean;
}

export const useGetDriverScheduledStock = ({ driverId, date, enabled }: UseGetDriverScheduledStockProps) => {
  return useQuery({
    queryKey: ['driver-scheduled-stock', { driverId, date }],
    queryFn: async () => {
      const response = await client.api.inventory['driver-scheduled-stock'].$get({
        query: { driverId, date },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheduled stock');
      }

      const json = await response.json();
      return json.data; // Returns { productId, quantity }[]
    },
    enabled: !!driverId && !!date && enabled,
  });
};
