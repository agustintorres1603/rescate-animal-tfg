import { 
  BadRequestException, 
  Injectable, 
  NotFoundException, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { passwordHash: _, ...userWithoutHash } = user;
    return this.generateAuthResponse(userWithoutHash);
  }

  // HU-003: Criterio 1 y Criterio 2
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // Criterio 2: Informar si la cuenta no se encuentra registrada
    if (!user) {
      throw new NotFoundException('La cuenta de correo electrónico no se encuentra registrada en el sistema.');
    }

    // Generar token seguro de 32 bytes (64 hex) válido por 1 hora
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // +1 hora

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Emisión en terminal / log interno de desarrollo
    console.log('\n======================================================');
    console.log('       PATITAS DEL SUR - RECUPERACIÓN DE CLAVE        ');
    console.log('======================================================');
    console.log(`Destinatario : ${user.email}`);
    console.log(`Enlace de restablecimiento:\n${resetLink}`);
    console.log('======================================================\n');

    return {
      message: 'Se ha enviado un enlace de restablecimiento a su casilla de correo.',
      resetUrl: resetLink,
    };
  }

  // HU-003: Criterio 3
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('El enlace de restablecimiento es inválido o ha expirado.');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {
      message: 'Contraseña restablecida con éxito. Ya podés iniciar sesión con tu nueva clave.',
    };
  }

  private generateAuthResponse(user: { id: string; email: string; nombre: string; rol: string }) {
    const payload = { sub: user.id, email: user.email, rol: user.rol };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }
}