import { IsEmail, IsString } from 'class-validator';

export class CheckEmailDto {
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;
}