import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const username = dto.username?.trim();
    const password = dto.password;

    if (!username || !password) {
      throw new UnauthorizedException(
        'Benutzername und Passwort sind erforderlich.',
      );
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: {
        username,
      },
    });

    if (!admin) {
      throw new UnauthorizedException(
        'Ungültiger Benutzername oder ungültiges Passwort.',
      );
    }

    const passwordIsValid = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Ungültiger Benutzername oder ungültiges Passwort.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      username: admin.username,
      role: 'ADMIN',
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    };
  }
}
