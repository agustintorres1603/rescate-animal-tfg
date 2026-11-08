import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe ser alfanumérica (contener al menos una letra y un número)',
  })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono de contacto es requerido' })
  telefono: string;

  @IsIn([Rol.VOLUNTARIO, Rol.DONANTE], {
    message: 'El autoregistro solo permite rol VOLUNTARIO o DONANTE',
  })
  @IsOptional()
  rol?: Rol;
}