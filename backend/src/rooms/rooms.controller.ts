import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('by-token/:roomToken')
  findByToken(@Param('roomToken') roomToken: string) {
    return this.roomsService.findByToken(roomToken);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }
}
