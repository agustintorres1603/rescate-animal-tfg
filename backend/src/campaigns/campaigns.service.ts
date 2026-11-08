import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCampaignDto: CreateCampaignDto) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: createCampaignDto.animalId },
    });

    if (!animal) {
      throw new NotFoundException(`Animal con ID ${createCampaignDto.animalId} no encontrado`);
    }

    return this.prisma.campanaMedica.create({
      data: {
        animalId: createCampaignDto.animalId,
        titulo: createCampaignDto.titulo,
        descripcion: createCampaignDto.descripcion,
        montoObjetivo: createCampaignDto.montoObjetivo,
        facturaUrl: createCampaignDto.facturaUrl,
      },
      include: { animal: true },
    });
  }

  async findAll() {
    return this.prisma.campanaMedica.findMany({
      include: { animal: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campanaMedica.findUnique({
      where: { id },
      include: {
        animal: true,
        donaciones: {
          where: { estado: 'APROBADA' },
          orderBy: { fechaDonacion: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaña con ID ${id} no encontrada`);
    }

    return campaign;
  }
}