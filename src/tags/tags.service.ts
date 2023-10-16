import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Tag } from './entities/tag.entity';
import { GetSubtagsDto } from './dto/get-subtags.dto';
import { Note } from '../notes/entities/note.entity';
import { TagsResponseDto } from './dto/tags-response.dto';

@Injectable()
export class TagsService {

    constructor(
        @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    ) {}

    async incrementCountOrCreate(name: string, user: User): Promise<Tag> {
        const tag = await this.findByName(name, user);
        if (tag) {
            tag.notesCount++;
            return await this.tagsRepository.save(tag);
        }
        return await this.tagsRepository.save(
            this.tagsRepository.create({ name, notesCount: 1, user }),
        );
    }

    async decrementCountOrRemove(tag: Tag): Promise<Tag> {
        tag.notesCount--;
        if (tag.notesCount > 0) {
            return await this.tagsRepository.save(tag);
        }
        return await this.tagsRepository.remove(tag);
    }

    async findAll(getSubtagsDto: GetSubtagsDto, user: User): Promise<TagsResponseDto[]> {
        const { parentTagIds, title } = getSubtagsDto;
        const userId = user.id;

        if (!parentTagIds || parentTagIds.length === 0)
            return await this.tagsRepository.findBy({ user: { id: userId } });

        const subQuery = this.tagsRepository
            .createQueryBuilder('tag')
            .innerJoin('note_tags_tag', 'nt', 'tag.id = nt.tagId')
            .select('note.id')
            .from('note', 'note')
            .innerJoin('note_tags_tag', 'nt2', 'note.id = nt2.noteId')
            .where(`nt2.tagId IN (:...parentTagIds)`, { parentTagIds })
            .andWhere('note.user = :userId', { userId })
            .groupBy('note.id')
            .having('COUNT(DISTINCT nt2.tagId) = :count', { count: parentTagIds.length });

        if (title) {
            subQuery.andWhere('note.title LIKE :title', { title: `%${ title }%` });
        }

        return await this.filteredTagsQuery(subQuery);
    }

    async findTagsForReview(getSubtagsDto: GetSubtagsDto, user: User): Promise<TagsResponseDto[]> {
        const { parentTagIds } = getSubtagsDto;
        const userId = user.id;

        const subQuery = this.tagsRepository
            .createQueryBuilder('tag')
            .innerJoin('note_tags_tag', 'nt', 'tag.id = nt.tagId')
            .innerJoin('note_tags_tag', 'nt2', 'note.id = nt2.noteId')
            .select('note.id')
            .from('note', 'note')
            .where('note.user = :userId', { userId })
            .andWhere('note.nextReviewAt <= :currentDate', { currentDate: new Date() })
            .andWhere('note.reviewsLeft >= :minReviewsLeft', { minReviewsLeft: 1 })
            .groupBy('note.id');

        if (parentTagIds && parentTagIds.length > 0) {
            subQuery.andWhere(`nt2.tagId IN (:...tagIds)`, { tagIds: parentTagIds });
            subQuery.having('COUNT(DISTINCT nt2.tagId) = :count', {
                count: parentTagIds.length,
            });
        }

        return await this.filteredTagsQuery(subQuery);
    }

    async findByName(name: string, user: User): Promise<Tag> {
        return await this.tagsRepository.findOneBy({
            name,
            user: { id: user.id },
        });
    }

    async prepareTagsList(oldTags: Tag[], newTagNames: string[], user: User) {

        const resultTags: Tag[] = [];
        const touchedTags: { name: string, notesCount: number }[] = [];

        for (const newTagName of newTagNames) {
            const existingTag = oldTags.find(tag => tag.name === newTagName);
            if (existingTag) {
                resultTags.push(existingTag);
            } else {
                const newTag = await this.incrementCountOrCreate(newTagName, user);
                resultTags.push(newTag);
                touchedTags.push({ name: newTag.name, notesCount: newTag.notesCount });
            }
        }

        const tagsToRemove: Tag[] = oldTags.filter(tag => !newTagNames.includes(tag.name));
        for (const tag of tagsToRemove) {
            const decrementedTag = await this.decrementCountOrRemove(tag);
            touchedTags.push(
                { name: decrementedTag.name, notesCount: decrementedTag.notesCount },
            );
        }

        return { resultTags, touchedTags };
    }

    private async filteredTagsQuery(subQuery: SelectQueryBuilder<ObjectLiteral>): Promise<TagsResponseDto[]> {
        const query = this.tagsRepository
            .createQueryBuilder('tag')
            .addSelect(['tag.id', 'tag.name'])
            .innerJoin('note_tags_tag', 'nt', 'tag.id = nt.tagId')
            .where(`nt.noteId IN (${ subQuery.getQuery() })`)
            .setParameters(subQuery.getParameters())
            .distinct(true);

        const queryResult = await query.getRawMany();
        return queryResult.map(tag => ({
            id: tag.tag_id,
            name: tag.tag_name,
            notesCount: tag.tag_notesCount,
        }));
    }

}
