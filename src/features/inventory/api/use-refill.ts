import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

import type { RefillInput } from '../schema';

export const useRefill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RefillInput) => {
      const response = await client.api.inventory.refill.$post({
        json: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error('Failed to refill bottles');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Bottles refilled successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to refill bottles');
      console.error(error);
    },
  });
};
