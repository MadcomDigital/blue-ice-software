import { useQuery } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.inventory)['handovers']['$get']>;

interface UseGetInventoryHandoversProps {
  limit?: number;
}

export const useGetInventoryHandovers = ({ limit = 10 }: UseGetInventoryHandoversProps = {}) => {
  return useQuery({
    queryKey: ['inventory-handovers', { limit }],
    queryFn: async () => {
      const response = await client.api.inventory.handovers.$get({
        query: { limit: limit.toString() },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory handovers');
      }

      const json = await response.json();
      return json.data;
    },
  });
};
