import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { loadAppConfig } from './config/app-config';

config({ path: resolve(__dirname, '..', '.env') });

async function bootstrap(): Promise<void> {
  const appConfig = loadAppConfig();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const isAllowedOrigin =
        !origin ||
        origin === 'capacitor://localhost' ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1');

      callback(null, isAllowedOrigin);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id', 'X-Device-Token'],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(appConfig.port, '0.0.0.0');
  console.log(`BackendV2 API: http://localhost:${appConfig.port}`);
}

void bootstrap();
