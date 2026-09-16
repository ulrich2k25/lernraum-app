import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';

const SESSION_DURATION_MINUTES = 120;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(dto: CheckInDto) {
    const roomToken = dto.roomToken?.trim();
    const clientId = dto.clientId?.trim();

    if (!roomToken) {
      throw new BadRequestException('Room-Token fehlt.');
    }

    if (!clientId) {
      throw new BadRequestException('Client-ID fehlt.');
    }

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
    );

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.lernraum.findUnique({
        where: {
          raumToken: roomToken,
        },
      });

      if (!room) {
        throw new NotFoundException('Ungültiger Raum-Token.');
      }

      await tx.$queryRaw`
        SELECT "id"
        FROM "Lernraum"
        WHERE "id" = ${room.id}
        FOR UPDATE
      `;

      if (room.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Dieser Lernraum ist derzeit nicht verfügbar.',
        );
      }

      const existingSession = await tx.session.findFirst({
        where: {
          clientId,
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
          },
        },
      });

      if (existingSession) {
        throw new ConflictException('Du hast bereits eine aktive Sitzung.');
      }

      const activeSessions = await tx.session.count({
        where: {
          lernraumId: room.id,
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
          },
        },
      });

      if (activeSessions >= room.kapazitaet) {
        throw new ConflictException(
          'In diesem Lernraum sind aktuell keine freien Plätze verfügbar.',
        );
      }

      const session = await tx.session.create({
        data: {
          clientId,
          lernraumId: room.id,
          status: 'ACTIVE',
          expiresAt,
        },
        select: {
          id: true,
          clientId: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          endedAt: true,

          lernraum: {
            select: {
              id: true,
              raumBezeichnung: true,
              gebaeude: true,
              etage: true,
              kapazitaet: true,
              status: true,
            },
          },
        },
      });

      return {
        message: 'Check-in erfolgreich.',
        session,
        freiePlaetze: room.kapazitaet - activeSessions - 1,
      };
    });
  }

  async findCurrent(clientId: string) {
    const normalizedClientId = clientId?.trim();

    if (!normalizedClientId) {
      throw new BadRequestException('Client-ID fehlt.');
    }

    return this.prisma.session.findFirst({
      where: {
        clientId: normalizedClientId,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        endedAt: true,

        lernraum: {
          select: {
            id: true,
            raumBezeichnung: true,
            gebaeude: true,
            etage: true,
            kapazitaet: true,
            status: true,
          },
        },
      },
    });
  }

  async checkOut(dto: CheckOutDto) {
    const clientId = dto.clientId?.trim();

    if (!clientId) {
      throw new BadRequestException('Client-ID fehlt.');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findFirst({
        where: {
          clientId,
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
          },
        },
        include: {
          lernraum: true,
        },
        orderBy: {
          startedAt: 'desc',
        },
      });

      if (!session) {
        throw new NotFoundException('Keine aktive Sitzung gefunden.');
      }

      const endedSession = await tx.session.update({
        where: {
          id: session.id,
        },
        data: {
          status: 'ENDED',
          endedAt: now,
        },
        select: {
          id: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          endedAt: true,

          lernraum: {
            select: {
              id: true,
              raumBezeichnung: true,
              gebaeude: true,
              etage: true,
              kapazitaet: true,
              status: true,
            },
          },
        },
      });

      const activeSessions = await tx.session.count({
        where: {
          lernraumId: session.lernraumId,
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
          },
        },
      });

      const freiePlaetze = Math.max(
        session.lernraum.kapazitaet - activeSessions,
        0,
      );

      return {
        message: 'Check-out erfolgreich.',
        session: endedSession,
        freiePlaetze,
      };
    });
  }
}
