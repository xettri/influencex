import type { PrismaClient } from "@prisma/client";
import type { NotificationType } from "@influencex/shared";

export async function notify(
  prisma: PrismaClient,
  payload: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
  }
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        link: payload.link ?? null,
      },
    });
  } catch {
    // Notification creation is non-critical — never block the main response
  }
}
