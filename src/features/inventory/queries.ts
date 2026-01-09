import { db } from '@/lib/db';

/**
 * Get inventory statistics including bottles with customers
 */
export async function getInventoryStats() {
  // Get all products with their stock levels
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      stockFilled: true,
      stockEmpty: true,
      stockDamaged: true,
      isReturnable: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get bottles with customers (from CustomerBottleWallet)
  const bottlesWithCustomers = await db.customerBottleWallet.groupBy({
    by: ['productId'],
    _sum: {
      bottleBalance: true,
    },
  });

  // Create a map for easy lookup
  const bottlesWithCustomersMap = new Map(
    bottlesWithCustomers.map((item) => [item.productId, item._sum.bottleBalance || 0]),
  );

  // Calculate totals
  const totalFilled = products.reduce((sum, p) => sum + p.stockFilled, 0);
  const totalEmpty = products.reduce((sum, p) => sum + p.stockEmpty, 0);
  const totalDamaged = products.reduce((sum, p) => sum + p.stockDamaged, 0);
  const totalWithCustomers = Array.from(bottlesWithCustomersMap.values()).reduce((sum, val) => sum + val, 0);

  return {
    products: products.map((p) => ({
      ...p,
      bottlesWithCustomers: bottlesWithCustomersMap.get(p.id) || 0,
      totalBottles: p.stockFilled + p.stockEmpty + p.stockDamaged + (bottlesWithCustomersMap.get(p.id) || 0),
    })),
    totals: {
      filled: totalFilled,
      empty: totalEmpty,
      damaged: totalDamaged,
      withCustomers: totalWithCustomers,
      total: totalFilled + totalEmpty + totalDamaged + totalWithCustomers,
    },
  };
}

/**
 * Add filled bottles to inventory (restocking)
 */
export async function restockProduct(data: { productId: string; quantity: number; notes?: string }) {
  const product = await db.product.findUnique({
    where: { id: data.productId },
    select: { id: true, name: true, stockFilled: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return await db.product.update({
    where: { id: data.productId },
    data: {
      stockFilled: product.stockFilled + data.quantity,
    },
  });
}

/**
 * Record damage or loss (reduce stock)
 */
export async function recordDamageOrLoss(data: {
  productId: string;
  quantity: number;
  type: 'DAMAGE' | 'LOSS';
  reason: string;
  notes?: string;
}) {
  const product = await db.product.findUnique({
    where: { id: data.productId },
    select: { id: true, name: true, stockFilled: true, stockEmpty: true, stockDamaged: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if we have enough stock to record damage/loss
  if (product.stockFilled < data.quantity) {
    throw new Error('Insufficient filled stock');
  }

  // For DAMAGE: reduce stockFilled and increase stockDamaged
  // For LOSS: reduce stockFilled only (lost completely, not tracked in damaged)
  if (data.type === 'DAMAGE') {
    return await db.product.update({
      where: { id: data.productId },
      data: {
        stockFilled: product.stockFilled - data.quantity,
        stockDamaged: product.stockDamaged + data.quantity,
      },
    });
  } else {
    return await db.product.update({
      where: { id: data.productId },
      data: {
        stockFilled: product.stockFilled - data.quantity,
      },
    });
  }
}

/**
 * Manual stock adjustment (admin only)
 */
export async function adjustStock(data: {
  productId: string;
  stockFilled: number;
  stockEmpty: number;
  stockDamaged: number;
  reason: string;
  notes?: string;
}) {
  const product = await db.product.findUnique({
    where: { id: data.productId },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return await db.product.update({
    where: { id: data.productId },
    data: {
      stockFilled: data.stockFilled,
      stockEmpty: data.stockEmpty,
      stockDamaged: data.stockDamaged,
    },
  });
}

/**
 * Get bottles currently with customers for a specific product
 */
export async function getBottlesWithCustomers(productId?: string) {
  const where = productId ? { productId } : {};

  const wallets = await db.customerBottleWallet.findMany({
    where: {
      ...where,
      bottleBalance: {
        gt: 0,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },
      customer: {
        select: {
          id: true,
          user: {
            select: {
              name: true,
              phoneNumber: true,
            },
          },
          address: true,
        },
      },
    },
    orderBy: {
      bottleBalance: 'desc',
    },
  });

  return wallets.map((wallet) => ({
    customerId: wallet.customer.id,
    customerName: wallet.customer.user.name,
    customerPhone: wallet.customer.user.phoneNumber,
    customerAddress: wallet.customer.address,
    productId: wallet.product.id,
    productName: wallet.product.name,
    productSku: wallet.product.sku,
    bottleBalance: wallet.bottleBalance,
  }));
}
