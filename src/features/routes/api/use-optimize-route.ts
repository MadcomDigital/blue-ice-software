import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '@/lib/hono';

import { OptimizeRouteInput } from '../schema';

export const useOptimizeRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ param, json }: { param: { id: string }; json: OptimizeRouteInput }) => {
      const response = await client.api.routes[':id'].optimize.$post({
        param,
        json,
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || 'Failed to optimize route');
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Route sequence optimized successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.param.id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to optimize route', {
        description: error.message,
      });
    },
  });
};
