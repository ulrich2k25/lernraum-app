import { Body, Controller, Post } from '@nestjs/common';

import { CheckInDto } from './dto/check-in.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('check-in')
  checkIn(@Body() dto: CheckInDto) {
    return this.sessionsService.checkIn(dto);
  }
}
