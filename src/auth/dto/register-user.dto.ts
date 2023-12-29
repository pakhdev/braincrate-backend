import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {

    @ApiProperty({ description: 'Dirección de correo electrónico del usuario', example: 'correo@correo.es' })
    @IsString()
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: 'Abc123' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe contener 6 o más caracteres' })
    @MaxLength(50)
    password: string;
}
