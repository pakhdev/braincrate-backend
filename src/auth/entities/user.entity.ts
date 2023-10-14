import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../../notes/entities/note.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Image } from '../../images/entities/images.entity';

@Entity()
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('varchar', { unique: true })
    email: string;

    @Column('varchar', { select: false })
    password: string;

    @OneToMany(() => Note, note => note.user)
    notes: Note[];

    @OneToMany(() => Tag, tag => tag.user)
    tags: Tag[];

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
