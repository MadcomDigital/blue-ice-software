import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { sessionMiddleware } from '@/lib/session-middleware';

import { adjustStock, getBottlesWithCustomers, getInventoryStats, recordDamageOrLoss, refillBottles, restockProduct } from '../queries';
import { adjustmentSchema, damageSchema, refillSchema, restockSchema } from '../schema';

const app = new Hono()
  .get('/stats', sessionMiddleware, async (c) => {
    const stats = await getInventoryStats();
    return c.json(stats);
  })
  .get('/bottles-with-customers', sessionMiddleware, async (c) => {
    const productId = c.req.query('productId');
    const bottles = await getBottlesWithCustomers(productId);
    return c.json(bottles);
  })
  .post('/restock', sessionMiddleware, zValidator('json', restockSchema), async (c) => {
    const data = c.req.valid('json');
    const product = await restockProduct(data);
    return c.json({ success: true, product });
  })
  .post('/refill', sessionMiddleware, zValidator('json', refillSchema), async (c) => {
    const data = c.req.valid('json');
    const product = await refillBottles(data);
    return c.json({ success: true, product });
  })
  .post('/damage', sessionMiddleware, zValidator('json', damageSchema), async (c) => {
    const data = c.req.valid('json');
    const product = await recordDamageOrLoss(data);
    return c.json({ success: true, product });
  })
  .post('/adjust', sessionMiddleware, zValidator('json', adjustmentSchema), async (c) => {
    const data = c.req.valid('json');
    const product = await adjustStock(data);
    return c.json({ success: true, product });
  });

export default app;
