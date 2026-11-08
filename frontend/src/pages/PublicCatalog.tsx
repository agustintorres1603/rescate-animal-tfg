import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { DonationModal } from '../components/DonationModal';
import { 
  Heart, 
  Target, 
  Calendar, 
  Activity, 
  Loader2, 
  PawPrint,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Animal {
  id: string;
  nombre: string;
  especie: 'PERRO' | 'GATO';
  estadoSalud: string;
}

interface Campaign {
  id: string;
  titulo: string;
  descripcion: string;
  montoObjetivo: number;
  montoRecaudado: number;
  fechaInicio: string;
  fechaFin: string | null;
  activo: boolean;
  animal: Animal;
}

export const PublicCatalog: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el catálogo de campañas médicas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner de Presentación */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white overflow-hidden shadow-lg mb-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            <PawPrint className="w-3.5 h-3.5" />
            Campañas Médicas y Rescates
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Cada aporte salva una vida
          </h1>
          <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Financiamos cirugías, tratamientos prolongados y rehabilitación para los animales rescatados de la comunidad. Tu donación va directo a insumos veterinarios.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Listado de Campañas */}
      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No hay campañas médicas activas en este momento</h3>
          <p className="text-sm text-slate-500 mt-1">
            Los animales en rescate se encuentran cubiertos o no hay colectas de emergencia abiertas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const porcentaje = Math.min(
              100,
              Math.round((camp.montoRecaudado / camp.montoObjetivo) * 100) || 0
            );

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                {/* Header Tarjeta */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {camp.animal.especie} • {camp.animal.nombre}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(camp.fechaInicio).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-800 line-clamp-1">{camp.titulo}</h2>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {camp.descripcion}
                    </p>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Activity className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Estado de salud:</span>{' '}
                        {camp.animal.estadoSalud}
                      </div>
                    </div>
                  </div>

                  {/* Progreso de Recaudación */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        ${camp.montoRecaudado.toLocaleString()}
                      </span>
                      <span className="text-slate-400">
                        Meta: ${camp.montoObjetivo.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <div className="text-right text-[11px] font-semibold text-emerald-600 mt-1">
                      {porcentaje}% completado
                    </div>
                  </div>
                </div>

                {/* Botón de Donar */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setSelectedCampaign(camp)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Donar a esta campaña</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Donación */}
      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSuccess={fetchCampaigns}
        />
      )}
    </div>
  );
};