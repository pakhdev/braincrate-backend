import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe contener 6 o más caracteres' })
    @MaxLength(50)
    password: string;
}
