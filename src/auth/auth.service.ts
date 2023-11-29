import { InjectRepository } from '@nestjs/typeorm';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import {
    LoginUserDto,
    RegisterUserDto,
    UpdatePasswordDto,
    UpdateUserDto,
    UpdateEmailDto,
    AuthErrorResponseDto,
    AuthSuccessResponseDto,
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';
import { handleDBErrors } from '../common/helpers/handle-db-errors.helper';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerUserDto: RegisterUserDto): Promise<AuthErrorResponseDto | AuthSuccessResponseDto> {
        const user = await this.userRepository.findOneBy({ email: registerUserDto.email });
        if (user) throw new BadRequestException({ errorCode: 'emailTaken' });
        return await this.create(registerUserDto);
    }

    async create(createUserDto: RegisterUserDto): Promise<AuthSuccessResponseDto> {
        const { password, ...userData } = createUserDto;
        const user = this.userRepository.create({
            ...userData,
            password: bcrypt.hashSync(password, 10),
        });
        try {
            const savedUser = await this.userRepository.save(user);
            delete savedUser.password;
            return {
                email: savedUser.email,
                id: savedUser.id,
                token: this.getJwtToken({ id: savedUser.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<AuthErrorResponseDto | AuthSuccessResponseDto> {
        const { password, email } = loginUserDto;
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw new UnauthorizedException({ errorCode: 'userNotFound' });
        }
        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException({ errorCode: 'wrongPassword' });

        return {
            id: user.id,
            email: user.email,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    async isEmailRegistered(email: string): Promise<{ isRegistered: boolean }> {
        const findEmail = await this.userRepository.findOneBy({ email });
        return { isRegistered: !!findEmail };
    }

    async update(id: number, user: User, updateUserDto: UpdateUserDto): Promise<AuthErrorResponseDto | AuthSuccessResponseDto> {
        if (user.id !== id)
            throw new ForbiddenException({ errorCode: 'forbidden' });
        const { password, ...userData } = updateUserDto;
        const userToUpdate = await this.userRepository.preload({
            id,
            ...userData,
            password: password ? bcrypt.hashSync(password, 10) : undefined,
        });
        if (!userToUpdate)
            throw new NotFoundException({ errorCode: 'userNotFound' });
        try {
            const updatedUser = await this.userRepository.save(userToUpdate);
            return {
                email: updatedUser.email,
                id: updatedUser.id,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    async updateEmail(user: User, updateEmailDto: UpdateEmailDto): Promise<AuthErrorResponseDto | AuthSuccessResponseDto> {
        const email = updateEmailDto.email.toLowerCase().trim();
        if (user.email === email)
            throw new BadRequestException({ errorCode: 'emailMatchesOld' });
        if ((await this.isEmailRegistered(email)).isRegistered)
            throw new BadRequestException({ errorCode: 'emailTaken' });
        const userToUpdate = await this.userRepository.preload({
            id: user.id,
            email,
        });
        if (!userToUpdate)
            throw new NotFoundException({ errorCode: 'userNotFound' });
        try {
            const updatedUser = await this.userRepository.save(userToUpdate);
            return {
                email: updatedUser.email,
                id: updatedUser.id,
                token: this.getJwtToken({ id: updatedUser.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto): Promise<AuthErrorResponseDto | AuthSuccessResponseDto> {
        const { email } = user;
        const { oldPassword, newPassword } = updatePasswordDto;
        const userToUpdate = await this.userRepository.findOne({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, password: true },
        });
        if (!userToUpdate)
            throw new NotFoundException({ errorCode: 'userNotFound' });
        if (!bcrypt.compareSync(oldPassword, userToUpdate.password))
            throw new UnauthorizedException({ errorCode: 'wrongOldPassword' });
        if (bcrypt.compareSync(newPassword, userToUpdate.password))
            throw new BadRequestException({ errorCode: 'passwordMatchesOld' });

        try {
            const updateUser = await this.userRepository.preload({
                id: user.id,
                password: bcrypt.hashSync(newPassword, 10),
            });
            const updatedUser = await this.userRepository.save(updateUser);
            return {
                email: updatedUser.email,
                id: updatedUser.id,
                token: this.getJwtToken({ id: updatedUser.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    private getJwtToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload);
    }

    async checkAuthStatus(user: User): Promise<AuthSuccessResponseDto> {
        return {
            email: user.email,
            id: user.id,
            token: this.getJwtToken({ id: user.id }),
        };
    }

}
