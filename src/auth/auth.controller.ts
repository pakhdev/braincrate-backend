import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from './decorators/get-user.decorator';
import { CheckEmailDto, LoginUserDto, RegisterUserDto, UpdateEmailDto, UpdatePasswordDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterUserDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-email')
    checkEmail(@Query() checkEmailDto: CheckEmailDto): Promise<{ isRegistered: boolean }> {
        return this.authService.isEmailRegistered(checkEmailDto.email);
    }

    @Patch('update-email')
    @UseGuards(AuthGuard())
    updateEmail(@GetUser() user: User, @Body() updateEmailDto: UpdateEmailDto) {
        return this.authService.updateEmail(user, updateEmailDto);
    }

    @Patch('update-password')
    @UseGuards(AuthGuard())
    updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.authService.updatePassword(user, updatePasswordDto);
    }

    @Patch('update/:id')
    @UseGuards(AuthGuard())
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
        @Body() updateUserDto: UpdateUserDto) {
        return this.authService.update(id, user, updateUserDto);
    }

    @Get('check-auth-status')
    @UseGuards(AuthGuard())
    checkAuthStatus(@GetUser() user: User) {
        return this.authService.checkAuthStatus(user);
    }
}
