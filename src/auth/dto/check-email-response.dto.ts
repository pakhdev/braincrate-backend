import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailResponseDto {

    @ApiProperty({ description: 'Resultado de comprobación' })
    isRegistered: boolean;
}