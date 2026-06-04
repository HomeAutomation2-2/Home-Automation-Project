import { config } from 'dotenv';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

config({ path: resolve(__dirname, '..', '.env') });

async function bootstrap() 
{
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
        origin: [
            'http://localhost:5173',      // dev browser
            'http://localhost',           // Capacitor Android
            'capacitor://localhost',      // Capacitor iOS
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    // Activează validarea automată pentru toate endpoint-urile
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, '0.0.0.0');
    console.log(`API: http://localhost:${port}`);
}
bootstrap();