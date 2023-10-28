import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsNumberString, IsString, MinLength } from 'class-validator';
import { Difficulty } from '../../reviews/enums/difficulty.enum';

export class CreateNoteDto {

    @IsString()
    @MinLength(2)
    title: string;

    @IsString()
    content: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(13)
    @IsString({ each: true })
    @MinLength(2, { each: true })
    tags: string[];

    @IsNumberString()
    difficulty: Difficulty;

    @IsBoolean()
    removeAfterReviews: boolean;

}
