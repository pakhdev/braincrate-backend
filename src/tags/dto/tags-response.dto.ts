import { ApiProperty } from '@nestjs/swagger';

export class TagsResponseDto {
    @ApiProperty({ description: 'Tag ID' })
    id: number;

    @ApiProperty({ description: 'Tag name' })
    name: string;

    @ApiProperty({ description: 'Number of notes with this tag' })
    notesCount: number;
}