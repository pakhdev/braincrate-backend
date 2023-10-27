import { IsArray, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetSubtagsDto {
    @IsArray()
    @IsNumberString({ no_symbols: true }, { each: true })
    @IsOptional()
    parentTagIds?: number[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}