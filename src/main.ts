import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import * as process from 'process';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.API_PORT;
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.use(json({ limit: process.env.MAX_JSON_PAYLOAD }));
    await app.listen(port, () => console.log(`Started at ${ port }`));
}

bootstrap();
