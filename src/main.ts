import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS pour le widget (origines à restreindre en production)
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Widget-Token'],
  });

  // Préfixe global de l'API — /health exclu pour le healthcheck Render/Docker
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Résa API démarrée sur http://localhost:${port}/api/v1`);
}

bootstrap();
