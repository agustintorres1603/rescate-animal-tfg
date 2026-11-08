export type Rol = 'ADMIN' | 'VOLUNTARIO' | 'DONANTE';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Animal {
  id: string;
  nombre: string;
  especie: string;
  tamano: 'CHICO' | 'MEDIANO' | 'GRANDE';
  edadEstimada?: number;
  estado: 'RESCATADO' | 'EN_TRANSITO' | 'ADOPTADO';
  requiereMedicacion: boolean;
  createdAt: string;
}

export interface HomeProfile {
  id?: string;
  tipoVivienda: 'CASA' | 'DEPARTAMENTO' | 'QUINTA';
  tienePatioCerrado: boolean;
  tieneOtrosAnimales: boolean;
  aceptaMedicacion: boolean;
  disponibilidadDias: number;
  activo?: boolean;
}

export interface Campaign {
  id: string;
  animalId: string;
  titulo: string;
  descripcion: string;
  montoObjetivo: number;
  montoRecaudado: number;
  estado: 'ACTIVA' | 'COMPLETADA' | 'CANCELADA';
  animal?: Animal;
}

export interface MatchingResult {
  matches: Array<{
    animalId: string;
    animalNombre: string;
    voluntarioId: string;
    voluntarioNombre: string;
    score?: number;
  }>;
  unmatchedAnimals: Array<{ id: string; nombre: string }>;
  unmatchedVolunteers: Array<{ id: string; nombre: string }>;
}