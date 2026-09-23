import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RoomsModule,
    SessionsModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
