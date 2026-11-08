import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTransitAssignmentDto {
  @IsUUID('4', { message: 'El ID del animal debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del animal es obligatorio' })
  animalId: string;

  @IsUUID('4', { message: 'El ID del voluntario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del voluntario es obligatorio' })
  voluntarioId: string;
}