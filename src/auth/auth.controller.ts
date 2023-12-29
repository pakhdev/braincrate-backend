import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    UseGuards,
    Query,
    Res,
    Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { GetUser } from './decorators/get-user.decorator';
import {
    AuthErrorResponseDto,
    CheckEmailDto, CheckEmailResponseDto,
    LoginUserDto,
    RegisterUserDto,
    UpdateEmailDto,
    UpdatePasswordDto,
} from './dto';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { ExtendedUser } from './interfaces/extended-user.interface';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Cuentas de usuario')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiBody({ type: RegisterUserDto })
    @ApiResponse({ status: 200, description: 'Usuario registrado' })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
    @ApiResponse({ status: 409, description: 'Correo electrónico ya registrado', type: AuthErrorResponseDto })
    @ApiResponse({ status: 500, description: 'Error interno del servidor', type: AuthErrorResponseDto })
    @Post('register')
    register(@Body() registerDto: RegisterUserDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.register(registerDto, res);
    }

    @ApiOperation({ summary: 'Iniciar sesión con contraseña' })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({ status: 200, description: 'Inicio de sesión' })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor', type: AuthErrorResponseDto })
    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.login(loginUserDto, res);
    }

    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiResponse({ status: 200, description: 'Cierre de sesión exitoso' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    @Delete('logout')
    logout(@Res() res: Response) {
        return this.authService.logout(res);
    }

    @ApiOperation({ summary: 'Iniciar sesión / Registrarse con Google' })
    @ApiResponse({ status: 200, description: 'Inicio de sesión con Google' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    @Get('google-login')
    @UseGuards(AuthGuard('google-auth'))
    googleLogin(@GetUser() user: User, @Res() res: Response): Promise<void> {
        return this.authService.googleLogin(user, res);
    }

    @ApiOperation({ summary: 'Vincular cuenta de Google' })
    @ApiCookieAuth()
    @ApiResponse({
        status: 200,
        description: 'Vinculación correcta',
        content: { 'application/json': { schema: { example: [{ message: 'success' }] } } },
    })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
    @Get('link-google-account')
    @UseGuards(AuthGuard('google-link'), AuthGuard('jwt'))
    async linkGoogleAccount(@GetUser() user: ExtendedUser, @Res() res: Response): Promise<void> {
        const jsonToSend: { message: string, newEmail?: string } = await this.authService.linkGoogleAccount(user, res);
        res.send(`<script>window.opener.postMessage(${ JSON.stringify(jsonToSend) }, '*');</script>`);
    }

    @ApiOperation({ summary: 'Comprobar si la dirección de correo está ya registrada' })
    @ApiBody({ type: CheckEmailDto })
    @ApiResponse({ status: 200, description: 'Resultado', type: CheckEmailResponseDto })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
    @Get('check-email')
    checkEmail(@Query() checkEmailDto: CheckEmailDto): Promise<{ isRegistered: boolean }> {
        return this.authService.isEmailRegistered(checkEmailDto.email);
    }

    @ApiOperation({ summary: 'Actualizar el correo electrónico' })
    @ApiCookieAuth()
    @ApiBody({ type: UpdateEmailDto, description: 'Datos para actualizar la dirección de correo electrónico' })
    @ApiResponse({ status: 200, description: 'Éxito' })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta', type: AuthErrorResponseDto })
    @ApiResponse({ status: 404, description: 'No encontrado', type: AuthErrorResponseDto })
    @Patch('update-email')
    @UseGuards(AuthGuard())
    updateEmail(@GetUser() user: User, @Body() updateEmailDto: UpdateEmailDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.updateEmail(user, updateEmailDto, res);
    }

    @ApiOperation({ summary: 'Actualizar la contraseña' })
    @ApiCookieAuth()
    @ApiBody({ type: UpdatePasswordDto })
    @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
    @ApiResponse({ status: 400, description: 'Solicitud incorrecta', type: AuthErrorResponseDto })
    @ApiResponse({ status: 401, description: 'No autorizado', type: AuthErrorResponseDto })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado', type: AuthErrorResponseDto })
    @ApiResponse({ status: 500, description: 'Error interno del servidor', type: AuthErrorResponseDto })
    @Patch('update-password')
    @UseGuards(AuthGuard())
    updatePassword(@GetUser() user: User, @Body() updatePasswordDto: UpdatePasswordDto, @Res() res: Response): Promise<void | AuthErrorResponseDto> {
        return this.authService.updatePassword(user, updatePasswordDto, res);
    }

    @ApiOperation({ summary: 'Comprobar la autenticación del usuario' })
    @ApiCookieAuth()
    @ApiResponse({ status: 200, description: 'El usuario está autenticado' })
    @ApiResponse({ status: 401, description: 'El usuario no está autenticado' })
    @Get('check-auth-status')
    @UseGuards(AuthGuard())
    checkAuthStatus(@GetUser() user: User, @Res() res: Response): Promise<void> {
        return this.authService.checkAuthStatus(user, res);
    }

}
