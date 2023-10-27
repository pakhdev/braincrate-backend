import { IsArray, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetNotesDto extends PaginationDto {
    @IsArray()
    @IsOptional()
    @IsNumberString({ no_symbols: true }, { each: true })
    tagIds?: number[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}