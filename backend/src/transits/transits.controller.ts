import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransitsService } from './transits.service';
import { UpsertHomeProfileDto } from './dto/upsert-home-profile.dto';
import { CreateTransitAssignmentDto } from './dto/create-transit-assignment.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('transits')
export class TransitsController {
  constructor(private readonly transitsService: TransitsService) {}

  // HU-011: Registro o edición del perfil habitacional
  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.VOLUNTARIO, Rol.ADMIN)
  upsertProfile(@Request() req: any, @Body() dto: UpsertHomeProfileDto) {
    return this.transitsService.upsertProfile(req.user.id, dto);
  }

  // HU-012: Activar o pausar disponibilidad para el emparejamiento
  @Patch('profile/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.VOLUNTARIO, Rol.ADMIN)
  toggleAvailability(@Request() req: any, @Body() dto: ToggleAvailabilityDto) {
    return this.transitsService.toggleActive(req.user.id, dto);
  }

  // Consultar perfil habitacional propio
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Request() req: any) {
    return this.transitsService.getProfile(req.user.id);
  }

  // Consultar el animal que tiene actualmente asignado el voluntario autenticado
  @Get('my-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.VOLUNTARIO, Rol.ADMIN)
  getMyActiveTransit(@Request() req: any) {
    return this.transitsService.getMyActiveTransit(req.user.id);
  }

  // Formalizar asignación: Solo ADMIN
  @Post('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  assignTransit(@Body() dto: CreateTransitAssignmentDto) {
    return this.transitsService.assignTransit(dto);
  }

  // Ver todos los tránsitos en curso: Solo ADMIN
  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  findAllActive() {
    return this.transitsService.findAllActive();
  }
}