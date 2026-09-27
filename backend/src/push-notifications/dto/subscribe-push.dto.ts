export class SubscribePushDto {
  clientId!: string;

  subscription!: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}
