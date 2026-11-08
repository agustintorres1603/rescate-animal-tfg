import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { ApplySingleMatchDto } from './dto/apply-single-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('simulate')
  simulate() {
    return this.matchingService.runMatching();
  }

  @Post('apply-one')
  applyOne(@Body() dto: ApplySingleMatchDto) {
    return this.matchingService.applySingleMatch(dto.animalId, dto.voluntarioId);
  }

  @Post('apply-all')
  applyAll() {
    return this.matchingService.applyMatching();
  }
}