import { IsBoolean, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { TipoVivienda } from '@prisma/client';

export class UpsertHomeProfileDto {
  @IsEnum(TipoVivienda, {
    message: 'El tipo de vivienda debe ser CASA o DEPARTAMENTO',
  })
  @IsNotEmpty({ message: 'El tipo de vivienda es obligatorio' })
  tipoVivienda: TipoVivienda;

  @IsBoolean({ message: 'tienePatioCerrado debe ser un valor booleano' })
  @IsNotEmpty({ message: 'tienePatioCerrado es obligatorio' })
  tienePatioCerrado: boolean;

  @IsBoolean({ message: 'tieneOtrosAnimales debe ser un valor booleano' })
  @IsNotEmpty({ message: 'tieneOtrosAnimales es obligatorio' })
  tieneOtrosAnimales: boolean;

  @IsBoolean({ message: 'aceptaMedicacion debe ser un valor booleano' })
  @IsNotEmpty({ message: 'aceptaMedicacion es obligatorio' })
  aceptaMedicacion: boolean;

  @IsInt({ message: 'La disponibilidad en días debe ser un número entero' })
  @Min(1, { message: 'La disponibilidad mínima debe ser de al menos 1 día' })
  @IsNotEmpty({ message: 'disponibilidadDias es obligatorio' })
  disponibilidadDias: number;
}