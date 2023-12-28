import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { promises as fsPromises } from 'fs';
import * as sharp from 'sharp';
import * as path from 'path';
import { JSDOM } from 'jsdom';

import { SaveImageDto } from './dto/save-image.dto';
import { Image } from './entities/images.entity';
import { Note } from '../notes/entities/note.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ImagesService {

    private imgDir: string = path.resolve(__dirname, '../../../public/image_files');
    private maxInitialImageWidth: number = 800;
    private maxInitialImageHeight: number = 600;
    private maxLargeImageWidth: number = 1600;
    private maxLargeImageHeight: number = 1200;

    constructor(@InjectRepository(Image) private readonly imagesRepository: Repository<Image>) {}

    public async markForRemovingByNoteId(noteId: number, user: User): Promise<void> {
        let images = await this.findAllByNoteId(noteId, user);
        images.map(image => {
            image.removedAt = new Date();
            return image;
        });
        await this.imagesRepository.save(images);
    }

    public async restoreByNoteId(noteId: number, user: User): Promise<void> {
        let images = await this.findAllByNoteId(noteId, user);
        images.map(image => {
            image.removedAt = null;
            return image;
        });
        await this.imagesRepository.save(images);
    }

    public async clearOrphanedImages(previouslyUploadedIds: number[], currentImages: Image[]): Promise<void> {
        for (const id of previouslyUploadedIds) {
            const isOrphaned = !currentImages.find((image) => image.id === id);
            if (isOrphaned) await this.removeImageFile(+id);
        }
    }

    public async purgeImageFilesAndRecords(ids: number[]): Promise<void> {
        try {
            const images = await this.imagesRepository.findBy({ id: In(ids) });
            images.forEach(image => {
                fsPromises.unlink(`${ this.imgDir }/${ image.fileName }`);
                if (image.largeImage) {
                    fsPromises.unlink(`${ this.imgDir }/${ image.largeImage }`);
                }
            });
            await this.imagesRepository.remove(images);
        } catch (error) {
            throw new BadRequestException('Error al eliminar la imagen');
        }
    }

    public async processAndManageImagesInHTML(htmlCode: string, note: Note, user: User): Promise<{
        noteHtml: string,
        noteImages: Image[],
        previouslyUploadedIds: number[],
    }> {

        const dom = new JSDOM(htmlCode);
        const imgElements = dom.window.document.querySelectorAll('img');

        const noteImages: Image[] = [];
        const previouslyUploadedIds: number[] = note ? note.images.map((image) => image.id) : [];

        for (const img of imgElements) {
            const id = img.getAttribute('id');
            const src = img.getAttribute('src');
            const largeImage = img.getAttribute('largeimage');
            const isNewImage = !id && src.startsWith('data:image/jpeg;base64') && (!largeImage || largeImage.startsWith('data:image/jpeg;base64'));
            const isExistingLocalImage = id && (src.match(/large_\d+_\d+\.jpg$/) || src.match(/\d+_\d+\.jpg$/));
            const isUnknownImage = !src.startsWith('http') && !src.startsWith('https');

            if (isNewImage) {
                const image = await this.create({
                    initialImage: src,
                    largeImage: img.getAttribute('largeimage'),
                }, user);
                if (image) {
                    noteImages.push(image);
                    img.setAttribute('src', image.fileName);
                    img.setAttribute('id', image.id.toString());
                    img.setAttribute('largeimage', image.largeImage);
                }
            } else if (isExistingLocalImage) {
                const image = await this.findOneById(+id, user);
                if (image) {
                    noteImages.push(image);
                    previouslyUploadedIds.push(+id);
                }
            } else if (isUnknownImage) {
                img.parentNode.removeChild(img);
            }
        }

        return {
            noteHtml: dom.serialize().replace(/<html.*?>|<\/html>|<head.*?>|<\/head>|<body.*?>|<\/body>/g, ''),
            noteImages,
            previouslyUploadedIds,
        };
    }

    private async checkAndSaveFile(
        base64Image: string,
        maxWidth: number,
        maxHeight: number,
        fileName: string,
    ): Promise<string> {
        try {
            base64Image = base64Image.replace(/^data:image\/jpeg;base64,/, '');
            const buffer = Buffer.from(base64Image, 'base64');
            const image = sharp(buffer);
            const { width, height } = await image.metadata();
            if (width > maxWidth || height > maxHeight) {
                console.log(`Resizing image ${ fileName } from ${ width }x${ height } to ${ maxWidth }x${ maxHeight }`);
                image.resize(maxWidth, maxHeight);
            }
            await image.toFile(`${ this.imgDir }/${ fileName }`);
            return fileName;
        } catch (error) {
            console.log(error);
            throw new BadRequestException('Error al guardar la imagen');
        }
    }

    private async create(image: SaveImageDto, user: User): Promise<Image> {

        let largeImageName: string | null = null;

        const initialImageName = await this.checkAndSaveFile(
            image.initialImage,
            this.maxInitialImageWidth,
            this.maxInitialImageHeight,
            `${ user.id }_${ Date.now() }.jpg`);

        if (image.largeImage) {
            largeImageName = await this.checkAndSaveFile(
                image.largeImage,
                this.maxLargeImageWidth,
                this.maxLargeImageHeight,
                `large_${ user.id }_${ Date.now() }.jpg`);
        }

        const newImage = this.imagesRepository.create({
            fileName: initialImageName,
            largeImage: largeImageName,
            user,
        });
        return await this.imagesRepository.save(newImage);
    }

    private async findAllByNoteId(noteId: number, user: User): Promise<Image[]> {
        return await this.imagesRepository.findBy({ note: { id: noteId }, user: { id: user.id } });
    }

    private async findOneById(id: number, user: User): Promise<Image> {
        const image = await this.imagesRepository.findOneBy({ id, user: { id: user.id } });
        if (!image) throw new BadRequestException('Imagen no encontrada');
        return image;
    }

    private async removeImageFile(id: number): Promise<void> {
        try {
            const image = await this.imagesRepository.findOneBy({ id });
            await fsPromises.unlink(`${ this.imgDir }/${ image.fileName }`);
            if (image.largeImage) {
                await fsPromises.unlink(`${ this.imgDir }/${ image.largeImage }`);
            }
            await this.imagesRepository.remove(image);
        } catch (error) {
            throw new BadRequestException('Error al eliminar la imagen');
        }
    }

}
