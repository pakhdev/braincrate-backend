import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, In, IsNull, LessThanOrEqual, MoreThanOrEqual, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateNoteDto, GetNotesDto, GetNotesForReviewDto, NoteOperationResponseDto, UpdateNoteDto } from './dto';
import { ImagesService } from '../images/images.service';
import { ReviewsService } from '../reviews/reviews.service';
import { TagsService } from '../tags/tags.service';
import { Note } from './entities/note.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class NotesService {

    constructor(
        @InjectRepository(Note) private readonly notesRepository: Repository<Note>,
        private readonly tagsService: TagsService,
        private readonly imagesService: ImagesService,
        private readonly reviewsService: ReviewsService,
    ) {}

    async create(createNoteDto: CreateNoteDto, user: User): Promise<NoteOperationResponseDto> {

        const { title, content, difficulty, tags, removeAfterReviews } = createNoteDto;

        const reviewsLeft = this.reviewsService.getNumberOfReviewsForDifficulty(+difficulty);
        const nextReviewAt = reviewsLeft > 0
            ? this.reviewsService.getNextReviewDate(+difficulty, reviewsLeft)
            : null;

        try {
            const {
                noteHtml,
                noteImages,
            } = await this.imagesService.processAndManageImagesInHTML(content, null, user);
            const {
                resultTags,
                touchedTags,
            } = await this.tagsService.prepareTagsList([], tags, user);
            const newNote = this.notesRepository.create({
                title: title,
                content: noteHtml,
                reviewsLeft,
                nextReviewAt,
                tags: resultTags,
                images: noteImages,
                difficulty: +difficulty,
                removeAfterReviews,
                user,
            });
            const createdNote = await this.notesRepository.save(newNote);
            return { errors: null, note: createdNote, tags: touchedTags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    async findOneById(id: number, user: User): Promise<Note> {
        const note = await this.notesRepository.findOne({
            where: { id, user: { id: user.id } },
            relations: ['tags', 'images'],
        });
        if (!note) throw new NotFoundException('Nota no encontrada');
        return note;
    }

    async findAll(getNotesDto: GetNotesDto, user: User): Promise<Note[]> {
        const { limit = 20, offset = 0, searchTerm, tagIds } = getNotesDto;
        const where: FindOptionsWhere<Note> = {
            user: { id: user.id },
            removedAt: IsNull(),
            title: searchTerm
                ? Raw((_) => `(title LIKE :searchTerm OR content LIKE :searchTerm)`, { searchTerm: `%${ searchTerm }%` })
                : undefined,
        };
        return await this.getNotesQuery(tagIds, where, offset, limit);
    }

    async findAllForReview(user: User, getNotesForReviewDto: GetNotesForReviewDto): Promise<Note[]> {
        const { limit = 20, offset = 0, tagIds } = getNotesForReviewDto;
        const where: FindOptionsWhere<Note> = {
            user: { id: user.id },
            removedAt: IsNull(),
            nextReviewAt: LessThanOrEqual(new Date()),
            reviewsLeft: MoreThanOrEqual(1),
        };
        return await this.getNotesQuery(tagIds, where, offset, limit);
    }

    async countAllForReview(user: User): Promise<number> {
        const where: FindOptionsWhere<Note> = {
            user: { id: user.id },
            removedAt: IsNull(),
            nextReviewAt: LessThanOrEqual(new Date()),
            reviewsLeft: MoreThanOrEqual(1),
        };
        return await this.notesRepository.count({ where });
    }

    async update(id: number, updateNoteDto: UpdateNoteDto, user: User): Promise<NoteOperationResponseDto> {
        try {
            let note = await this.findOneById(id, user);
            const {
                noteHtml,
                noteImages,
                previouslyUploadedIds,
            } = await this.imagesService.processAndManageImagesInHTML(updateNoteDto.content, note, user);
            const {
                resultTags,
                touchedTags,
            } = await this.tagsService.prepareTagsList(note.tags, updateNoteDto.tags, user);

            note = {
                ...note,
                title: updateNoteDto.title,
                content: noteHtml,
                tags: resultTags,
                images: noteImages,
                updatedAt: new Date(),
                removeAfterReviews: updateNoteDto.removeAfterReviews,
            };

            const updatedNote = await this.notesRepository.save(note);
            await this.imagesService.clearOrphanedImages(previouslyUploadedIds, noteImages);
            return { errors: null, note: updatedNote, tags: touchedTags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    async updateNoteReviewStatus(id: number, user: User, action: string): Promise<NoteOperationResponseDto> {
        try {
            let note = await this.findOneById(id, user);
            const { difficulty } = note;
            let reviewsLeft = note.reviewsLeft;
            let nextReviewAt: null | Date;

            switch (action) {
                case 'markAsReviewed':
                    reviewsLeft = reviewsLeft > 0
                        ? reviewsLeft - 1
                        : 0;
                    nextReviewAt = reviewsLeft > 0
                        ? this.reviewsService.getNextReviewDate(difficulty, reviewsLeft)
                        : null;
                    break;
                case 'cancelReviews':
                    reviewsLeft = 0;
                    nextReviewAt = null;
                    break;
                case 'resetReviewsCount':
                    reviewsLeft = this.reviewsService.getNumberOfReviewsForDifficulty(difficulty);
                    nextReviewAt = note.nextReviewAt;
                    break;
                default:
                    return { errors: 'Invalid action', note: null, tags: null };
            }
            note = { ...note, reviewsLeft, nextReviewAt, reviewedAt: new Date() };
            const updatedNote = await this.notesRepository.save(note);
            const tags = await this.tagsService.findTagsWithoutNotesForReview(user, note.tags.map(tag => tag.id));

            return { errors: null, note: updatedNote, tags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    async remove(id: number, user: User): Promise<NoteOperationResponseDto> {
        try {

            let note = await this.findOneById(id, user);
            if (note.removedAt) return { errors: 'Nota no encontrada', note: null, tags: null };

            const { touchedTags } = await this.tagsService.prepareTagsList(note.tags, [], user);
            const removedTags = note.tags.map((tag) => tag.name).join(',');
            note = { ...note, removedTags, removedAt: new Date() };
            const savedNote = await this.notesRepository.save(note);
            await this.imagesService.markForRemovingByNoteId(id, user);
            return { errors: null, note: savedNote, tags: touchedTags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    async restore(id: number, user: User): Promise<NoteOperationResponseDto> {
        try {

            let note = await this.findOneById(id, user);
            if (!note.removedAt) return {
                errors: 'Nota no encontrada o no se encuentra eliminada',
                note: null,
                tags: null,
            };

            const removedTags = note.removedTags.split(',');
            const {
                resultTags,
                touchedTags,
            } = await this.tagsService.prepareTagsList([], removedTags, user);
            note = { ...note, removedTags: null, removedAt: null, tags: resultTags };
            await this.notesRepository.save(note);
            await this.imagesService.restoreByNoteId(id, user);
            return { errors: null, note: null, tags: touchedTags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    private async getNoteIdsByTags(tagIds: number[]): Promise<number[]> {
        const queryBuilder = this.notesRepository
            .createQueryBuilder('note')
            .select('note.id')
            .innerJoin('note_tags_tag', 'nt', 'note.id = nt.noteId')
            .where('nt.tagId IN (:...tagIds)', { tagIds })
            .groupBy('note.id')
            .having('COUNT(1) = :tagCount', { tagCount: tagIds.length });

        const results: { note_id: number }[] = await queryBuilder.getRawMany();

        return results.map(result => result.note_id);
    }

    private async getNotesQuery(tagIds: number[], where: FindOptionsWhere<Note>, offset: number, limit: number): Promise<Note[]> {
        if (tagIds) {
            const noteIds = await this.getNoteIdsByTags(tagIds);
            if (!noteIds.length) return [];
            where.id = In(noteIds);
        }
        Object.keys(where).forEach(key => where[key] === undefined && delete where[key]);
        return await this.notesRepository.find({
            select: ['id', 'title', 'content', 'difficulty', 'createdAt', 'updatedAt', 'reviewedAt', 'reviewsLeft', 'nextReviewAt', 'removeAfterReviews', 'removedAt'],
            where, skip: offset, take: limit,
            order: { id: 'DESC' },
            relations: ['tags'],
        });
    }
}
