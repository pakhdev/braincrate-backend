import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Module({
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule {
}
