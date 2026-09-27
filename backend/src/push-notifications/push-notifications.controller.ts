import { Body, Controller, Get, Post } from '@nestjs/common';

import { SubscribePushDto } from './dto/subscribe-push.dto';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @Get('public-key')
  getPublicKey() {
    return this.pushNotificationsService.getPublicKey();
  }

  @Post('subscribe')
  subscribe(@Body() dto: SubscribePushDto) {
    return this.pushNotificationsService.subscribe(dto);
  }
}
