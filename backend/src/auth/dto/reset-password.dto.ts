import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'El token es requerido' })
  @IsNotEmpty({ message: 'El token no puede estar vacío' })
  token: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe ser alfanumérica (contener al menos una letra y un número)',
  })
  newPassword: string;
}