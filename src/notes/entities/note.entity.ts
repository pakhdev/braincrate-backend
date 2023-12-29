import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Difficulty } from '../../reviews/enums/difficulty.enum';
import { Image } from '../../images/entities/images.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Note {

    @ApiProperty({ description: 'Identificador único de la nota', example: 1 })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Título de la nota', example: 'Mi nota' })
    @Column('varchar', { length: 255, nullable: false })
    title: string;

    @ApiProperty({ description: 'Contenido de la nota', example: 'Contenido de mi nota' })
    @Column('text', { nullable: false })
    content: string;

    @ApiProperty({ description: 'Esquema de repasos', enum: ['0', '1', '2', '3'], example: '1' })
    @Column({ type: 'enum', enum: Difficulty, default: Difficulty.None })
    difficulty: Difficulty;

    @ApiProperty({ description: 'Número de revisiones restantes', example: 3 })
    @Column({ nullable: false })
    reviewsLeft: number;

    @ApiProperty({ description: 'Fecha del próximo repaso', example: '2023-01-01T12:00:00Z' })
    @Column({ nullable: true })
    nextReviewAt: Date;

    @ApiProperty({ description: 'Fecha del último repaso', example: '2023-01-01T12:00:00Z' })
    @Column({ nullable: true })
    reviewedAt: Date;

    @ApiProperty({ description: 'Indica si la nota se eliminará al terminar todos los repasos', example: false })
    @Column({ default: false })
    removeAfterReviews: boolean;

    @ApiProperty({ description: 'Lista de etiquetas asociadas a la nota', type: [Tag] })
    @JoinTable()
    @ManyToMany(() => Tag, tag => tag.notes)
    tags: Tag[];

    @ApiProperty({ description: 'Lista de imágenes asociadas a la nota', type: [Image] })
    @OneToMany(() => Image, image => image.note)
    images: Image[];

    @ApiProperty({ description: 'Autor de la nota', type: () => User })
    @ManyToOne(() => User, user => user.notes)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiProperty({ description: 'Fecha de última actualización de la nota', example: '2023-01-01T12:00:00Z' })
    @Column({ default: () => 'NOW()' })
    updatedAt: Date;

    @ApiProperty({ description: 'Fecha de creación de la nota', example: '2023-01-01T12:00:00Z' })
    @Column({ default: () => 'NOW()' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de eliminación de la nota', example: '2023-01-01T12:00:00Z' })
    @Column({ nullable: true, default: null })
    removedAt: Date;

    @ApiProperty({ description: 'Etiquetas eliminadas de la nota', example: 'Etiqueta1,Etiqueta2' })
    @Column('varchar', { nullable: true, default: null })
    removedTags: string;
}
