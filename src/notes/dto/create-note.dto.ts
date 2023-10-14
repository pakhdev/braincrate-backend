import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MaxLength, MinLength } from 'class-validator';

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

}
