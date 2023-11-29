export class AuthErrorResponseDto {
    errorCode: 'emailTaken' | 'emailMatchesOld' | 'wrongOldPassword' | 'userNotFound' | 'forbidden' | 'wrongPassword' | 'passwordMatchesOld';
}