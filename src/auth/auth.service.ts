import { InjectRepository } from '@nestjs/typeorm';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
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
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';
import { handleDBErrors } from '../common/helpers/handle-db-errors.helper';
import { envConfig } from '../../config/env.config';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    public async register(registerUserDto: RegisterUserDto, res: Response): Promise<void | AuthErrorResponseDto> {
        const user = await this.userRepository.findOneBy({ email: registerUserDto.email });
        if (user) throw new BadRequestException({ errorCode: 'emailTaken' });
        return await this.create(registerUserDto, res);
    }

    public async create(createUserDto: RegisterUserDto, res: Response): Promise<void> {
        const { password, ...userData } = createUserDto;
        const user = this.userRepository.create({
            ...userData,
            password: bcrypt.hashSync(password, 10),
        });
        try {
            const savedUser = await this.userRepository.save(user);
            this.setAuthCookies(res, savedUser);
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    public async login(loginUserDto: LoginUserDto, res: Response): Promise<void | AuthErrorResponseDto> {
        const { password, email } = loginUserDto;
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, password: true, hasGoogleAccount: true },
        });
        if (!user) {
            throw new UnauthorizedException({ errorCode: 'userNotFound' });
        }
        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException({ errorCode: 'wrongPassword' });
        this.setAuthCookies(res, user);
    }

    public logout(res: Response): Response<string> {
        res.clearCookie('token', { httpOnly: true, secure: envConfig().cookieSecureFlag });
        res.clearCookie('id', { secure: envConfig().cookieSecureFlag });
        res.clearCookie('email', { secure: envConfig().cookieSecureFlag });
        res.clearCookie('hasPass', { secure: envConfig().cookieSecureFlag });
        res.clearCookie('hasGoogleAccount', { secure: envConfig().cookieSecureFlag });
        return res.send('Logout successful');
    }

    public async validateGoogleUser(email: string) {
        const user = await this.userRepository.findOneBy({ email });
        if (!user) throw new UnauthorizedException({ errorCode: 'userNotFound' });
        return {
            id: user.id,
            email: user.email,
            hasPass: !!user.password,
            hasGoogleAccount: user.hasGoogleAccount,
        };
    }

    public async isEmailRegistered(email: string): Promise<{ isRegistered: boolean }> {
        const findEmail = await this.userRepository.findOneBy({ email });
        return { isRegistered: !!findEmail };
    }

    public async update(id: number, user: User, updateUserDto: UpdateUserDto, res: Response): Promise<void | AuthErrorResponseDto> {
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
            this.setAuthCookies(res, updatedUser);
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    public async updateEmail(user: User, updateEmailDto: UpdateEmailDto, res: Response): Promise<void | AuthErrorResponseDto> {
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
            this.setAuthCookies(res, updatedUser);
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    public async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto, res: Response): Promise<void | AuthErrorResponseDto> {
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
            this.setAuthCookies(res, updatedUser);
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    public async checkAuthStatus(user: User, res: Response): Promise<void> {
        this.setAuthCookies(res, user);
    }

    private getJwtToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload);
    }

    private setAuthCookies(res: Response, user: User): void {
        const token = this.getJwtToken({ id: user.id });
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + envConfig().jwtExpiresInSeconds);

        res.cookie('id', user.id.toString(), { expires: expirationDate });
        res.cookie('email', user.email, { expires: expirationDate });
        res.cookie('token', token, { httpOnly: true, expires: expirationDate });
        res.cookie('hasPass', !!user.password.toString(), { expires: expirationDate });
        res.cookie('hasGoogleAccount', user.hasGoogleAccount.toString(), { expires: expirationDate });

        res.json({
            id: user.id,
            email: user.email,
            token,
        });
    }

}
