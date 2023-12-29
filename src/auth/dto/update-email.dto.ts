import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
    @ApiProperty({ description: 'Dirección de correo electrónico del usuario', example: 'correo@correo.es' })
    @IsString()
    @IsEmail({}, { message: 'Indique la dirección de correo correctamente' })
    email: string;
}
