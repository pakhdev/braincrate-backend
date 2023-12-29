import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Note } from '../../notes/entities/note.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Tag {

    @ApiProperty({ description: 'Identificador único de la etiqueta', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Nombre de la etiqueta', example: 'ejemplo' })
    @Column('varchar', { nullable: false, length: 20 })
    name: string;

    @ApiProperty({ description: 'Número de notas vinculadas a la etiqueta', example: 5 })
    @Column()
    notesCount: number;

    @ApiProperty({ description: 'Notas vinculadas a la etiqueta', type: () => [Note] })
    @ManyToMany(() => Note, note => note.tags)
    notes: Note[];

    @ApiProperty({ description: 'Autor de la etiqueta', type: () => User })
    @ManyToOne(() => User, user => user.tags)
    user: User;
}
