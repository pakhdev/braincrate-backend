import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { envConfig } from '../../../config/env.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        super({
            secretOrKey: envConfig().jwtSecret,
            jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { id } = payload;
        const user = await this.userRepository.findOne({
            select: ['id', 'email', 'hasGoogleAccount', 'password'],
            where: { id: +id },
        });
        if (!user) throw new UnauthorizedException('Token not valid');
        return user;
    }

    private static extractJWT(req: Request): string | null {
        const cookies = req.headers.cookie?.split(';')
            .map(cookie => cookie.trim().split('='))
            .find(([key]) => key === 'token');

        return cookies?.[1] || null;
    }
}
