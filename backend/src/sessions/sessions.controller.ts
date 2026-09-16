import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('check-in')
  checkIn(@Body() dto: CheckInDto) {
    return this.sessionsService.checkIn(dto);
  }

  @Post('check-out')
  checkOut(@Body() dto: CheckOutDto) {
    return this.sessionsService.checkOut(dto);
  }

  @Get('current/:clientId')
  findCurrent(@Param('clientId') clientId: string) {
    return this.sessionsService.findCurrent(clientId);
  }
}
