import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCampaignDto {
  @IsUUID('4', { message: 'El ID del animal debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del animal es obligatorio' })
  animalId: string;

  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto objetivo debe ser un número con hasta 2 decimales' })
  @IsPositive({ message: 'El monto objetivo debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El monto objetivo es obligatorio' })
  montoObjetivo: number;

  @IsString({ message: 'La URL de la factura debe ser una cadena de texto' })
  @IsOptional()
  facturaUrl?: string;
}
