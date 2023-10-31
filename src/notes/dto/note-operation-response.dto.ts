import { Note } from '../entities/note.entity';
import { Tag } from '../../tags/entities/tag.entity';

export class NoteOperationResponseDto {
    errors: string | null;
    note: Note | null;
    tags: Tag[] | null;
}