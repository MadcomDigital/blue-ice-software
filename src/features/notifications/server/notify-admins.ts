
import { UserRole } from '@prisma/client';
import { db } from '@/lib/db';
import { sendPushNotification } from '@/lib/firebase-admin';

export async function notifyAdmins(title: string, body: string, data?: Record<string, string>, excludeUserId?: string) {
  try {
    const admins = await db.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        isActive: true, // Only active admins
      },
      select: { id: true },
    });

    let adminIds = admins.map(a => a.id);

    if (excludeUserId) {
      adminIds = adminIds.filter(id => id !== excludeUserId);
    }

    if (adminIds.length > 0) {
      await sendPushNotification(adminIds, title, body, data);
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}
