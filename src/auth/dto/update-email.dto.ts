import { IsEmail, IsString } from 'class-validator';

export class UpdateEmailDto {
    @IsString()
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;
}
