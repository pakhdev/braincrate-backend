import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDto {

    @ApiProperty({ description: 'Dirección de correo electrónico para comprobar' })
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;

}