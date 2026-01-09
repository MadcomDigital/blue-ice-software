import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

import type { AdjustmentInput } from '../schema';

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdjustmentInput) => {
      const response = await client.api.inventory.adjust.$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error('Failed to adjust stock');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Stock adjusted successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Failed to adjust stock');
      console.error(error);
    },
  });
};
