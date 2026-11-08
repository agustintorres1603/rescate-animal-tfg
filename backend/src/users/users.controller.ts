import { 
  Body, 
  Controller, 
  Get, 
  Patch, 
  Request, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // HU-004: Criterio 1 (Visualización de datos de contacto)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.id || req.user.sub);
  }

  // HU-004: Criterio 2 (Actualización de datos y guardado en base de datos)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id || req.user.sub, updateProfileDto);
  }
}