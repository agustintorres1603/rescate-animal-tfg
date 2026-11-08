import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Animal, PerfilHogar, Usuario, EstadoAnimal, Tamano, TipoVivienda } from '@prisma/client';

export type VolunteerWithProfile = Usuario & { perfilHogar: PerfilHogar };

export interface MatchProposal {
  animalId: string;
  animalNombre: string;
  animalEspecie: string;
  animalTamano: string;
  animalEstadoSalud: string;
  voluntarioId: string;
  voluntarioNombre: string;
  voluntarioEmail: string;
  voluntarioTelefono: string | null;
  score: number;
}

export interface UnmatchedAnimal {
  animalId: string;
  animalNombre: string;
  animalEspecie: string;
  motivo: string;
}

export interface MatchingResult {
  matches: MatchProposal[];
  unmatched: UnmatchedAnimal[];
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula el puntaje de compatibilidad entre un animal y el perfil de un voluntario.
   * Retorna un score entre 0 y 100. Si retorna 0, son incompatibles.
   */
  calculateCompatibility(animal: Animal, hogar: PerfilHogar): number {
    // 1. RESTRICCIONES DURAS (Excluyentes)
    if (animal.requierePatio && !hogar.tienePatioCerrado) {
      return 0;
    }
    if (animal.necesitaMedicacion && !hogar.aceptaMedicacion) {
      return 0;
    }
    if (!animal.sociablePerros && !animal.sociableGatos && hogar.tieneOtrosAnimales) {
      return 0;
    }

    let score = 50; // Base de compatibilidad aprobada

    // 2. REGLAS BLANDAS (Ponderación)
    if (hogar.tipoVivienda === TipoVivienda.CASA && hogar.tienePatioCerrado) {
      if (animal.tamano === Tamano.GRANDE || animal.tamano === Tamano.MEDIANO) {
        score += 20;
      } else {
        score += 10;
      }
    } else if (hogar.tipoVivienda === TipoVivienda.DEPARTAMENTO) {
      if (animal.tamano === Tamano.CHICO) {
        score += 20;
      } else if (animal.tamano === Tamano.GRANDE) {
        score -= 15;
      }
    }

    if (animal.necesitaMedicacion && hogar.aceptaMedicacion) {
      score += 15;
    }

    if (hogar.disponibilidadDias >= 30) {
      score += 15;
    } else if (hogar.disponibilidadDias >= 15) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Algoritmo de Gale-Shapley (Deferred Acceptance) - HU-013
   */
  async runMatching(): Promise<MatchingResult> {
    // 1. Obtener animales disponibles (estado RESCATADO)
    const animales = await this.prisma.animal.findMany({
      where: { estado: EstadoAnimal.RESCATADO },
    });

    // 2. Obtener voluntarios activos que tengan perfil de hogar disponible y sin tránsito activo
    const voluntarios = await this.prisma.usuario.findMany({
      where: {
        perfilHogar: { activo: true },
        transitos: { none: { estado: 'ACTIVO' } },
      },
      include: { perfilHogar: true },
    });

    if (animales.length === 0 || voluntarios.length === 0) {
      return {
        matches: [],
        unmatched: animales.map((a) => ({
          animalId: a.id,
          animalNombre: a.nombre,
          animalEspecie: a.especie,
          motivo: 'No hay voluntarios activos y disponibles en la red.',
        })),
      };
    }

    // 3. Matriz de preferencias de Animales -> Hogares
    const animalPreferences = new Map<string, { voluntarioId: string; score: number }[]>();

    for (const animal of animales) {
      const prefs: { voluntarioId: string; score: number }[] = [];
      for (const vol of voluntarios) {
        const score = this.calculateCompatibility(animal, vol.perfilHogar!);
        if (score > 0) {
          prefs.push({ voluntarioId: vol.id, score });
        }
      }
      prefs.sort((a, b) => b.score - a.score);
      animalPreferences.set(animal.id, prefs);
    }

    // 4. Matriz de scores Hogares -> Animales
    const volunteerScores = new Map<string, Map<string, number>>();
    for (const vol of voluntarios) {
      const scoreMap = new Map<string, number>();
      for (const animal of animales) {
        scoreMap.set(animal.id, this.calculateCompatibility(animal, vol.perfilHogar!));
      }
      volunteerScores.set(vol.id, scoreMap);
    }

    // 5. Ejecución Gale-Shapley
    const freeAnimals = animales.map((a) => a.id);
    const tentativeEngagements = new Map<string, { animalId: string; score: number }>();
    const nextProposalIndex = new Map<string, number>();
    animales.forEach((a) => nextProposalIndex.set(a.id, 0));

    while (freeAnimals.length > 0) {
      const animalId = freeAnimals.shift()!;
      const prefs = animalPreferences.get(animalId) || [];
      const proposalIdx = nextProposalIndex.get(animalId) || 0;

      if (proposalIdx >= prefs.length) {
        // El animal agotó sus opciones compatibles
        continue;
      }

      const candidate = prefs[proposalIdx];
      nextProposalIndex.set(animalId, proposalIdx + 1);

      const voluntarioId = candidate.voluntarioId;
      const currentEngagement = tentativeEngagements.get(voluntarioId);

      if (!currentEngagement) {
        tentativeEngagements.set(voluntarioId, { animalId, score: candidate.score });
      } else {
        const volScoreMap = volunteerScores.get(voluntarioId)!;
        const currentScore = volScoreMap.get(currentEngagement.animalId) || 0;
        const newScore = candidate.score;

        if (newScore > currentScore) {
          freeAnimals.push(currentEngagement.animalId);
          tentativeEngagements.set(voluntarioId, { animalId, score: newScore });
        } else {
          freeAnimals.push(animalId);
        }
      }
    }

    // 6. Formatear la lista de propuestas finales con datos completos de contacto (HU-014)
    const matches: MatchProposal[] = [];
    const matchedAnimalIds = new Set<string>();

    for (const [voluntarioId, engagement] of tentativeEngagements.entries()) {
      const animal = animales.find((a) => a.id === engagement.animalId);
      const voluntario = voluntarios.find((v) => v.id === voluntarioId);

      if (animal && voluntario) {
        matchedAnimalIds.add(animal.id);
        matches.push({
          animalId: animal.id,
          animalNombre: animal.nombre,
          animalEspecie: animal.especie,
          animalTamano: animal.tamano,
          animalEstadoSalud: animal.estadoSalud,
          voluntarioId: voluntario.id,
          voluntarioNombre: voluntario.nombre,
          voluntarioEmail: voluntario.email,
          voluntarioTelefono: voluntario.telefono,
          score: engagement.score,
        });
      }
    }

    // 7. HU-013 Criterio 2: Identificar animales sin compatibilidad disponible
    const unmatched: UnmatchedAnimal[] = animales
      .filter((a) => !matchedAnimalIds.has(a.id))
      .map((a) => {
        const prefs = animalPreferences.get(a.id) || [];
        const motivo =
          prefs.length === 0
            ? 'Sin compatibilidad con las restricciones técnicas de los hogares activos.'
            : 'Los hogares compatibles fueron asignados a candidatos con mayor ponderación.';
        return {
          animalId: a.id,
          animalNombre: a.nombre,
          animalEspecie: a.especie,
          motivo,
        };
      });

    return { matches, unmatched };
  }

  /**
   * HU-014: Formaliza una asignación individual seleccionada por el coordinador
   */
  async applySingleMatch(animalId: string, voluntarioId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el registro formal en asignaciones_transito
      const assignment = await tx.asignacionTransito.create({
        data: {
          animalId,
          voluntarioId,
          estado: 'ACTIVO',
        },
        include: {
          animal: true,
          voluntario: {
            select: { id: true, nombre: true, email: true, telefono: true },
          },
        },
      });

      // 2. Cambiar estado del animal a EN_TRANSITO
      await tx.animal.update({
        where: { id: animalId },
        data: { estado: EstadoAnimal.EN_TRANSITO },
      });

      // 3. Pausar disponibilidad del hogar (activo: false)
      await tx.perfilHogar.update({
        where: { usuarioId: voluntarioId },
        data: { activo: false },
      });

      return assignment;
    });
  }

  /**
   * HU-014: Formalizar asignaciones propuestas de forma masiva
   */
  async applyMatching(selectedAnimalIds?: string[]): Promise<{ appliedCount: number }> {
    const { matches } = await this.runMatching();

    const toApply = selectedAnimalIds
      ? matches.filter((m) => selectedAnimalIds.includes(m.animalId))
      : matches;

    if (toApply.length === 0) {
      return { appliedCount: 0 };
    }

    await this.prisma.$transaction(async (tx) => {
      for (const proposal of toApply) {
        // 1. Crear registro formal en asignaciones_transito
        await tx.asignacionTransito.create({
          data: {
            animalId: proposal.animalId,
            voluntarioId: proposal.voluntarioId,
            estado: 'ACTIVO',
          },
        });

        // 2. Cambiar estado del animal a EN_TRANSITO
        await tx.animal.update({
          where: { id: proposal.animalId },
          data: { estado: EstadoAnimal.EN_TRANSITO },
        });

        // 3. Pausar disponibilidad del hogar (HU-014 Criterio 1)
        await tx.perfilHogar.update({
          where: { usuarioId: proposal.voluntarioId },
          data: { activo: false },
        });
      }
    });

    return { appliedCount: toApply.length };
  }
}