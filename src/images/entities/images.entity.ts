import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Note } from '../../notes/entities/note.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Image {

    @ApiProperty({ description: 'Identificador único de la imagen', example: 1 })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'Nombre del archivo', example: '2_1697271804477.jpg' })
    @Column('varchar', { nullable: false, length: 255 })
    fileName: string;

    @ApiProperty({ description: 'Enlace a la imagen grande', example: 'large_2_1697269762849.jpg' })
    @Column('varchar', { nullable: true, length: 255, default: null })
    largeImage: string;

    @ApiProperty({ description: 'Usuario al que está vinculada la imagen', type: () => User })
    @ManyToOne(() => User, user => user.images)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiProperty({ description: 'Nota a la que está vinculada la imagen', type: () => Note })
    @ManyToOne(() => Note, note => note.images)
    @JoinColumn({ name: 'note_id' })
    note: Note;

    @ApiProperty({ description: 'Fecha de eliminación de la imagen', example: '2023-12-23T12:34:56Z' })
    @Column({ nullable: true, default: null })
    removedAt?: Date;
}