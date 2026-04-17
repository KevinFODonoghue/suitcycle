import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AuditInput = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  meta?: Record<string, unknown>;
};

export async function recordAudit({
  actorUserId,
  action,
  entityType,
  entityId,
  meta = {},
}: AuditInput) {
  await prisma.audit.create({
    data: {
      actorUserId,
      action,
      entityType,
      entityId,
      meta: meta as unknown as Prisma.InputJsonValue,
    },
  });
}
