
import { UserRole } from '@prisma/client';
import { db } from '@/lib/db';
import { sendPushNotification } from '@/lib/firebase-admin';

export async function notifyAdmins(title: string, body: string, data?: Record<string, string>) {
  try {
    const admins = await db.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        isActive: true, // Only active admins
      },
      select: { id: true },
    });

    const adminIds = admins.map(a => a.id);

    if (adminIds.length > 0) {
      await sendPushNotification(adminIds, title, body, data);
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}
