import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Tag } from './entities/tag.entity';
import { GetSubtagsDto } from './dto/get-subtags.dto';
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
        const { parentTagIds, searchTerm } = getSubtagsDto;
        const userId = user.id;

        if (!searchTerm && (!parentTagIds || parentTagIds.length === 0))
            return await this.tagsRepository.findBy({ user: { id: userId } });

        return await this.getTagsThroughNotes(parentTagIds, searchTerm, userId, 'all');
    }

    async findTagsForReview(getSubtagsDto: GetSubtagsDto, user: User): Promise<TagsResponseDto[]> {
        const { parentTagIds } = getSubtagsDto;
        const userId = user.id;
        return await this.getTagsThroughNotes(parentTagIds, '', userId, 'for-review');
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

    private async getTagsThroughNotes(parentTagIds: number[], searchTerm: string, userId: number, notesType: string) {

        // Generando la sub petición con la librería TypeORM
        // tarda x20 más que la petición SQL nativa
        // la petición con la librería TypeORM la podéis encontrar en el commit anterior
        const subQuery = this.findNoteIdsByCriteria(parentTagIds, searchTerm, userId, notesType);

        const query = this.tagsRepository
            .createQueryBuilder('tag')
            .addSelect(['tag.id', 'tag.name'])
            .innerJoin('note_tags_tag', 'nt', 'tag.id = nt.tagId')
            .where(`nt.noteId IN (${ subQuery.query })`, subQuery.parameters)
            .distinct(true);

        const queryResult = await query.getRawMany();
        return queryResult.map(tag => ({
            id: tag.tag_id,
            name: tag.tag_name,
            notesCount: tag.tag_notesCount,
        }));
    }

    private findNoteIdsByCriteria(parentTagIds: number[], searchTerm: string, userId: number, notesType: string) {

        const parameters = { userId };
        const selectOptions = ['SELECT note.id AS note_id FROM note'];
        const whereOptions = ['note.user_id = :userId'];
        const groupingOptions = [];

        if (notesType === 'for-review') {
            whereOptions.push('note.nextReviewAt <= :currentDate');
            whereOptions.push('note.reviewsLeft >= :minReviewsLeft');
            parameters['currentDate'] = new Date();
            parameters['minReviewsLeft'] = 1;
        }

        if (searchTerm) {
            whereOptions.push('(note.title LIKE :searchTerm OR note.content LIKE :searchTerm)');
            parameters['searchTerm'] = `%${ searchTerm }%`;
        }

        if (parentTagIds && parentTagIds.length > 0) {
            selectOptions.push('INNER JOIN note_tags_tag nt ON note.id = nt.noteId');
            selectOptions.push('INNER JOIN tag ON nt.tagId = tag.id');
            selectOptions.push('INNER JOIN note_tags_tag nt2 ON note.id = nt2.noteId');
            whereOptions.push('nt2.tagId IN (:...parentTagIds)');
            groupingOptions.push('GROUP BY note.id');
            groupingOptions.push('HAVING COUNT(DISTINCT nt2.tagId) = :countTags');
            parameters['parentTagIds'] = parentTagIds;
            parameters['countTags'] = parentTagIds.length;
        }

        const query = `${ selectOptions.join(' ') } WHERE ${ whereOptions.join(' AND ') } ${ groupingOptions.join(' ') }`;
        return { query, parameters };
    }

}
