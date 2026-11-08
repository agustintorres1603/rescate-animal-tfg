import { IsNotEmpty, IsUUID } from 'class-validator';

export class ApplySingleMatchDto {
  @IsUUID('4', { message: 'El animalId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El animalId es obligatorio' })
  animalId: string;

  @IsUUID('4', { message: 'El voluntarioId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El voluntarioId es obligatorio' })
  voluntarioId: string;
}