import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.api.expenses[':id'].$delete({
        param: { id },
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Expense deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      toast.error('Failed to delete expense');
      console.error(error);
    },
  });
};
