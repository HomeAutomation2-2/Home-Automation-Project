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
    
    const port = Number(process.env.PORT ?? 3090);
    await app.listen(port, '127.0.0.1');
    console.log(`[API] Listening on http://127.0.0.1:${port}`);
}


bootstrap();