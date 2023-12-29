import { ApiProperty } from '@nestjs/swagger';

import { Note } from '../entities/note.entity';
import { Tag } from '../../tags/entities/tag.entity';

export class NoteOperationResponseDto {

    @ApiProperty({ description: 'Mensaje de error o null si no hay errores', example: 'Nota no encontrada' })
    errors: string | null;

    @ApiProperty({ description: 'Datos de la nota o null en caso de error', type: Note })
    note: Note | null;

    @ApiProperty({ description: 'Lista de etiquetas afectadas', type: [Tag] })
    tags: Tag[] | null;
}