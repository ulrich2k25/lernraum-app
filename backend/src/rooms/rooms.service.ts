import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

type CreateRoomData = {
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  kapazitaet: number;
  autoCloseWhenEmpty?: boolean;
};

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateRoomToken() {
    return randomBytes(32).toString('hex');
  }

  async findAll() {
    const rooms = await this.prisma.lernraum.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
        isTemporarilyClosed: true,
      },
      orderBy: {
        raumBezeichnung: 'asc',
      },
    });

    const now = new Date();

    const roomsWithAvailability = await Promise.all(
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

        const freiePlaetze = Math.max(room.kapazitaet - aktiveSitzungen, 0);

        return {
          ...room,
          freiePlaetze,
        };
      }),
    );

    return roomsWithAvailability.filter((room) => room.freiePlaetze > 0);
  }

  async findOne(id: number) {
    const room = await this.prisma.lernraum.findFirst({
      where: {
        id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
        isTemporarilyClosed: true,
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

  async findByToken(roomToken: string) {
    const normalizedRoomToken = roomToken?.trim();

    if (!normalizedRoomToken) {
      throw new BadRequestException('Ungültiger QR-Code.');
    }

    const room = await this.prisma.lernraum.findFirst({
      where: {
        raumToken: normalizedRoomToken,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
        isTemporarilyClosed: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Ungültiger QR-Code.');
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

  async findAllForAdmin() {
    const rooms = await this.prisma.lernraum.findMany({
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
        raumToken: true,
        autoCloseWhenEmpty: true,
        isTemporarilyClosed: true,
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
          aktiveSitzungen,
          freiePlaetze: Math.max(room.kapazitaet - aktiveSitzungen, 0),
        };
      }),
    );
  }

  async createRoom(data: CreateRoomData) {
    const raumBezeichnung = data.raumBezeichnung?.trim();
    const gebaeude = data.gebaeude?.trim();
    const etage = data.etage?.trim();

    if (!raumBezeichnung || !gebaeude || !etage) {
      throw new BadRequestException(
        'Raumbezeichnung, Gebäude und Etage sind erforderlich.',
      );
    }

    if (!Number.isInteger(data.kapazitaet) || data.kapazitaet <= 0) {
      throw new BadRequestException('Die Kapazität muss größer als 0 sein.');
    }

    const existingRoom = await this.prisma.lernraum.findFirst({
      where: {
        raumBezeichnung,
        gebaeude,
      },
    });

    if (existingRoom) {
      throw new ConflictException(
        `Lernraum ${raumBezeichnung} existiert bereits.`,
      );
    }

    const autoCloseWhenEmpty = data.autoCloseWhenEmpty ?? false;

    const raumToken = this.generateRoomToken();

    return this.prisma.lernraum.create({
      data: {
        raumBezeichnung,
        gebaeude,
        etage,
        kapazitaet: data.kapazitaet,
        raumToken,
        status: 'ACTIVE',
        autoCloseWhenEmpty,
        isTemporarilyClosed: autoCloseWhenEmpty,
      },
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
        raumToken: true,
        autoCloseWhenEmpty: true,
        isTemporarilyClosed: true,
      },
    });
  }

  async updateStatus(id: number, status: 'ACTIVE' | 'INACTIVE') {
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      throw new BadRequestException('Ungültiger Raumstatus.');
    }

    const room = await this.prisma.lernraum.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      throw new NotFoundException(
        `Lernraum mit ID ${id} wurde nicht gefunden.`,
      );
    }

    return this.prisma.lernraum.update({
      where: {
        id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        raumBezeichnung: true,
        gebaeude: true,
        etage: true,
        kapazitaet: true,
        status: true,
        raumToken: true,
        autoCloseWhenEmpty: true,
        isTemporarilyClosed: true,
      },
    });
  }
}
