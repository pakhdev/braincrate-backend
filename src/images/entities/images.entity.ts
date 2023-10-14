import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../../notes/entities/note.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Image {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('varchar', { nullable: false, length: 255 })
    fileName: string;

    @Column('varchar', { nullable: true, length: 255, default: null })
    largeImage: string;

    @ManyToOne(() => User, user => user.images)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Note, note => note.images)
    @JoinColumn({ name: 'note_id' })
    note: Note;

    @Column({ nullable: true, default: null })
    removedAt?: Date;
}