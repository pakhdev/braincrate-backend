import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';
import { ImagesModule } from '../images/images.module';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Note]),
        TagsModule,
        ImagesModule,
        AuthModule,
        ReviewsModule,
    ],
    controllers: [NotesController],
    providers: [NotesService],
})
export class NotesModule {
}
