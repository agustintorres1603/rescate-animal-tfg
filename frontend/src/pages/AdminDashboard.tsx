import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  DollarSign, 
  HeartHandshake, 
  Home, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  PawPrint,
  ShieldAlert
} from 'lucide-react';

interface DashboardMetrics {
  financiero: {
    totalObjetivo: number;
    totalSaldado: number;
    totalPendiente: number;
    porcentajeSaldado: number;
    donacionesPendientesAuditoria: number;
  };
  animales: {
    rescatados: number;
    enTransito: number;
    adoptados: number;
    total: number;
  };
  redVoluntarios: {
    disponibles: number;
    ocupados: number;
    totalHogares: number;
    transitosEnCurso: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await api.get('/metrics/dashboard');
      setMetrics(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener las métricas consolidadas.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Tablero de Métricas Operativas</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Trazabilidad consolidada de deudas veterinarias, situación de rescates y capacidad de la red de hogares.
          </p>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar Indicadores</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {metrics && (
        <>
          {/* BLOQUE 1: TRAZABILIDAD DE DEUDAS VETERINARIAS */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Balance de Pasivos Clínicos y Recaudación</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Presupuestado */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <span className="text-xs font-medium text-slate-400 block">Presupuesto Clínico Total</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  ${metrics.financiero.totalObjetivo.toLocaleString('es-AR')}
                </p>
                <span className="text-[11px] text-slate-400 mt-2 block">
                  Metas acumuladas de todas las campañas
                </span>
              </div>

              {/* Total Saldado */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 shadow-2xs">
                <span className="text-xs font-medium text-emerald-800 block">Deuda Saldada (Recaudado)</span>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  ${metrics.financiero.totalSaldado.toLocaleString('es-AR')}
                </p>
                <span className="text-[11px] text-emerald-600 mt-2 block">
                  {metrics.financiero.porcentajeSaldado}% del pasivo médico cubierto
                </span>
              </div>

              {/* Saldo Pendiente */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 shadow-2xs">
                <span className="text-xs font-medium text-rose-800 block">Deuda Veterinaria Pendiente</span>
                <p className="text-2xl font-bold text-rose-700 mt-1">
                  ${metrics.financiero.totalPendiente.toLocaleString('es-AR')}
                </p>
                <span className="text-[11px] text-rose-600 mt-2 block">
                  Compromisos médicos por recaudar
                </span>
              </div>

              {/* Donaciones a Auditar */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 shadow-2xs">
                <span className="text-xs font-medium text-amber-800 block">Comprobantes por Auditar</span>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {metrics.financiero.donacionesPendientesAuditoria}
                </p>
                <span className="text-[11px] text-amber-600 mt-2 block">
                  Transferencias pendientes de conciliación
                </span>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: SITUACIÓN DE RESCATES Y RED DE HOGARES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Animales por Estado */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-indigo-600" />
                  <span>Estado de los Rescates</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Total: {metrics.animales.total}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">En espera de hogar (RESCATADO)</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{metrics.animales.rescatados}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-900">En custodia temporal (EN_TRANSITO)</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-700">{metrics.animales.enTransito}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-900">Ubicados definitivamente (ADOPTADO)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">{metrics.animales.adoptados}</span>
                </div>
              </div>
            </div>

            {/* Capacidad Activa de la Red de Hogares */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Home className="w-4 h-4 text-indigo-600" />
                  <span>Capacidad de la Red de Hogares</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Total registrados: {metrics.redVoluntarios.totalHogares}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-900">Hogares disponibles (elegibles para matching)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">{metrics.redVoluntarios.disponibles}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Hogares ocupados o en pausa</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{metrics.redVoluntarios.ocupados}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50/40 rounded-xl">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-900">Tránsitos activos en curso</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-700">{metrics.redVoluntarios.transitosEnCurso}</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};