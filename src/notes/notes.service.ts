import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, In, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateNoteDto, GetNotesDto, GetNotesForReviewDto, NoteOperationResponseDto, UpdateNoteDto } from './dto';
import { ImagesService } from '../images/images.service';
import { TagsService } from '../tags/tags.service';
import { Note } from './entities/note.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class NotesService {

    constructor(
        @InjectRepository(Note) private readonly notesRepository: Repository<Note>,
        private readonly tagsService: TagsService,
        private readonly imagesService: ImagesService,
    ) {}

    async create(createNoteDto: CreateNoteDto, user: User): Promise<NoteOperationResponseDto> {
        // TODO: add reviews options
        const reviewsLeft = 5;

        try {
            const {
                noteHtml,
                noteImages,
            } = await this.imagesService.processAndManageImagesInHTML(createNoteDto.content, null, user);
            const {
                resultTags,
                touchedTags,
            } = await this.tagsService.prepareTagsList([], createNoteDto.tags, user);
            const newNote = this.notesRepository.create({
                title: createNoteDto.title,
                content: noteHtml,
                reviewsLeft,
                tags: resultTags,
                images: noteImages,
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
        const { limit = 20, offset = 0, title, tagIds } = getNotesDto;
        const where: FindOptionsWhere<Note> = {
            user: { id: user.id },
            tags: tagIds ? In(tagIds) : undefined,
            title: title ? Like(`%${ title }%`) : undefined,
        };
        Object.keys(where).forEach(key => where[key] === undefined && delete where[key]);
        return await this.notesRepository.find({
            where, skip: offset, take: limit,
        });
    }

    async findAllForReview(user: User, getNotesForReviewDto: GetNotesForReviewDto): Promise<Note[]> {
        const { limit = 20, offset = 0, tagIds } = getNotesForReviewDto;
        const where: FindOptionsWhere<Note> = {
            user: { id: user.id },
            tags: tagIds ? In(tagIds) : undefined,
            nextReviewAt: LessThanOrEqual(new Date()),
            reviewsLeft: MoreThanOrEqual(1),
        };
        Object.keys(where).forEach(key => where[key] === undefined && delete where[key]);
        return await this.notesRepository.find({
            where, skip: offset, take: limit,
        });
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
            };

            const updatedNote = await this.notesRepository.save(note);
            await this.imagesService.clearOrphanedImages(previouslyUploadedIds, noteImages);
            return { errors: null, note: updatedNote, tags: touchedTags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    async remove(id: number, user: User): Promise<NoteOperationResponseDto> {
        try {

            let note = await this.findOneById(id, user);
            if (note.removedAt) return { errors: null, note: null, tags: null };

            const { touchedTags } = await this.tagsService.prepareTagsList(note.tags, [], user);
            const removedTags = note.tags.map((tag) => tag.name).join(',');
            note = { ...note, removedTags, removedAt: new Date() };
            await this.notesRepository.save(note);
            await this.imagesService.markForRemovingByNoteId(id, user);
            return { errors: null, note: null, tags: touchedTags };
        } catch (error) {
            return { errors: error.message, note: null, tags: null };
        }
    }

    async restore(id: number, user: User): Promise<NoteOperationResponseDto> {
        try {

            let note = await this.findOneById(id, user);
            if (!note.removedAt) return { errors: null, note: null, tags: null };

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

}
