import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAnimal, EstadoTransito, EstadoDonacion } from '@prisma/client';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    // 1. Deudas Veterinarias y Recaudación (Campañas + Donaciones)
    const campanas = await this.prisma.campanaMedica.findMany({
      select: {
        montoObjetivo: true,
        montoRecaudado: true,
        estado: true,
      },
    });

    const totalObjetivo = campanas.reduce(
      (acc, c) => acc + Number(c.montoObjetivo),
      0,
    );
    const totalSaldado = campanas.reduce(
      (acc, c) => acc + Number(c.montoRecaudado),
      0,
    );
    const totalPendiente = Math.max(0, totalObjetivo - totalSaldado);

    // Donaciones aprobadas vs pendientes de conciliar
    const donacionesAgregadas = await this.prisma.donacion.groupBy({
      by: ['estado'],
      _sum: { monto: true },
      _count: { id: true },
    });

    const pendientesAuditoriaCount =
      donacionesAgregadas.find((d) => d.estado === EstadoDonacion.PENDIENTE)
        ?._count.id || 0;

    // 2. Animales y Estados
    const [totalRescatados, totalEnTransito, totalAdoptados] =
      await Promise.all([
        this.prisma.animal.count({
          where: { estado: EstadoAnimal.RESCATADO },
        }),
        this.prisma.animal.count({
          where: { estado: EstadoAnimal.EN_TRANSITO },
        }),
        this.prisma.animal.count({
          where: { estado: EstadoAnimal.ADOPTADO },
        }),
      ]);

    // 3. Capacidad de la Red de Hogares Temporales
    const [hogaresDisponibles, hogaresOcupados] = await Promise.all([
      this.prisma.perfilHogar.count({
        where: { activo: true },
      }),
      this.prisma.perfilHogar.count({
        where: { activo: false },
      }),
    ]);

    const totalHogares = hogaresDisponibles + hogaresOcupados;

    // 4. Tránsitos activos actualmente
    const transitosActivosCount = await this.prisma.asignacionTransito.count({
      where: { estado: EstadoTransito.ACTIVO },
    });

    return {
      financiero: {
        totalObjetivo,
        totalSaldado,
        totalPendiente,
        porcentajeSaldado:
          totalObjetivo > 0
            ? Math.round((totalSaldado / totalObjetivo) * 100)
            : 0,
        donacionesPendientesAuditoria: pendientesAuditoriaCount,
      },
      animales: {
        rescatados: totalRescatados,
        enTransito: totalEnTransito,
        adoptados: totalAdoptados,
        total: totalRescatados + totalEnTransito + totalAdoptados,
      },
      redVoluntarios: {
        disponibles: hogaresDisponibles,
        ocupados: hogaresOcupados,
        totalHogares,
        transitosEnCurso: transitosActivosCount,
      },
    };
  }
}