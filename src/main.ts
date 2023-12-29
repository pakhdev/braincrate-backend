import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import * as process from 'process';
import { SwaggerModule } from '@nestjs/swagger';

import { swaggerConfig } from '../config/swagger.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.API_PORT;
    if (process.env.ENABLE_CORS.toLowerCase() === 'true')
        app.enableCors({
            origin: process.env.FRONTEND_URL,
            credentials: true,
        });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

    app.use(json({ limit: process.env.MAX_JSON_PAYLOAD }));
    await app.listen(port, () => console.log(`BrainCrate API. Puerto: ${ port }`));
}

bootstrap();
