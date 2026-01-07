import { z } from 'zod';

export const createRouteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  defaultDriverId: z.string().uuid().optional().nullable(),
});

export const updateRouteSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().optional().nullable(),
  defaultDriverId: z.string().uuid().optional().nullable(),
});

export const getRoutesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const optimizeRouteSchema = z.object({
  startLat: z.coerce.number().optional(),
  startLng: z.coerce.number().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
export type OptimizeRouteInput = z.infer<typeof optimizeRouteSchema>;
