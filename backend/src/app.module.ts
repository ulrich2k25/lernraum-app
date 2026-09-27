import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { SessionsModule } from './sessions/sessions.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RoomsModule,
    SessionsModule,
    AdminAuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
