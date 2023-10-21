import { IsArray, IsNumberString, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetNotesForReviewDto extends PaginationDto {
    @IsArray()
    @IsOptional()
    @IsNumberString({ no_symbols: true }, { each: true })
    tagIds?: number[];
}