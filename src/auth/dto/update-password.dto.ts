import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {

    @IsString()
    @MaxLength(50)
    oldPassword: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe contener 6 o más caracteres' })
    @MaxLength(50)
    newPassword: string;
}
