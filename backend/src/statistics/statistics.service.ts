import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TIME_ZONE = 'Europe/Berlin';

function berlinDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateFromDaysAgo(daysAgo: number): string {
  const today = berlinDate(new Date());
  const date = new Date(`${today}T12:00:00Z`);

  date.setUTCDate(date.getUTCDate() - daysAgo);

  return date.toISOString().slice(0, 10);
}

function berlinStartOfDay(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);

  const utcMidnight = Date.UTC(year, month - 1, day);

  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    timeZoneName: 'longOffset',
  });

  const parts = offsetFormatter.formatToParts(new Date(utcMidnight));

  const offset =
    parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';

  const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);

  if (!match) {
    return new Date(utcMidnight);
  }

  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);

  const offsetMinutes = sign * (hours * 60 + minutes);

  return new Date(utcMidnight - offsetMinutes * 60_000);
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(days: number) {
    const startDay = dateFromDaysAgo(days - 1);
    const tomorrow = dateFromDaysAgo(-1);

    const startDate = berlinStartOfDay(startDay);
    const endDate = berlinStartOfDay(tomorrow);

    const sessions = await this.prisma.session.findMany({
      where: {
        startedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        startedAt: true,
        endedAt: true,
        groupSize: true,
        lernraumId: true,
        lernraum: {
          select: {
            raumBezeichnung: true,
          },
        },
      },
    });

    const dailyMap = new Map<string, number>();

    for (let i = days - 1; i >= 0; i--) {
      dailyMap.set(dateFromDaysAgo(i), 0);
    }

    const roomMap = new Map<number, { room: string; count: number }>();

    let totalPeople = 0;
    let totalDurationMs = 0;
    let completedSessions = 0;

    for (const session of sessions) {
      const day = berlinDate(session.startedAt);

      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);

      totalPeople += session.groupSize;

      const existingRoom = roomMap.get(session.lernraumId);

      if (existingRoom) {
        existingRoom.count++;
      } else {
        roomMap.set(session.lernraumId, {
          room: session.lernraum.raumBezeichnung,
          count: 1,
        });
      }

      if (session.endedAt) {
        const duration =
          session.endedAt.getTime() - session.startedAt.getTime();

        if (duration >= 0) {
          totalDurationMs += duration;
          completedSessions++;
        }
      }
    }

    return {
      totalCheckIns: sessions.length,
      totalPeople,

      averageDurationMinutes:
        completedSessions > 0
          ? totalDurationMs / completedSessions / 60_000
          : null,

      dailyCheckIns: [...dailyMap.entries()].map(([date, count]) => ({
        date,
        count,
      })),

      roomUsage: [...roomMap.entries()]
        .map(([roomId, data]) => ({
          roomId,
          room: data.room,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count),
    };
  }
}
