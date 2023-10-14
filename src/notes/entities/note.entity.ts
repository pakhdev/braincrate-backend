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
import { User } from '../../auth/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Image } from '../../images/entities/images.entity';

@Entity()
export class Note {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('varchar', { length: 255, nullable: false })
    title: string;

    @Column('text', { nullable: false })
    content: string;

    // REVIEWS MODE?

    @Column({ nullable: false })
    reviewsLeft: number;

    @Column({ nullable: true })
    nextReviewAt: Date;

    @JoinTable()
    @ManyToMany(() => Tag, tag => tag.notes)
    tags: Tag[];

    @OneToMany(() => Image, image => image.note)
    images: Image[];

    @ManyToOne(() => User, user => user.notes)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true, default: null })
    removedAt: Date;

    @Column('varchar', { nullable: true, default: null })
    removedTags: string;
}
