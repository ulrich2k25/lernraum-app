import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ExtendSessionDto } from './dto/extend-session.dto';

const SESSION_DURATION_MINUTES = 120;
const REMINDER_MINUTES_BEFORE_EXPIRY = 10;

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendSessionReminders() {
    const now = new Date();

    const reminderWindowEnd = new Date(
      now.getTime() + REMINDER_MINUTES_BEFORE_EXPIRY * 60 * 1000,
    );

    const sessions = await this.prisma.session.findMany({
      where: {
        status: 'ACTIVE',
        reminderSentAt: null,
        expiresAt: {
          gt: now,
          lte: reminderWindowEnd,
        },
      },
      include: {
        lernraum: true,
      },
    });

    for (const session of sessions) {
      const stillActiveSession = await this.prisma.session.findFirst({
        where: {
          id: session.id,
          status: 'ACTIVE',
          reminderSentAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          lernraum: true,
        },
      });

      if (!stillActiveSession) {
        continue;
      }

      const result = await this.pushNotificationsService.sendSessionReminder(
        stillActiveSession.clientId,
        stillActiveSession.lernraum.raumBezeichnung,
        stillActiveSession.expiresAt,
      );

      if (result.sent > 0) {
        await this.prisma.session.update({
          where: {
            id: stillActiveSession.id,
          },
          data: {
            reminderSentAt: new Date(),
          },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredSessions() {
    const now = new Date();

    const expiredSessions = await this.prisma.session.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: now,
        },
      },
      include: {
        lernraum: true,
      },
    });

    for (const session of expiredSessions) {
      await this.prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: {
            id: session.id,
          },
          data: {
            status: 'ENDED',
            endedAt: now,
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

        if (session.lernraum.autoCloseWhenEmpty && activeSessions === 0) {
          await tx.lernraum.update({
            where: {
              id: session.lernraumId,
            },
            data: {
              isTemporarilyClosed: true,
            },
          });
        }
      });
    }
  }

  async checkIn(dto: CheckInDto) {
    const roomToken = dto.roomToken?.trim();
    const clientId = dto.clientId?.trim();
    const roomId = dto.roomId;
    const groupSize = dto.groupSize ?? 1;

    if (!roomToken) {
      throw new BadRequestException('Ungültiger QR-Code.');
    }

    if (!Number.isInteger(roomId) || roomId <= 0) {
      throw new BadRequestException('Der ausgewählte Lernraum ist ungültig.');
    }

    if (!clientId) {
      throw new BadRequestException(
        'Die Sitzung konnte nicht eindeutig zugeordnet werden.',
      );
    }

    if (!Number.isInteger(groupSize) || groupSize < 1) {
      throw new BadRequestException('Ungültige Gruppengröße.');
    }

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
    );

    return this.prisma.$transaction(async (tx) => {
      const roomByToken = await tx.lernraum.findUnique({
        where: {
          raumToken: roomToken,
        },
      });

      if (!roomByToken) {
        throw new NotFoundException('Ungültiger QR-Code.');
      }

      if (roomByToken.id !== roomId) {
        throw new BadRequestException(
          'Der gescannte QR-Code gehört nicht zu diesem Lernraum.',
        );
      }

      await tx.$queryRaw`
      SELECT "id"
      FROM "Lernraum"
      WHERE "id" = ${roomId}
      FOR UPDATE
    `;

      const room = await tx.lernraum.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!room) {
        throw new NotFoundException('Der Lernraum wurde nicht gefunden.');
      }

      if (room.status !== 'ACTIVE') {
        throw new BadRequestException(
          'Dieser Lernraum ist derzeit nicht aktiv.',
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
        throw new ConflictException(
          'Du hast bereits eine aktive Sitzung. Bitte checke zuerst aus.',
        );
      }

      const occupancyResult = await tx.session.aggregate({
        where: {
          lernraumId: room.id,
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
          },
        },
        _sum: {
          groupSize: true,
        },
      });

      const belegtePlaetze = occupancyResult._sum.groupSize ?? 0;

      const freiePlaetze = Math.max(room.kapazitaet - belegtePlaetze, 0);

      if (freiePlaetze === 0) {
        throw new ConflictException('Dieser Lernraum ist bereits voll.');
      }

      if (groupSize > freiePlaetze) {
        throw new ConflictException(
          `Für diese Gruppe sind nicht genügend Plätze frei. Aktuell sind noch ${freiePlaetze} Plätze verfügbar.`,
        );
      }

      const session = await tx.session.create({
        data: {
          clientId,
          lernraumId: room.id,
          status: 'ACTIVE',
          expiresAt,
          groupSize,
        },
        select: {
          id: true,
          clientId: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          endedAt: true,
          groupSize: true,

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

      if (room.autoCloseWhenEmpty && room.isTemporarilyClosed) {
        await tx.lernraum.update({
          where: {
            id: room.id,
          },
          data: {
            isTemporarilyClosed: false,
          },
        });
      }

      return {
        message:
          groupSize >= 2
            ? `Gruppen-Check-in erfolgreich. ${groupSize} Personen sind jetzt in Raum ${room.raumBezeichnung} eingecheckt.`
            : `Check-in erfolgreich. Du bist jetzt in Raum ${room.raumBezeichnung} eingecheckt.`,
        session,
        freiePlaetze: freiePlaetze - groupSize,
      };
    });
  }

  async findCurrent(clientId: string) {
    const normalizedClientId = clientId?.trim();

    if (!normalizedClientId) {
      throw new BadRequestException(
        'Die Sitzung konnte nicht eindeutig zugeordnet werden.',
      );
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
        groupSize: true,

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

  async findHistory(clientId: string) {
    const normalizedClientId = clientId?.trim();

    if (!normalizedClientId) {
      throw new BadRequestException(
        'Die Sitzungen konnten nicht eindeutig zugeordnet werden.',
      );
    }

    return this.prisma.session.findMany({
      where: {
        clientId: normalizedClientId,
        status: 'ENDED',
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
        groupSize: true,

        lernraum: {
          select: {
            id: true,
            raumBezeichnung: true,
            gebaeude: true,
            etage: true,
          },
        },
      },
    });
  }

  async extendSession(dto: ExtendSessionDto) {
    const clientId = dto.clientId?.trim();

    if (!clientId) {
      throw new BadRequestException(
        'Die Sitzung konnte nicht eindeutig zugeordnet werden.',
      );
    }

    const now = new Date();

    const session = await this.prisma.session.findFirst({
      where: {
        clientId,
        status: 'ACTIVE',
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!session) {
      throw new NotFoundException('Keine aktive Sitzung gefunden.');
    }

    const newExpiresAt = new Date(
      session.expiresAt.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
    );

    const updatedSession = await this.prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: newExpiresAt,
        reminderSentAt: null,
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        endedAt: true,
        groupSize: true,

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
      message: 'Aufenthalt erfolgreich um 120 Minuten verlängert.',
      session: updatedSession,
    };
  }

  async checkOut(dto: CheckOutDto) {
    const clientId = dto.clientId?.trim();

    if (!clientId) {
      throw new BadRequestException(
        'Die Sitzung konnte nicht eindeutig zugeordnet werden.',
      );
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

      await tx.$queryRaw`
        SELECT "id"
        FROM "Lernraum"
        WHERE "id" = ${session.lernraumId}
        FOR UPDATE
      `;

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
          groupSize: true,

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

      if (session.lernraum.autoCloseWhenEmpty && activeSessions === 0) {
        await tx.lernraum.update({
          where: {
            id: session.lernraumId,
          },
          data: {
            isTemporarilyClosed: true,
          },
        });
      }

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
