import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3003',
    'http://192.168.178.28:3001',
  ];

  const frontendUrl = process.env.FRONTEND_URL?.trim();

  if (frontendUrl) {
    allowedOrigins.push(frontendUrl.replace(/\/$/, ''));
  }

  app.enableCors({
    origin: allowedOrigins,
  });

  await app.listen(process.env.PORT ?? 3002, '0.0.0.0');
}

bootstrap();
