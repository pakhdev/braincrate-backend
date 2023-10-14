import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../../notes/entities/note.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Tag {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { nullable: false, length: 20 })
    name: string;

    @Column()
    notesCount: number;

    @ManyToMany(() => Note, note => note.tags)
    notes: Note[];

    @ManyToOne(() => User, user => user.tags)
    user: User;
}
