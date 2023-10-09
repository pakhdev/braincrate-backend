import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe contener 6 o más caracteres' })
    @MaxLength(50)
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'La contraseña debe tener letras mayúsculas, minúsculas y un número',
    })
    password: string;
}
