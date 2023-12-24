import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from './entities/user.entity';
import { envConfig } from '../../config/env.config';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt', session: false }),
        JwtModule.registerAsync({
            useFactory: () => {
                return {
                    secret: envConfig().jwtSecret,
                    signOptions: {
                        expiresIn: envConfig().jwtExpiresInHours + 'h',
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        GoogleAuthStrategy,
    ],
    exports: [TypeOrmModule, PassportModule, JwtModule],
})
export class AuthModule {
}
