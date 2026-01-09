import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

import type { RestockInput } from '../schema';

export const useRestock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RestockInput) => {
      const response = await client.api.inventory.restock.$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error('Failed to restock product');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Product restocked successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Failed to restock product');
      console.error(error);
    },
  });
};
