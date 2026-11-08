import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertHomeProfileDto } from './dto/upsert-home-profile.dto';
import { CreateTransitAssignmentDto } from './dto/create-transit-assignment.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { EstadoAnimal, EstadoTransito, Rol } from '@prisma/client';

@Injectable()
export class TransitsService {
  constructor(private readonly prisma: PrismaService) {}

  // HU-011: Guardar o actualizar perfil del voluntario logueado (crea o reactiva)
  async upsertProfile(userId: string, dto: UpsertHomeProfileDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.perfilHogar.upsert({
      where: { usuarioId: userId },
      update: {
        tipoVivienda: dto.tipoVivienda,
        tienePatioCerrado: dto.tienePatioCerrado,
        tieneOtrosAnimales: dto.tieneOtrosAnimales,
        aceptaMedicacion: dto.aceptaMedicacion,
        disponibilidadDias: dto.disponibilidadDias,
        activo: true, // HU-011: Guarda en estado activo
      },
      create: {
        usuarioId: userId,
        tipoVivienda: dto.tipoVivienda,
        tienePatioCerrado: dto.tienePatioCerrado,
        tieneOtrosAnimales: dto.tieneOtrosAnimales,
        aceptaMedicacion: dto.aceptaMedicacion,
        disponibilidadDias: dto.disponibilidadDias,
        activo: true,
      },
    });
  }

  // HU-012: Activar o pausar la disponibilidad del hogar
  async toggleActive(userId: string, dto: ToggleAvailabilityDto) {
    const profile = await this.prisma.perfilHogar.findUnique({
      where: { usuarioId: userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'El voluntario no cuenta con un perfil de hogar registrado',
      );
    }

    return this.prisma.perfilHogar.update({
      where: { usuarioId: userId },
      data: { activo: dto.activo },
    });
  }

  // Consultar perfil de un usuario
  async getProfile(userId: string) {
    const profile = await this.prisma.perfilHogar.findUnique({
      where: { usuarioId: userId },
      include: { usuario: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'El usuario no cuenta con un perfil de hogar registrado',
      );
    }

    return profile;
  }

  // HU-014: Formalizar asignación de tránsito
  async assignTransit(dto: CreateTransitAssignmentDto) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: dto.animalId },
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${dto.animalId} no encontrado`);
    }

    if (animal.estado !== EstadoAnimal.RESCATADO) {
      throw new ConflictException(
        `El animal se encuentra en estado ${animal.estado} y no está disponible para asignación`,
      );
    }

    const voluntario = await this.prisma.usuario.findUnique({
      where: { id: dto.voluntarioId },
      include: { perfilHogar: true },
    });

    if (!voluntario) {
      throw new NotFoundException(
        `Voluntario con ID ${dto.voluntarioId} no encontrado`,
      );
    }

    if (voluntario.rol !== Rol.VOLUNTARIO && voluntario.rol !== Rol.ADMIN) {
      throw new BadRequestException(
        'El usuario asignado debe tener rol VOLUNTARIO o ADMIN',
      );
    }

    if (!voluntario.perfilHogar || !voluntario.perfilHogar.activo) {
      throw new BadRequestException(
        'El voluntario debe contar con un perfil de hogar activo y disponible',
      );
    }

    // Reglas duras de compatibilidad básica
    if (animal.requierePatio && !voluntario.perfilHogar.tienePatioCerrado) {
      throw new BadRequestException(
        'Incompatibilidad habitacional: el animal requiere patio y el hogar no dispone de patio cerrado',
      );
    }

    if (animal.necesitaMedicacion && !voluntario.perfilHogar.aceptaMedicacion) {
      throw new BadRequestException(
        'Incompatibilidad clínica: el animal necesita medicación y el voluntario no declaró aceptación de administración médica',
      );
    }

    // Transacción atómica:
    // 1. Crear asignación
    // 2. Animal a EN_TRANSITO
    // 3. HU-014: Pausar disponibilidad del hogar (activo: false)
    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.asignacionTransito.create({
        data: {
          animalId: dto.animalId,
          voluntarioId: dto.voluntarioId,
          estado: EstadoTransito.ACTIVO,
        },
        include: {
          animal: true,
          voluntario: {
            select: { id: true, nombre: true, email: true, telefono: true },
          },
        },
      });

      await tx.animal.update({
        where: { id: dto.animalId },
        data: { estado: EstadoAnimal.EN_TRANSITO },
      });

      await tx.perfilHogar.update({
        where: { usuarioId: dto.voluntarioId },
        data: { activo: false },
      });

      return assignment;
    });
  }

  // Listar tránsitos activos
  async findAllActive() {
    return this.prisma.asignacionTransito.findMany({
      where: { estado: EstadoTransito.ACTIVO },
      include: {
        animal: true,
        voluntario: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async getMyActiveTransit(voluntarioId: string) {
    return this.prisma.asignacionTransito.findFirst({
      where: {
        voluntarioId,
        estado: EstadoTransito.ACTIVO,
      },
      include: {
        animal: true,
      },
    });
  }
}