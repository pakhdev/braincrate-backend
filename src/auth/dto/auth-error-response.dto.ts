import { ApiProperty } from '@nestjs/swagger';

export class AuthErrorResponseDto {

    @ApiProperty({ description: 'Código de error' })
    errorCode: 'emailTaken' | 'emailMatchesOld' | 'wrongOldPassword' | 'userNotFound' | 'forbidden' | 'wrongPassword' | 'passwordMatchesOld' | 'setPasswordBeforeEmailUpdate';
}