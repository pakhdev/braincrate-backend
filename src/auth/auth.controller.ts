import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, Query, Res, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { GetUser } from './decorators/get-user.decorator';
import { CheckEmailDto, LoginUserDto, RegisterUserDto, UpdateEmailDto, UpdatePasswordDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterUserDto, @Res() res: Response) {
        return this.authService.register(registerDto, res);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
        return this.authService.login(loginUserDto, res);
    }

    @Delete('logout')
    logout(@Res() res: Response) {
        return this.authService.logout(res);
    }

    @Get('google-login')
    @UseGuards(AuthGuard('google-auth'))
    googleLogin(@GetUser() user: User, @Res() res: Response) {
        return this.authService.googleLogin(user, res);
    }

    @Get('link-google-account')
    linkGoogleAccount(@Res() res) {
        const dataToSend = { username: 'exampleUser', token: 'exampleToken' };
        const script = `<script>window.opener.postMessage(${ JSON.stringify(dataToSend) }, '*');</script>`;
        res.send(script);
    }

    @Get('check-email')
    checkEmail(@Query() checkEmailDto: CheckEmailDto): Promise<{ isRegistered: boolean }> {
        return this.authService.isEmailRegistered(checkEmailDto.email);
    }

    @Patch('update-email')
    @UseGuards(AuthGuard())
    updateEmail(@GetUser() user: User, @Body() updateEmailDto: UpdateEmailDto, @Res() res: Response) {
        return this.authService.updateEmail(user, updateEmailDto, res);
    }

    @Patch('update-password')
    @UseGuards(AuthGuard())
    updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordDto, @Res() res: Response) {
        return this.authService.updatePassword(user, updatePasswordDto, res);
    }

    @Patch('update/:id')
    @UseGuards(AuthGuard())
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User,
        @Body() updateUserDto: UpdateUserDto,
        @Res() res: Response) {
        return this.authService.update(id, user, updateUserDto, res);
    }

    @Get('check-auth-status')
    @UseGuards(AuthGuard())
    checkAuthStatus(@GetUser() user: User, @Res() res: Response) {
        return this.authService.checkAuthStatus(user, res);
    }

}
