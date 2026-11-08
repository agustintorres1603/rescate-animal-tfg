import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoDonacion } from '@prisma/client';

export class UpdateDonationStatusDto {
  @IsEnum(EstadoDonacion, { message: 'Estado de donación no válido (PENDIENTE, APROBADA, RECHAZADA)' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  estado: EstadoDonacion;
}