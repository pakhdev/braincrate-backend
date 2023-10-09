import { Controller, Get, Post, Body, Patch, Param, UseGuards, HttpCode, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from './decorators/get-user.decorator';
import { LoginUserDto, RegisterUserDto, UpdateUserDto } from './dto';
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