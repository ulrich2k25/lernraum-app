import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminJwtGuard } from '../admin-auth/admin-jwt.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@UseGuards(AdminJwtGuard)
@Controller('admin/rooms')
export class AdminRoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAllForAdmin();
  }

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: 'ACTIVE' | 'INACTIVE' },
  ) {
    return this.roomsService.updateStatus(id, body.status);
  }
}
