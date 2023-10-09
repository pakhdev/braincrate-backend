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

import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './entities/user.entity';
import { handleDBErrors } from '../common/helpers/handle-db-errors.helper';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
    }

    async register(registerUserDto: RegisterUserDto): Promise<Object> {
        const user = await this.userRepository.findOneBy({ email: registerUserDto.email });
        if (user) throw new BadRequestException({
            ok: false,
            message: 'Usuario con éste correo electrónico ya existe',
        });
        return await this.create(registerUserDto);
    }

    async create(createUserDto: RegisterUserDto): Promise<Object> {
        const { password, ...userData } = createUserDto;
        const user = this.userRepository.create({
            ...userData,
            password: bcrypt.hashSync(password, 10),
        });

        try {
            const savedUser = await this.userRepository.save(user);
            delete savedUser.password;
            return {
                ...savedUser,
                token: this.getJwtToken({ id: savedUser.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase().trim() },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw new UnauthorizedException('Correo electrónico incorrecto');
        }
        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Contraseña incorrecta');

        delete user.password;
        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }

    async update(id: number, user: User, updateUserDto: UpdateUserDto): Promise<Object> {

        if (user.id !== id)
            throw new ForbiddenException();

        try {
            const { password, ...userData } = updateUserDto;
            const user = await this.userRepository.preload({
                id,
                ...userData,
                password: password ? bcrypt.hashSync(password, 10) : undefined,
            });

            // TODO: Controlar éste error en catch
            if (!user)
                throw new NotFoundException('Usuario no encontrado');

            const updatedUser = await this.userRepository.save(user);

            delete updatedUser.password;
            return {
                ...user,
                token: this.getJwtToken({ id: user.id }),
            };
        } catch (error) {
            handleDBErrors(error, 'AuthModule');
        }
    }

    private getJwtToken(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    async checkAuthStatus(user: User) {
        return {
            ...user,
            token: this.getJwtToken({ id: user.id }),
        };
    }
}
