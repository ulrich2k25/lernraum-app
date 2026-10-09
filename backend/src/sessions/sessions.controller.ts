import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { ExtendSessionDto } from './dto/extend-session.dto';
import { ClientDataService } from './client-data.service';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly clientDataService: ClientDataService,
  ) {}

  @Post('identity')
  registerIdentity(@Body() dto: { clientId: string; secret: string }) {
    return this.clientDataService.register(dto.clientId, dto.secret);
  }

  @Post('delete-my-data')
  deleteMyData(@Body() dto: { clientId: string; secret: string }) {
    return this.clientDataService.deleteMyData(dto.clientId, dto.secret);
  }

  @Post('check-in')
  checkIn(@Body() dto: CheckInDto) {
    return this.sessionsService.checkIn(dto);
  }

  @Post('check-out')
  checkOut(@Body() dto: CheckOutDto) {
    return this.sessionsService.checkOut(dto);
  }

  @Post('extend')
  extendSession(@Body() dto: ExtendSessionDto) {
    return this.sessionsService.extendSession(dto);
  }

  @Get('current/:clientId')
  findCurrent(@Param('clientId') clientId: string) {
    return this.sessionsService.findCurrent(clientId);
  }

  @Get('history/:clientId')
  findHistory(@Param('clientId') clientId: string) {
    return this.sessionsService.findHistory(clientId);
  }
}
