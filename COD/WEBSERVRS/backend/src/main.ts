import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';



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
    
    await app.listen(3000);
}
bootstrap();