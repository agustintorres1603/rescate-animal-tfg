import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAnimalDto: CreateAnimalDto) {
    return this.prisma.animal.create({
      data: createAnimalDto,
    });
  }

  async findAll() {
    return this.prisma.animal.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: {
        campanas: true,
        transitos: {
          include: { voluntario: true },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${id} no encontrado`);
    }

    return animal;
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto) {
    await this.findOne(id);

    return this.prisma.animal.update({
      where: { id },
      data: updateAnimalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.animal.delete({
      where: { id },
    });
  }

  async adopt(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({
        where: { id },
      });

      if (!animal) {
        throw new NotFoundException(`Animal con ID ${id} no encontrado`);
      }

      if (animal.estado === 'ADOPTADO') {
        throw new BadRequestException('El animal ya se encuentra registrado como adoptado');
      }

      const activeTransit = await tx.asignacionTransito.findFirst({
        where: {
          animalId: id,
          estado: 'ACTIVO',
        },
      });

      if (activeTransit) {
        await tx.asignacionTransito.update({
          where: { id: activeTransit.id },
          data: {
            estado: 'FINALIZADO',
            fechaFin: new Date(),
          },
        });

        await tx.perfilHogar.updateMany({
          where: { usuarioId: activeTransit.voluntarioId },
          data: { activo: true },
        });
      }

      const updatedAnimal = await tx.animal.update({
        where: { id },
        data: {
          estado: 'ADOPTADO',
        },
      });

      return {
        message: 'Adopción completada con éxito. Asignación de tránsito finalizada.',
        animal: updatedAnimal,
      };
    });
  }
}