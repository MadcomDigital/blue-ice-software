import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

interface FinancialHistoryParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useDriverFinancialHistory = (params: FinancialHistoryParams = {}) => {
  return useQuery({
    queryKey: ['driver-financial-history', params],
    queryFn: async () => {
      const response = await client.api['cash-management'].driver['financial-history'].$get({
        query: {
          startDate: params.startDate,
          endDate: params.endDate,
          page: params.page?.toString(),
          limit: params.limit?.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financial history');
      }

      const data = await response.json();
      return data.data;
    },
  });
};
