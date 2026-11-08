import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';
import { EstadoCampana, EstadoDonacion } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDonationDto: CreateDonationDto) {
    const campaign = await this.prisma.campanaMedica.findUnique({
      where: { id: createDonationDto.campanaId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaña con ID ${createDonationDto.campanaId} no encontrada`);
    }

    if (campaign.estado === EstadoCampana.FINALIZADA) {
      throw new BadRequestException('No se pueden registrar donaciones en una campaña finalizada');
    }

    const existingCode = await this.prisma.donacion.findUnique({
      where: { codigoTransaccion: createDonationDto.codigoTransaccion },
    });

    if (existingCode) {
      throw new ConflictException('Ya existe una donación registrada con ese código de transacción');
    }

    return this.prisma.donacion.create({
      data: {
        campanaId: createDonationDto.campanaId,
        usuarioId: createDonationDto.usuarioId,
        monto: createDonationDto.monto,
        codigoTransaccion: createDonationDto.codigoTransaccion,
        comprobanteUrl: createDonationDto.comprobanteUrl,
        estado: EstadoDonacion.PENDIENTE,
      },
    });
  }

  async updateStatus(id: string, updateDto: UpdateDonationStatusDto) {
    const donacion = await this.prisma.donacion.findUnique({
      where: { id },
      include: { campana: true },
    });

    if (!donacion) {
      throw new NotFoundException(`Donación con ID ${id} no encontrada`);
    }

    if (donacion.estado !== EstadoDonacion.PENDIENTE) {
      throw new BadRequestException('Solo se pueden actualizar donaciones en estado PENDIENTE');
    }

    // Transacción atómica
    return this.prisma.$transaction(async (tx) => {
      const updatedDonation = await tx.donacion.update({
        where: { id },
        data: { estado: updateDto.estado },
      });

      if (updateDto.estado === EstadoDonacion.APROBADA) {
        const nuevoRecaudado = Number(donacion.campana.montoRecaudado) + Number(donacion.monto);
        const objetivo = Number(donacion.campana.montoObjetivo);

        await tx.campanaMedica.update({
          where: { id: donacion.campanaId },
          data: {
            montoRecaudado: { increment: donacion.monto },
            estado: nuevoRecaudado >= objetivo ? EstadoCampana.FINALIZADA : EstadoCampana.ACTIVA,
          },
        });
      }

      return updatedDonation;
    });
  }

  async findByCampaign(campanaId: string) {
    return this.prisma.donacion.findMany({
      where: { campanaId },
      orderBy: { fechaDonacion: 'desc' },
    });
  }

  async findMyDonations(usuarioId: string) {
    return this.prisma.donacion.findMany({
      where: { usuarioId },
      include: {
        campana: {
          include: {
            animal: {
              select: {
                nombre: true,
                especie: true,
              },
            },
          },
        },
      },
      orderBy: { fechaDonacion: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.donacion.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        campana: {
          include: {
            animal: {
              select: {
                nombre: true,
                especie: true,
              },
            },
          },
        },
      },
      orderBy: { fechaDonacion: 'desc' },
    });
  }
}