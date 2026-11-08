import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleAvailabilityDto {
  @IsBoolean({ message: 'El campo activo debe ser booleano' })
  @IsNotEmpty({ message: 'El campo activo es obligatorio' })
  activo: boolean;
}