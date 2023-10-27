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
import { Difficulty } from '../../reviews/enums/difficulty.enum';

@Entity()
export class Note {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('varchar', { length: 255, nullable: false })
    title: string;

    @Column('text', { nullable: false })
    content: string;

    @Column({ type: 'enum', enum: Difficulty, default: Difficulty.None })
    difficulty: Difficulty;

    @Column({ nullable: false })
    reviewsLeft: number;

    @Column({ nullable: true })
    nextReviewAt: Date;

    @Column({ nullable: true })
    reviewedAt: Date;

    @JoinTable()
    @ManyToMany(() => Tag, tag => tag.notes)
    tags: Tag[];

    @OneToMany(() => Image, image => image.note)
    images: Image[];

    @ManyToOne(() => User, user => user.notes)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ default: () => 'NOW()' })
    updatedAt: Date;

    @Column({ default: () => 'NOW()' })
    createdAt: Date;

    @Column({ nullable: true, default: null })
    removedAt: Date;

    @Column('varchar', { nullable: true, default: null })
    removedTags: string;
}
