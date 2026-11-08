import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  FileText,
  DollarSign,
  Filter
} from 'lucide-react';

interface DonationAuditItem {
  id: string;
  monto: number;
  codigoTransaccion: string;
  comprobanteUrl: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fechaDonacion: string;
  usuario?: {
    nombre: string;
    email: string;
    telefono: string | null;
  } | null;
  campana: {
    titulo: string;
    animal: {
      nombre: string;
      especie: string;
    };
  };
}

export const AdminDonations: React.FC = () => {
  const [donations, setDonations] = useState<DonationAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'TODAS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('PENDIENTE');

  const fetchDonations = async () => {
    try {
      const response = await api.get('/donations');
      setDonations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener las donaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Apertura segura de comprobantes adjuntos
  const handleOpenDocument = (dataUrl: string) => {
    if (!dataUrl.startsWith('data:')) {
      window.open(dataUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const [header, base64Data] = dataUrl.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error al abrir comprobante:', err);
    }
  };

  const handleUpdateStatus = async (id: string, nuevoEstado: 'APROBADA' | 'RECHAZADA') => {
    setActionLoading(id);
    setError(null);
    try {
      await api.patch(`/donations/${id}/status`, { estado: nuevoEstado });
      await fetchDonations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el estado de la donación.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (filter === 'TODAS') return true;
    return d.estado === filter;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabecera */}
      <div className="sm:flex sm:items-center sm:justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Auditoría de Donaciones y Comprobantes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Validá las transferencias bancarias recibidas para impactar en las metas de las campañas médicas.
          </p>
        </div>

        {/* Filtros */}
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-1.5 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PENDIENTE">Pendientes de revisión</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="RECHAZADA">Rechazadas</option>
            <option value="TODAS">Todas las donaciones</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Auditoría */}
      {filteredDonations.length === 0 ? (
        <div className="mt-10 text-center py-14 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No hay donaciones en esta categoría</h3>
          <p className="text-xs text-slate-500 mt-1">
            No se encontraron registros bajo el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Donante / Contacto</th>
                  <th className="px-6 py-3.5">Campaña y Animal</th>
                  <th className="px-6 py-3.5">Monto</th>
                  <th className="px-6 py-3.5">Comprobante y Código</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Donante */}
                    <td className="px-6 py-4">
                      {d.usuario ? (
                        <div>
                          <p className="font-semibold text-slate-800">{d.usuario.nombre}</p>
                          <p className="text-xs text-slate-500">{d.usuario.email}</p>
                          {d.usuario.telefono && (
                            <p className="text-[11px] text-slate-400">Tel: {d.usuario.telefono}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Donante Anónimo</span>
                      )}
                    </td>

                    {/* Campaña */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 line-clamp-1">{d.campana.titulo}</p>
                      <span className="inline-block mt-0.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                        {d.campana.animal.nombre} ({d.campana.animal.especie})
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ${Number(d.monto).toLocaleString('es-AR')}
                    </td>

                    {/* Comprobante */}
                    <td className="px-6 py-4">
                      <span className="block text-xs font-mono font-medium text-slate-700">
                        {d.codigoTransaccion}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenDocument(d.comprobanteUrl)}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold mt-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver Comprobante</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      {d.estado === 'PENDIENTE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}
                      {d.estado === 'APROBADA' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Aprobada
                        </span>
                      )}
                      {d.estado === 'RECHAZADA' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          Rechazada
                        </span>
                      )}
                    </td>

                    {/* Botones de Acción */}
                    <td className="px-6 py-4 text-right">
                      {d.estado === 'PENDIENTE' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(d.id, 'APROBADA')}
                            disabled={actionLoading === d.id}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === d.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>Aprobar</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(d.id, 'RECHAZADA')}
                            disabled={actionLoading === d.id}
                            className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-rose-200 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Auditada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};