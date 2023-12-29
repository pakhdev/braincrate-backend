import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {

    @ApiProperty({ description: 'Contraseña actual del usuario', example: 'Abc123' })
    @IsString()
    @MaxLength(50)
    oldPassword: string;

    @ApiProperty({ description: 'Nueva contraseña del usuario', example: 'Abc123' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe contener 6 o más caracteres' })
    @MaxLength(50)
    newPassword: string;
}
