import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  Award, 
  Home, 
  HeartHandshake,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';

interface MatchItem {
  animalId: string;
  animalNombre: string;
  animalEspecie: string;
  animalTamano?: string;
  animalEstadoSalud?: string;
  voluntarioId: string;
  voluntarioNombre: string;
  voluntarioEmail?: string;
  voluntarioTelefono?: string | null;
  score: number;
}

interface UnmatchedAnimal {
  animalId: string;
  animalNombre: string;
  animalEspecie: string;
  motivo: string;
}

interface ActiveTransit {
  id: string;
  fechaInicio: string;
  animal: {
    id: string;
    nombre: string;
    especie: string;
    estado: string;
    estadoSalud: string;
  };
  voluntario: {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
  };
}

export const AdminMatching: React.FC = () => {
  const [loadingSimulate, setLoadingSimulate] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [loadingApplyAll, setLoadingApplyAll] = useState(false);
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [unmatched, setUnmatched] = useState<UnmatchedAnimal[]>([]);
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tránsitos activos
  const [activeTransits, setActiveTransits] = useState<ActiveTransit[]>([]);
  const [loadingTransits, setLoadingTransits] = useState(true);
  const [adoptingId, setAdoptingId] = useState<string | null>(null);
  const [adoptionSuccess, setAdoptionSuccess] = useState<string | null>(null);

  const fetchActiveTransits = async () => {
    try {
      const response = await api.get('/transits/active');
      setActiveTransits(response.data);
    } catch (err: any) {
      console.error('Error al cargar tránsitos activos:', err);
    } finally {
      setLoadingTransits(false);
    }
  };

  useEffect(() => {
    fetchActiveTransits();
  }, []);

  // 1. Simulación Algorítmica (Gale-Shapley - HU-013)
  const handleSimulate = async () => {
    setError(null);
    setAppliedSuccess(null);
    setAdoptionSuccess(null);
    setLoadingSimulate(true);

    try {
      const response = await api.get('/matching/simulate');
      if (response.data && response.data.matches) {
        setMatches(response.data.matches);
        setUnmatched(response.data.unmatched || []);
      } else if (Array.isArray(response.data)) {
        setMatches(response.data);
        setUnmatched([]);
      } else {
        setMatches([]);
        setUnmatched([]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al ejecutar la simulación de emparejamiento.'
      );
    } finally {
      setLoadingSimulate(false);
    }
  };

  // 2. Confirmación individual por fila (HU-014)
  const handleApplySingle = async (match: MatchItem) => {
    setApplyingId(match.animalId);
    setError(null);
    setAppliedSuccess(null);

    try {
      // Endpoint dedicado para formalizar un solo caso
      await api.post('/matching/apply-one', {
        animalId: match.animalId,
        voluntarioId: match.voluntarioId,
      });

      // Removemos únicamente este match de la previsualización local
      setMatches((prev) => (prev ? prev.filter((m) => m.animalId !== match.animalId) : []));
      setAppliedSuccess(`¡Asignación formalizada! ${match.animalNombre} fue asignado a ${match.voluntarioNombre}.`);
      await fetchActiveTransits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al confirmar la asignación individual.');
    } finally {
      setApplyingId(null);
    }
  };

  // 3. Confirmación masiva de todas las parejas restantes
  const handleApplyAll = async () => {
    if (!matches || matches.length === 0) return;

    setError(null);
    setLoadingApplyAll(true);
    setAppliedSuccess(null);

    try {
      // Endpoint dedicado para formalizar todos los casos restantes
      await api.post('/matching/apply-all');
      setAppliedSuccess('¡Todas las asignaciones propuestas fueron formalizadas con éxito!');
      setMatches(null);
      setUnmatched([]);
      await fetchActiveTransits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al aplicar todas las asignaciones.');
    } finally {
      setLoadingApplyAll(false);
    }
  };

  // 4. Registro de Adopción Definitiva
  const handleAdopt = async (animalId: string, animalNombre: string) => {
    const confirmed = window.confirm(
      `¿Confirmás la adopción definitiva de ${animalNombre}? Esto finalizará el tránsito activo y liberará el hogar del voluntario.`
    );
    if (!confirmed) return;

    setAdoptingId(animalId);
    setError(null);
    setAdoptionSuccess(null);

    try {
      await api.patch(`/animals/${animalId}/adopt`);
      setAdoptionSuccess(
        `¡${animalNombre} fue adoptado definitivamente! El hogar del voluntario ya se encuentra disponible para nuevas asignaciones.`
      );
      await fetchActiveTransits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la adopción.');
    } finally {
      setAdoptingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>Coordinación de Tránsitos y Adopciones</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Asignación Inteligente
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Simulá sugerencias de hogares para rescates, formalizá asignaciones caso a caso o en conjunto y registrá adopciones.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loadingSimulate || loadingApplyAll || applyingId !== null}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loadingSimulate ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>Ejecutar Simulación</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {appliedSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">{appliedSuccess}</p>
            <p className="text-emerald-700 text-xs mt-0.5">
              El animal pasó a <strong>EN_TRANSITO</strong> y el hogar temporal quedó pausado.
            </p>
          </div>
        </div>
      )}

      {adoptionSuccess && (
        <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-teal-600" />
          <div>
            <p className="font-semibold">{adoptionSuccess}</p>
            <p className="text-teal-700 text-xs mt-0.5">{adoptionSuccess}</p>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: TRÁNSITOS ACTIVOS EN CURSO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600" />
            <span>Tránsitos Activos en Curso ({activeTransits.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Hogares ocupados actualmente con animales en recuperación
          </span>
        </div>

        {loadingTransits ? (
          <div className="py-10 flex justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : activeTransits.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No hay tránsitos activos en curso</p>
            <p className="text-xs text-slate-400 mt-1">
              Todos los voluntarios registrados se encuentran disponibles o no hay animales asignados.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Animal en Tránsito</th>
                    <th className="px-6 py-3.5">Hogar / Voluntario</th>
                    <th className="px-6 py-3.5">Contacto</th>
                    <th className="px-6 py-3.5">Fecha Asignación</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeTransits.map((transit) => (
                    <tr key={transit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{transit.animal.nombre}</p>
                        <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                          {transit.animal.especie}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{transit.animal.estadoSalud}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{transit.voluntario.nombre}</p>
                        <p className="text-xs text-slate-400">{transit.voluntario.email}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {transit.voluntario.telefono || 'Sin teléfono'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(transit.fechaInicio).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleAdopt(transit.animal.id, transit.animal.nombre)}
                          disabled={adoptingId === transit.animal.id}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {adoptingId === transit.animal.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <HeartHandshake className="w-3.5 h-3.5" />
                          )}
                          <span>Registrar Adopción</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: RESULTADOS DE LA SIMULACIÓN (HU-013 & HU-014) */}
      {matches !== null && (
        <div className="space-y-8 pt-6 border-t border-slate-200">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Parejas Propuestas ({matches.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Podés confirmar cada asignación individualmente o aplicar todas juntas.
                </p>
              </div>

              {matches.length > 1 && (
                <button
                  onClick={handleApplyAll}
                  disabled={loadingApplyAll || applyingId !== null}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loadingApplyAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Confirmar Todas Juntas</span>
                </button>
              )}
            </div>

            {matches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Animal Rescatado</th>
                      <th className="px-6 py-3 text-center">Compatibilidad</th>
                      <th className="px-6 py-3 text-center">Vínculo</th>
                      <th className="px-6 py-3">Hogar Propuesto (Contacto)</th>
                      <th className="px-6 py-3 text-right">Acción Individual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {matches.map((m) => (
                      <tr key={m.animalId} className="hover:bg-slate-50/80 transition-colors">
                        {/* Animal */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{m.animalNombre}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              m.animalEspecie === 'PERRO'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {m.animalEspecie}
                            </span>
                          </div>
                          {m.animalEstadoSalud && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{m.animalEstadoSalud}</p>
                          )}
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full">
                            <Award className="w-3.5 h-3.5 text-indigo-500" />
                            {m.score} pts
                          </span>
                        </td>

                        {/* Flecha */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center p-1.5 bg-indigo-50 text-indigo-600 rounded-full">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </td>

                        {/* Contacto Voluntario */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{m.voluntarioNombre}</p>
                          <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                            {m.voluntarioEmail && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {m.voluntarioEmail}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {m.voluntarioTelefono || 'Sin teléfono registrado'}
                            </span>
                          </div>
                        </td>

                        {/* Botón Individual HU-014 */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleApplySingle(m)}
                            disabled={applyingId === m.animalId || loadingApplyAll}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                          >
                            {applyingId === m.animalId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Confirmar Asignación</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No quedan parejas pendientes de confirmación.</p>
              </div>
            )}
          </div>

          {/* Sin compatibilidad */}
          {unmatched.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <h3 className="text-base font-bold text-amber-900">
                  Animales Sin Compatibilidad Disponible ({unmatched.length})
                </h3>
              </div>
              <p className="text-xs text-amber-800">
                Los siguientes animales en estado <strong>RESCATADO</strong> no encontraron un hogar compatible debido a restricciones de espacio, medicación o convivencia:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {unmatched.map((u) => (
                  <div 
                    key={u.animalId} 
                    className="p-3.5 bg-white border border-amber-200 rounded-xl flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{u.animalNombre}</span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {u.animalEspecie}
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">{u.motivo}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-full flex-shrink-0">
                      Sin compatibilidad disponible
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado Inicial */}
      {matches === null && !appliedSuccess && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/40">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full mb-3">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Simulación pendiente</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Presioná "Ejecutar Simulación" arriba a la derecha para calcular emparejamientos con los animales en estado RESCATADO.
          </p>
        </div>
      )}
    </div>
  );
};