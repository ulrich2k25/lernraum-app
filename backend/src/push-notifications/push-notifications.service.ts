import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

import { PrismaService } from '../prisma/prisma.service';
import { SubscribePushDto } from './dto/subscribe-push.dto';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT');

    if (!publicKey || !privateKey || !subject) {
      throw new Error(
        'VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY und VAPID_SUBJECT müssen konfiguriert sein.',
      );
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  getPublicKey() {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');

    if (!publicKey) {
      throw new InternalServerErrorException(
        'Der öffentliche VAPID-Schlüssel ist nicht konfiguriert.',
      );
    }

    return {
      publicKey,
    };
  }

  async subscribe(dto: SubscribePushDto) {
    const clientId = dto.clientId?.trim();
    const endpoint = dto.subscription?.endpoint?.trim();
    const p256dh = dto.subscription?.keys?.p256dh?.trim();
    const auth = dto.subscription?.keys?.auth?.trim();

    if (!clientId) {
      throw new BadRequestException(
        'Die Client-ID konnte nicht eindeutig zugeordnet werden.',
      );
    }

    if (!endpoint || !p256dh || !auth) {
      throw new BadRequestException(
        'Die Push-Benachrichtigung konnte nicht registriert werden.',
      );
    }

    const pushSubscription = await this.prisma.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        clientId,
        p256dh,
        auth,
      },
      create: {
        clientId,
        endpoint,
        p256dh,
        auth,
      },
    });

    return {
      message: 'Push-Benachrichtigungen wurden erfolgreich aktiviert.',
      subscriptionId: pushSubscription.id,
    };
  }

  async sendSessionReminder(
    clientId: string,
    roomName: string,
    expiresAt: Date,
  ) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: {
        clientId,
      },
    });

    if (subscriptions.length === 0) {
      return {
        sent: 0,
        failed: 0,
      };
    }

    const endTime = new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
    }).format(expiresAt);

    const payload = JSON.stringify({
      title: 'Lernraum · Sitzung endet bald',
      body: `Deine Sitzung in Raum ${roomName} endet in 10 Minuten um ${endTime} Uhr.`,
      url: '/session',
    });

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );

        sent += 1;
      } catch (error) {
        failed += 1;

        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? Number(error.statusCode)
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await this.prisma.pushSubscription.delete({
            where: {
              id: subscription.id,
            },
          });

          this.logger.warn(
            `Ungültige Push-Subscription ${subscription.id} wurde entfernt.`,
          );

          continue;
        }

        this.logger.error(
          `Push-Benachrichtigung für Client ${clientId} fehlgeschlagen.`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return {
      sent,
      failed,
    };
  }
}
