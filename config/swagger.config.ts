import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('BrainCrate')
    .setDescription('Backend API')
    .setVersion('1.0.0')
    .build();