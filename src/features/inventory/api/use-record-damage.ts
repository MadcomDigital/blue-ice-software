import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

import type { DamageInput } from '../schema';

export const useRecordDamage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DamageInput) => {
      const response = await client.api.inventory.damage.$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error('Failed to record damage/loss');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Damage/loss recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Failed to record damage/loss');
      console.error(error);
    },
  });
};
