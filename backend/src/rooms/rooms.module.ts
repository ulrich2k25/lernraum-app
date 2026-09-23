import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminRoomsController } from './admin-rooms.controller';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [AdminAuthModule],
  providers: [RoomsService],
  controllers: [RoomsController, AdminRoomsController],
})
export class RoomsModule {}
