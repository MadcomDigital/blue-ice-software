import { z } from 'zod';

// Restock form schema (add filled bottles to inventory)
export const restockSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  notes: z.string().optional(),
});

export type RestockInput = z.infer<typeof restockSchema>;

// Damage/Loss form schema (reduce stock due to damage or loss)
export const damageSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  type: z.enum(['DAMAGE', 'LOSS'], { required_error: 'Type is required' }),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

export type DamageInput = z.infer<typeof damageSchema>;

// Stock adjustment schema (manual stock correction)
export const adjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  stockFilled: z.coerce.number().int().nonnegative('Stock filled cannot be negative'),
  stockEmpty: z.coerce.number().int().nonnegative('Stock empty cannot be negative'),
  stockDamaged: z.coerce.number().int().nonnegative('Stock damaged cannot be negative'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
