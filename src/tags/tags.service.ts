import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {

    constructor(@InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>) {}

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

    async findAll(user: User) {
        return await this.tagsRepository.findBy({ user: { id: user.id } });
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

}
