import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Note } from '../../notes/entities/note.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Image } from '../../images/entities/images.entity';

@Entity()
export class User {

    @ApiProperty({ description: 'Identificador único del usuario', example: 1 })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({ description: 'E-Mail del usuario', example: 'correo@correo.es' })
    @Column('varchar', { unique: true })
    email: string;

    @ApiProperty({ description: 'Hash de la contraseña', example: '1234567890' })
    @Column('varchar', { select: false, nullable: true })
    password: string;

    @ApiProperty({ description: 'Indica si el usuario tiene vinculada su cuenta Google', type: Boolean })
    @Column('boolean', { default: false })
    hasGoogleAccount: boolean;

    @ApiProperty({ description: 'Notas del usuario', type: [Note] })
    @OneToMany(() => Note, note => note.user)
    notes: Note[];

    @ApiProperty({ description: 'Etiquetas del usuario', type: [Tag] })
    @OneToMany(() => Tag, tag => tag.user)
    tags: Tag[];

    @ApiProperty({ description: 'Imágenes subidas por el usuario', type: [Image] })
    @OneToMany(() => Image, image => image.user)
    images: Image[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }

}
