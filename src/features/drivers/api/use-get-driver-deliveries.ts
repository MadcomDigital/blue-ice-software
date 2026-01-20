import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

interface UseGetDriverDeliveriesProps {
  driverId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useGetDriverDeliveries = ({ driverId, startDate, endDate, page = 1, limit = 10 }: UseGetDriverDeliveriesProps) => {
  return useQuery({
    queryKey: ['driver-deliveries', driverId, startDate, endDate, page, limit],
    queryFn: async () => {
      const response = await client.api.drivers[':id'].deliveries.$get({
        param: { id: driverId },
        query: {
          startDate: startDate ?? undefined,
          endDate: endDate ?? undefined,
          page: page.toString(),
          limit: limit.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver deliveries');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!driverId,
  });
};
