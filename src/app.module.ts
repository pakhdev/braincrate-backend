import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from '../config/env.config';
import { JoiValidationSchema } from '../config/joi.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NotesModule } from './notes/notes.module';
import { TagsModule } from './tags/tags.module';
import { ImagesModule } from './images/images.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            validationSchema: JoiValidationSchema,
            envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: envConfig().mysqlHost,
            port: envConfig().mysqlPort,
            username: envConfig().mysqlUser,
            password: envConfig().mysqlPassword,
            database: envConfig().mysqlDbName,
            autoLoadEntities: true,
            synchronize: envConfig().mysqlSync,
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        NotesModule,
        TagsModule,
        ImagesModule,
        ReviewsModule,
    ],
})
export class AppModule {
}
