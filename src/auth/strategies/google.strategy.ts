import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AuthService } from '../auth.service';
import { envConfig } from '../../../config/env.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    ) {
        super({
            clientID: envConfig().googleClientId,
            clientSecret: envConfig().googleClientSecret,
            callbackURL: 'http://localhost:3003/auth/google-redirect',
            scope: ['email'],
        });
    }

    async validate(
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const user = this.authService.validateGoogleUser(profile.emails[0].value);
        done(null, user);
    }
}