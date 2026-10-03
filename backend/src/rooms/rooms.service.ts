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

type UpdateRoomData = {
  raumBezeichnung?: string;
  gebaeude?: string;
  etage?: string;
  kapazitaet?: number;
  autoCloseWhenEmpty?: boolean;
};

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateRoomToken() {
    return randomBytes(32).toString('hex');
  }

  private async getRoomOccupancy(roomId: number, now = new Date()) {
    const sessions = await this.prisma.session.findMany({
      where: {
        lernraumId: roomId,
        status: 'ACTIVE',
        expiresAt: {
          gt: now,
        },
      },
      select: {
        groupSize: true,
      },
    });

    const belegtePlaetze = sessions.reduce(
      (sum, session) => sum + session.groupSize,
      0,
    );

    const aktiveGruppen = sessions.filter(
      (session) => session.groupSize >= 2,
    ).length;

    const personenInGruppen = sessions.reduce(
      (sum, session) =>
        session.groupSize >= 2 ? sum + session.groupSize : sum,
      0,
    );

    return {
      aktiveSitzungen: sessions.length,
      belegtePlaetze,
      aktiveGruppen,
      personenInGruppen,
    };
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
        const occupancy = await this.getRoomOccupancy(room.id, now);

        const freiePlaetze = Math.max(
          room.kapazitaet - occupancy.belegtePlaetze,
          0,
        );

        return {
          ...room,
          freiePlaetze,
          aktiveSitzungen: occupancy.aktiveSitzungen,
          aktiveGruppen: occupancy.aktiveGruppen,
          personenInGruppen: occupancy.personenInGruppen,
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

    const occupancy = await this.getRoomOccupancy(room.id);

    return {
      ...room,
      freiePlaetze: Math.max(room.kapazitaet - occupancy.belegtePlaetze, 0),
      aktiveSitzungen: occupancy.aktiveSitzungen,
      aktiveGruppen: occupancy.aktiveGruppen,
      personenInGruppen: occupancy.personenInGruppen,
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

    const occupancy = await this.getRoomOccupancy(room.id);

    return {
      ...room,
      freiePlaetze: Math.max(room.kapazitaet - occupancy.belegtePlaetze, 0),
      aktiveSitzungen: occupancy.aktiveSitzungen,
      aktiveGruppen: occupancy.aktiveGruppen,
      personenInGruppen: occupancy.personenInGruppen,
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
        const occupancy = await this.getRoomOccupancy(room.id, now);

        return {
          ...room,
          aktiveSitzungen: occupancy.aktiveSitzungen,
          belegtePlaetze: occupancy.belegtePlaetze,
          aktiveGruppen: occupancy.aktiveGruppen,
          personenInGruppen: occupancy.personenInGruppen,
          freiePlaetze: Math.max(room.kapazitaet - occupancy.belegtePlaetze, 0),
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

  async updateRoom(id: number, data: UpdateRoomData) {
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

    const raumBezeichnung =
      data.raumBezeichnung !== undefined
        ? data.raumBezeichnung.trim()
        : room.raumBezeichnung;

    const gebaeude =
      data.gebaeude !== undefined ? data.gebaeude.trim() : room.gebaeude;

    const etage = data.etage !== undefined ? data.etage.trim() : room.etage;

    const kapazitaet =
      data.kapazitaet !== undefined ? data.kapazitaet : room.kapazitaet;

    if (!raumBezeichnung || !gebaeude || !etage) {
      throw new BadRequestException(
        'Raumbezeichnung, Gebäude und Etage dürfen nicht leer sein.',
      );
    }

    if (!Number.isInteger(kapazitaet) || kapazitaet <= 0) {
      throw new BadRequestException('Die Kapazität muss größer als 0 sein.');
    }

    const occupancy = await this.getRoomOccupancy(id);

    if (kapazitaet < occupancy.belegtePlaetze) {
      throw new BadRequestException(
        `Die Kapazität darf nicht kleiner als die aktuelle Belegung (${occupancy.belegtePlaetze}) sein.`,
      );
    }

    const duplicateRoom = await this.prisma.lernraum.findFirst({
      where: {
        raumBezeichnung,
        gebaeude,
        id: {
          not: id,
        },
      },
    });

    if (duplicateRoom) {
      throw new ConflictException(
        `Lernraum ${raumBezeichnung} existiert bereits.`,
      );
    }

    const autoCloseWhenEmpty =
      data.autoCloseWhenEmpty ?? room.autoCloseWhenEmpty;

    const isTemporarilyClosed =
      autoCloseWhenEmpty && occupancy.aktiveSitzungen === 0;

    return this.prisma.lernraum.update({
      where: {
        id,
      },
      data: {
        raumBezeichnung,
        gebaeude,
        etage,
        kapazitaet,
        autoCloseWhenEmpty,
        isTemporarilyClosed,
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
