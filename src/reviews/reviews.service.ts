import { Injectable } from '@nestjs/common';
import { Difficulty } from './enums/difficulty.enum';

@Injectable()
export class ReviewsService {

    private readonly easyReviewSchedule: number[] = [1, 4, 7, 21];
    private readonly mediumReviewSchedule: number[] = [1, 3, 7, 21, 60];
    private readonly hardReviewSchedule: number[] = [1, 3, 7, 21, 60, 90, 182];

    public getNextReviewDate(difficulty: Difficulty, reviewsLeft: number): Date {

        const oneDay = 24 * 60 * 60 * 1000;
        let schedule: number[] | undefined;

        if (difficulty === Difficulty.Easy) {
            schedule = this.easyReviewSchedule;
        } else if (difficulty === Difficulty.Medium) {
            schedule = this.mediumReviewSchedule;
        } else if (difficulty === Difficulty.Hard) {
            schedule = this.hardReviewSchedule;
        } else {
            return new Date();
        }

        if (schedule && reviewsLeft >= 0 && reviewsLeft <= schedule.length) {
            const daysToAdd = schedule[schedule.length - reviewsLeft];
            return new Date(Date.now() + (daysToAdd * oneDay));
        } else {
            return new Date();
        }
    }

    public getNumberOfReviewsForDifficulty(difficulty: Difficulty): number {
        switch (difficulty) {
            case Difficulty.Easy:
                return this.easyReviewSchedule.length;
            case Difficulty.Medium:
                return this.mediumReviewSchedule.length;
            case Difficulty.Hard:
                return this.hardReviewSchedule.length;
            default:
                return 0;
        }
    }
}
