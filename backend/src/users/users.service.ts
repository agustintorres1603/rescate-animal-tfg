import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const assignedRole =
      createUserDto.rol === Rol.VOLUNTARIO ? Rol.VOLUNTARIO : Rol.DONANTE;

    const user = await this.prisma.usuario.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        nombre: createUserDto.nombre,
        telefono: createUserDto.telefono,
        rol: assignedRole,
      },
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: { perfilHogar: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  // HU-004: Criterio 2 (Actualización de datos de perfil)
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: updateProfileDto.nombre,
        telefono: updateProfileDto.telefono,
      },
    });

    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }
}