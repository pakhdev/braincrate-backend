import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { envConfig } from '../../../config/env.config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        super({
            clientID: envConfig().googleClientId,
            clientSecret: envConfig().googleClientSecret,
            callbackURL: 'http://localhost:1337/api/auth/google-redirect',
            scope: ['email'],
        });
    }

    async validate(
        accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback,
    ): Promise<void> {
        const user = await this.userRepository.findOneBy({ email: profile.emails[0].value });
        if (!user) throw new UnauthorizedException({ errorCode: 'userNotFound' });
        done(null, user);
    }
}