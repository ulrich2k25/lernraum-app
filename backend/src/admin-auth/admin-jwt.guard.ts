import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Admin-Authentifizierung erforderlich.');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Ungültiger Authorization-Header.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (payload.role !== 'ADMIN') {
        throw new UnauthorizedException('Keine Admin-Berechtigung.');
      }

      request['admin'] = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Ungültiger oder abgelaufener Admin-Token.',
      );
    }
  }
}
