import { Note } from '../entities/note.entity';

export class NoteOperationResponseDto {
    errors: string | null;
    note: Note | null;
    tags: { name: string, notesCount: number }[] | null;
}