import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  // Listar todas las donaciones para auditoría (Exclusivo ADMIN)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  findAll() {
    return this.donationsService.findAll();
  }

  // Registrar intención de donación con comprobante (Público / Donantes)
  @Post()
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  // Historial de aportes del donante autenticado
  @Get('my-donations')
  @UseGuards(JwtAuthGuard)
  findMyDonations(@Request() req: any) {
    return this.donationsService.findMyDonations(req.user.id);
  }

  // Validar o rechazar comprobante (Exclusivo ADMIN)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDonationStatusDto,
  ) {
    return this.donationsService.updateStatus(id, updateDto);
  }

  // Ver donaciones de una campaña (Exclusivo ADMIN)
  @Get('campaign/:campanaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  findByCampaign(@Param('campanaId', ParseUUIDPipe) campanaId: string) {
    return this.donationsService.findByCampaign(campanaId);
  }
}