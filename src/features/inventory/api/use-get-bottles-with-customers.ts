import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetBottlesWithCustomers = (productId?: string) => {
  return useQuery({
    queryKey: ['bottles-with-customers', productId],
    queryFn: async () => {
      const response = await client.api.inventory['bottles-with-customers'].$get({
        query: productId ? { productId } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bottles with customers');
      }

      return await response.json();
    },
  });
};
