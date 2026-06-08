import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';



async function bootstrap() 
{
    const app = await NestFactory.create(AppModule);
    
    // For usage with an external app, CORS needs to be disabled. 
    app.enableCors({
        origin: true,
        methods: '*',
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.listen(3000);
}


bootstrap();