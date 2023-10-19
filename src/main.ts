import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT;
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.use(json({ limit: '50mb' }));
    await app.listen(port, () => console.log(`Started at ${ port }`));
}

bootstrap();
