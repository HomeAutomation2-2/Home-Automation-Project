import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Activează validarea automată pentru toate endpoint-urile
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  await app.listen(3000);
}
bootstrap();