import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Especie, EstadoAnimal, Tamano } from '@prisma/client';

export class CreateAnimalDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEnum(Especie, { message: 'Especie no válida (PERRO o GATO)' })
  @IsNotEmpty({ message: 'La especie es obligatoria' })
  especie: Especie;

  @IsInt({ message: 'La edad aproximada en meses debe ser un número entero' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  @IsNotEmpty({ message: 'La edad aproximada en meses es requerida' })
  edadAproxMeses: number;

  @IsEnum(Tamano, { message: 'Tamaño no válido (CHICO, MEDIANO o GRANDE)' })
  @IsNotEmpty({ message: 'El tamaño es obligatorio' })
  tamano: Tamano;

  @IsString({ message: 'El estado de salud debe ser una descripción' })
  @IsNotEmpty({ message: 'El estado de salud es obligatorio' })
  estadoSalud: string;

  @IsBoolean({ message: 'requierePatio debe ser un booleano' })
  @IsNotEmpty({ message: 'requierePatio es obligatorio' })
  requierePatio: boolean;

  @IsBoolean({ message: 'sociablePerros debe ser un booleano' })
  @IsNotEmpty({ message: 'sociablePerros es obligatorio' })
  sociablePerros: boolean;

  @IsBoolean({ message: 'sociableGatos debe ser un booleano' })
  @IsNotEmpty({ message: 'sociableGatos es obligatorio' })
  sociableGatos: boolean;

  @IsBoolean({ message: 'necesitaMedicacion debe ser un booleano' })
  @IsNotEmpty({ message: 'necesitaMedicacion es obligatorio' })
  necesitaMedicacion: boolean;

  @IsEnum(EstadoAnimal, { message: 'Estado del animal no válido' })
  @IsOptional()
  estado?: EstadoAnimal;
}