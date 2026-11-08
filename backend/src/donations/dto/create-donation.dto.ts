import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDonationDto {
  @IsUUID('4', { message: 'El ID de la campaña debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la campaña es obligatorio' })
  campanaId: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser numérico con hasta 2 decimales' })
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  monto: number;

  @IsString({ message: 'El código de transacción debe ser texto' })
  @IsNotEmpty({ message: 'El código de transacción es obligatorio' })
  codigoTransaccion: string;

  @IsString({ message: 'La URL del comprobante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El comprobante es obligatorio' })
  comprobanteUrl: string;

  @IsUUID('4', { message: 'El ID de usuario debe ser un UUID válido' })
  @IsOptional()
  usuarioId?: string;
}