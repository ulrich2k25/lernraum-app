import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rooms = await this.prisma.lernraum.findMany({
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
      },
      orderBy: {
        raumBezeichnung: 'asc',
      },
    });

    const now = new Date();

    return Promise.all(
      rooms.map(async (room) => {
        const aktiveSitzungen = await this.prisma.session.count({
          where: {
            lernraumId: room.id,
            status: 'ACTIVE',
            expiresAt: {
              gt: now,
            },
          },
        });

        return {
          ...room,
          freiePlaetze: Math.max(room.kapazitaet - aktiveSitzungen, 0),
        };
      }),
    );
  }

  async findOne(id: number) {
    const room = await this.prisma.lernraum.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
      },
    });

    if (!room) {
      throw new NotFoundException(
        `Lernraum mit ID ${id} wurde nicht gefunden.`,
      );
    }

    const aktiveSitzungen = await this.prisma.session.count({
      where: {
        lernraumId: room.id,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return {
      ...room,
      freiePlaetze: Math.max(room.kapazitaet - aktiveSitzungen, 0),
    };
  }

  createTestRoom() {
    return this.prisma.lernraum.create({
      data: {
        raumBezeichnung: 'A101',
        gebaeude: 'Gebäude A',
        etage: '1',
        kapazitaet: 30,
        raumToken: 'raum-a101',
        status: 'ACTIVE',
      },
    });
  }
}
