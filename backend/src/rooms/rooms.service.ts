import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.lernraum.findMany();
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
