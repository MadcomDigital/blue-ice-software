import { Prisma } from '@prisma/client';

import { db } from '@/lib/db';

export async function createRoute(data: { name: string; description?: string | null; defaultDriverId?: string | null }) {
  return await db.route.create({
    data,
  });
}

export async function getRoutes(params: { search?: string; page: number; limit: number }) {
  const { search, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.RouteWhereInput = search
    ? {
        OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }],
      }
    : {};

  const [routes, total] = await Promise.all([
    db.route.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
      include: {
        defaultDriver: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { customers: true },
        },
      },
    }),
    db.route.count({ where }),
  ]);

  return {
    routes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRoute(id: string) {
  return await db.route.findUnique({
    where: { id },
  });
}

export async function updateRoute(id: string, data: Partial<{ name: string; description: string | null; defaultDriverId: string | null }>) {
  return await db.route.update({
    where: { id },
    data,
  });
}

export async function deleteRoute(id: string) {
  return await db.route.delete({
    where: { id },
  });
}

// Calculate distance between two geo-coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Optimize customer sequence in a route using Nearest Neighbor algorithm
export async function optimizeRouteSequence(routeId: string, startLat?: number, startLng?: number) {
  // Fetch all customers in this route with geo-coordinates
  const customers = await db.customerProfile.findMany({
    where: {
      routeId,
      geoLat: { not: null },
      geoLng: { not: null },
    },
    select: {
      id: true,
      geoLat: true,
      geoLng: true,
      sequenceOrder: true,
      user: {
        select: { name: true },
      },
    },
  });

  if (customers.length === 0) {
    return { success: false, message: 'No customers with geo-coordinates found in this route' };
  }

  // Default starting point (Lahore city center if not provided)
  const baseLat = startLat ?? 31.5204;
  const baseLng = startLng ?? 74.3587;

  // Nearest Neighbor Algorithm
  const unvisited = [...customers];
  const optimizedOrder: { id: string; sequence: number }[] = [];
  let currentLat = baseLat;
  let currentLng = baseLng;
  let sequence = 1;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const customer = unvisited[i];
      const distance = calculateDistance(currentLat, currentLng, customer.geoLat!, customer.geoLng!);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited[nearestIndex];
    optimizedOrder.push({ id: nearest.id, sequence });
    currentLat = nearest.geoLat!;
    currentLng = nearest.geoLng!;
    unvisited.splice(nearestIndex, 1);
    sequence++;
  }

  // Update sequence orders in database
  await db.$transaction(
    optimizedOrder.map(({ id, sequence }) =>
      db.customerProfile.update({
        where: { id },
        data: { sequenceOrder: sequence },
      }),
    ),
  );

  return {
    success: true,
    message: `Successfully optimized sequence for ${optimizedOrder.length} customers`,
    optimizedCount: optimizedOrder.length,
  };
}

// Get route with default driver details
export async function getRouteWithDriver(id: string) {
  return await db.route.findUnique({
    where: { id },
    include: {
      defaultDriver: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      _count: {
        select: { customers: true },
      },
    },
  });
}
