import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { PushNotificationsModule } from '../push-notifications/push-notifications.module';
import { ClientDataService } from './client-data.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [PrismaModule, PushNotificationsModule],
  controllers: [SessionsController],
  providers: [SessionsService, ClientDataService],
})
export class SessionsModule {}
