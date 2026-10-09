import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientDataService {
  constructor(private readonly prisma: PrismaService) {}

  private hashSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }

  private validate(clientId: string, secret: string) {
    if (
      !clientId ||
      !/^[0-9a-f-]{36}$/i.test(clientId) ||
      !secret ||
      !/^[0-9a-f-]{36}$/i.test(secret)
    ) {
      throw new BadRequestException('Ungültige Identitätsdaten.');
    }
  }

  async register(clientId: string, secret: string) {
    this.validate(clientId, secret);

    const secretHash = this.hashSecret(secret);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.clientIdentity.findUnique({
        where: { clientId },
      });

      if (existing) {
        const valid = timingSafeEqual(
          Buffer.from(existing.secretHash, 'hex'),
          Buffer.from(secretHash, 'hex'),
        );

        if (!valid) {
          throw new ForbiddenException('Ungültiger Zugriff.');
        }

        return { registered: true };
      }

      const [sessions, subscriptions] = await Promise.all([
        tx.session.count({ where: { clientId } }),
        tx.pushSubscription.count({ where: { clientId } }),
      ]);

      if (sessions > 0 || subscriptions > 0) {
        throw new ConflictException(
          'Bestehende Identität kann nicht automatisch übernommen werden.',
        );
      }

      await tx.clientIdentity.create({
        data: { clientId, secretHash },
      });

      return { registered: true };
    });
  }

  async deleteMyData(clientId: string, secret: string) {
    this.validate(clientId, secret);

    return this.prisma.$transaction(async (tx) => {
      const identity = await tx.clientIdentity.findUnique({
        where: { clientId },
      });

      if (!identity) {
        throw new ForbiddenException('Identität nicht registriert.');
      }

      const suppliedHash = this.hashSecret(secret);

      const valid = timingSafeEqual(
        Buffer.from(identity.secretHash, 'hex'),
        Buffer.from(suppliedHash, 'hex'),
      );

      if (!valid) {
        throw new ForbiddenException('Ungültiger Zugriff.');
      }

      const activeSessions = await tx.session.findMany({
        where: { clientId, status: 'ACTIVE' },
        select: { lernraumId: true },
      });

      const roomIds = [
        ...new Set(activeSessions.map((session) => session.lernraumId)),
      ].sort((a, b) => a - b);

      for (const roomId of roomIds) {
        await tx.$queryRaw`
          SELECT "id"
          FROM "Lernraum"
          WHERE "id" = ${roomId}
          FOR UPDATE
        `;
      }

      const deletedSessions = await tx.session.deleteMany({
        where: { clientId },
      });

      const deletedSubscriptions = await tx.pushSubscription.deleteMany({
        where: { clientId },
      });

      for (const roomId of roomIds) {
        const room = await tx.lernraum.findUnique({
          where: { id: roomId },
        });

        if (!room?.autoCloseWhenEmpty) continue;

        const remaining = await tx.session.count({
          where: {
            lernraumId: roomId,
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
          },
        });

        if (remaining === 0) {
          await tx.lernraum.update({
            where: { id: roomId },
            data: { isTemporarilyClosed: true },
          });
        }
      }

      await tx.clientIdentity.delete({
        where: { clientId },
      });

      return {
        success: true,
        deletedSessions: deletedSessions.count,
        deletedSubscriptions: deletedSubscriptions.count,
      };
    });
  }
}
