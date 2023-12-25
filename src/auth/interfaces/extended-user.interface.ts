import { User } from '../entities/user.entity';

export interface ExtendedUser extends Partial<User> {
    googleData?: Partial<User>;
}