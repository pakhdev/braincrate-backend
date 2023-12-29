import { IsArray, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSubtagsDto {

    @ApiProperty({
        isArray: true,
        type: Number,
        description: 'IDs de las etiquetas principales',
        required: false,
    })
    @IsArray()
    @IsNumberString({ no_symbols: true }, { each: true })
    @IsOptional()
    parentTagIds?: number[];

    @ApiProperty({
        type: String,
        description: 'Término de búsqueda',
        required: false,
    })
    @IsString()
    @IsOptional()
    searchTerm?: string;
}