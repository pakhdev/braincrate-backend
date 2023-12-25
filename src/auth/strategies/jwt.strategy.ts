import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { envConfig } from '../../../config/env.config';
import { ExtendedUser } from '../interfaces/extended-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        super({
            secretOrKey: envConfig().jwtSecret,
            jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: JwtPayload): Promise<ExtendedUser> {
        const { id } = payload;
        const user = await this.userRepository.findOne({
            select: ['id', 'email', 'hasGoogleAccount', 'password'],
            where: { id: +id },
        });
        if (!user) throw new UnauthorizedException('Token not valid');

        const userWithGoogleData: ExtendedUser = req.user as ExtendedUser;
        return {
            id: user.id,
            email: user.email,
            hasGoogleAccount: user.hasGoogleAccount,
            password: user.password,
            googleData: userWithGoogleData?.googleData || null,
        };
    }

    private static extractJWT(req: Request): string | null {
        const cookies = req.headers.cookie?.split(';')
            .map(cookie => cookie.trim().split('='))
            .find(([key]) => key === 'token');

        return cookies?.[1] || null;
    }
}
