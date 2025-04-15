import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import { envConfig } from '../../../config/env.config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleLinkStrategy extends PassportStrategy(Strategy, 'google-link') {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
        super({
            clientID: envConfig().googleClientId,
            clientSecret: envConfig().googleClientSecret,
            callbackURL: envConfig().googleLinkUrl,
            scope: ['email'],
        });
    }

    async validate(
        accessToken: string, refreshToken: string, profile: Profile,
    ): Promise<{ googleData: User } | { googleData: { email: string } }> {
        const user = await this.userRepository.findOneBy({ email: profile.emails[0].value });
        if (!user) return { googleData: { email: profile.emails[0].value } };
        return { googleData: user };
    }
}