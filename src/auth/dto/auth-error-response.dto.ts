export class AuthErrorResponseDto {
    errorCode: 'emailTaken' | 'emailMatchesOld' | 'userNotFound' | 'forbidden' | 'wrongPassword' | 'passwordMatchesOld';
}