import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNumber,
    IsString,
    MinLength,
} from 'class-validator';
import { Difficulty } from '../../reviews/enums/difficulty.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {

    @ApiProperty({ description: 'Título de la nota', minLength: 2 })
    @IsString()
    @MinLength(2)
    title: string;

    @ApiProperty({ description: 'Contenido de la nota' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'Lista de etiquetas de la nota',
        type: [String],
        minItems: 1,
        maxItems: 13,
        uniqueItems: true,
        minLength: 2,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(13)
    @IsString({ each: true })
    @MinLength(2, { each: true })
    tags: string[];

    @ApiProperty({ description: 'Esquema de repasos' })
    @IsNumber()
    difficulty: Difficulty;

    @ApiProperty({ description: 'Indica si la nota se eliminará al terminar todos los repasos' })
    @IsBoolean()
    removeAfterReviews: boolean;

}
