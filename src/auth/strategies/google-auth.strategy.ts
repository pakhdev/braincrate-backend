import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import { envConfig } from '../../../config/env.config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google-auth') {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        super({
            clientID: envConfig().googleClientId,
            clientSecret: envConfig().googleClientSecret,
            callbackURL: 'http://localhost:1337/api/auth/google-login',
            scope: ['email'],
        });
    }

    async validate(
        accessToken: string, refreshToken: string, profile: Profile,
    ): Promise<User | { email: string }> {
        const user = await this.userRepository.findOneBy({ email: profile.emails[0].value });
        if (!user) return { email: profile.emails[0].value };
        return user;
    }
}