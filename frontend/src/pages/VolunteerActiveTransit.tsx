import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  HeartHandshake, 
  Calendar, 
  Activity, 
  Pill, 
  Home, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface Animal {
  id: string;
  nombre: string;
  especie: 'PERRO' | 'GATO';
  tamano: 'CHICO' | 'MEDIANO' | 'GRANDE';
  edadAproxMeses: number;
  estadoSalud: string;
  requierePatio: boolean;
  sociablePerros: boolean;
  sociableGatos: boolean;
  necesitaMedicacion: boolean;
}

interface TransitData {
  id: string;
  fechaInicio: string;
  estado: string;
  animal: Animal;
}

export const VolunteerActiveTransit: React.FC = () => {
  const [transit, setTransit] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransit = async () => {
      try {
        const response = await api.get('/transits/my-active');
        setTransit(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al obtener el tránsito activo.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransit();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {transit ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header con estado */}
          <div className="px-6 py-5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Tránsito en Curso</h1>
                <p className="text-xs text-slate-500">
                  Animal asignado bajo tu custodia y cuidado temporal.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Estado: ACTIVO
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Ficha básica */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    {transit.animal.especie}
                  </span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    Tamaño {transit.animal.tamano}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mt-2">
                  {transit.animal.nombre}
                </h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Edad aproximada: {transit.animal.edadAproxMeses} meses ({Math.floor(transit.animal.edadAproxMeses / 12)} años)
                </p>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg border border-slate-200 self-start sm:self-auto">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Fecha de inicio: {new Date(transit.fechaInicio).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Cuidados e Indicaciones Médicas */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>Estado de Salud y Cuidados Requeridos</span>
              </h3>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-amber-900">
                <p className="font-medium">Diagnóstico / Cuidados actuales:</p>
                <p className="mt-1 text-amber-800">{transit.animal.estadoSalud}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  transit.animal.necesitaMedicacion 
                    ? 'bg-red-50/60 border-red-200 text-red-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <Pill className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold">Medicación diaria</p>
                    <p>{transit.animal.necesitaMedicacion ? 'Requiere administración de fármacos' : 'No requiere medicación'}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 flex items-center gap-3">
                  <Home className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold">Requerimiento de espacio</p>
                    <p>{transit.animal.requierePatio ? 'Requiere patio cerrado para dispersión' : 'Apto para interiores sin patio'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full mb-3">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No tenés tránsitos activos actualmente</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Tu hogar está registrado en el sistema. Tan pronto como el administrador formalice una asignación compatible con tus condiciones, verás los datos del rescate aquí.
          </p>
        </div>
      )}
    </div>
  );
};