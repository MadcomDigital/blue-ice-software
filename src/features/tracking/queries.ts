import { Prisma } from '@prisma/client';

import { db } from '@/lib/db';

/**
 * Update driver's current location (optimized - no history writes)
 * Only updates the current position in driver profile
 * Real-time data is handled by Redis cache and Socket.IO
 */
export async function updateDriverLocation(data: {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  isMoving?: boolean;
  batteryLevel?: number;
}) {
  const { driverId, latitude, longitude } = data;

  // Check if location actually changed to avoid unnecessary DB writes
  const driver = await db.driverProfile.findUnique({
    where: { id: driverId },
    select: { currentLat: true, currentLng: true, lastLocationUpdate: true },
  });

  // Only update if location changed significantly (>= 10 meters) or if it's been >30 seconds
  const now = new Date();
  const shouldUpdate =
    !driver ||
    !driver.currentLat ||
    !driver.currentLng ||
    calculateDistance(driver.currentLat, driver.currentLng, latitude, longitude) >= 0.01 || // 10 meters
    (driver.lastLocationUpdate && now.getTime() - driver.lastLocationUpdate.getTime() > 30000); // 30 seconds

  if (shouldUpdate) {
    await db.driverProfile.update({
      where: { id: driverId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        lastLocationUpdate: now,
      },
    });
  }

  return {
    success: true,
    updated: shouldUpdate,
    message: shouldUpdate ? 'Location updated' : 'Location unchanged, skipped DB write',
  };
}

/**
 * Get all active drivers with their current locations
 * Optimized: Uses Redis cache for movement/battery data instead of DB
 */
export async function getLiveDriverLocations() {
  const drivers = await db.driverProfile.findMany({
    where: {
      isOnDuty: true,
      currentLat: { not: null },
      currentLng: { not: null },
    },
    select: {
      id: true,
      currentLat: true,
      currentLng: true,
      lastLocationUpdate: true,
      isOnDuty: true,
      user: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          imageUrl: true,
        },
      },
      vehicleNo: true,
      // Get current active order if any
      orders: {
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS'],
          },
        },
        take: 1,
        orderBy: {
          scheduledDate: 'desc',
        },
        select: {
          id: true,
          readableId: true,
          status: true,
          customer: {
            select: {
              user: {
                select: {
                  name: true,
                  phoneNumber: true,
                },
              },
              address: true,
              geoLat: true,
              geoLng: true,
            },
          },
        },
      },
    },
  });

  // Get additional data from Redis cache (movement, battery, speed)
  const { getAllDriverLocations } = await import('@/lib/redis');
  const cachedLocations = await getAllDriverLocations();
  const cachedMap = new Map(cachedLocations.map((loc) => [loc.driverId, loc]));

  return drivers.map((driver) => {
    const cached = cachedMap.get(driver.id);
    return {
      driverId: driver.id,
      name: driver.user.name,
      phoneNumber: driver.user.phoneNumber,
      imageUrl: driver.user.imageUrl,
      vehicleNo: driver.vehicleNo,
      latitude: driver.currentLat!,
      longitude: driver.currentLng!,
      lastUpdate: driver.lastLocationUpdate,
      isOnDuty: driver.isOnDuty,
      // Get from Redis cache or default values
      isMoving: cached?.isMoving ?? false,
      batteryLevel: cached?.batteryLevel ?? null,
      speed: cached?.speed ?? null,
      currentOrder: driver.orders[0] || null,
    };
  });
}

/**
 * Get driver's route history for a specific date
 * NOTE: Disabled - no location history is being saved to optimize database performance
 * If you need historical route data in the future, consider:
 * 1. Saving waypoints only when orders are completed
 * 2. Using a time-series database like TimescaleDB
 * 3. Storing compressed daily summaries instead of raw GPS points
 */
export async function getDriverRouteHistory(driverId: string, date: Date) {
  // Return empty data since we're not storing location history
  return {
    locations: [],
    stats: {
      totalDistance: 0,
      averageSpeed: 0,
      stoppedDuration: 0,
      dataPoints: 0,
    },
    message: 'Route history feature disabled - no location history is being saved',
  };
}

/**
 * Toggle driver duty status
 */
export async function toggleDriverDutyStatus(driverId: string, isOnDuty: boolean) {
  return await db.driverProfile.update({
    where: { userId: driverId },
    data: { isOnDuty },
    select: {
      id: true,
      isOnDuty: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Clean up old location history (keep last 30 days)
 * NOTE: Disabled - no location history is being saved anymore
 */
export async function cleanupLocationHistory() {
  // No cleanup needed since we're not storing location history
  return 0;
}
