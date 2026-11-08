import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Heart, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface DonationItem {
  id: string;
  monto: number;
  codigoTransaccion: string;
  comprobanteUrl: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fechaDonacion: string;
  campana: {
    titulo: string;
    animal?: {
      nombre: string;
      especie: string;
    };
  };
}

export const DonorDonations: React.FC = () => {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await api.get('/donations/my-donations');
        setDonations(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar tus donaciones.');
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderBadge = (estado: DonationItem['estado']) => {
    switch (estado) {
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprobada
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            En Revisión
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-current" />
          <span>Mis Aportes Solidarios</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Seguimiento del estado de tus comprobantes y el impacto en las campañas médicas.
        </p>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {donations.length === 0 ? (
        <div className="mt-12 text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-700">Aún no registraste ninguna donación</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Podés visitar el catálogo público para colaborar con los tratamientos médicos de nuestros rescates.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Campaña / Rescate</th>
                  <th className="px-6 py-3.5">Monto</th>
                  <th className="px-6 py-3.5">Comprobante</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{d.campana.titulo}</p>
                      {d.campana.animal && (
                        <p className="text-xs text-indigo-600 font-medium">
                          Beneficiario: {d.campana.animal.nombre} ({d.campana.animal.especie})
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ${Number(d.monto).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-xs font-mono text-slate-500">Ref: {d.codigoTransaccion}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenDocument(d.comprobanteUrl)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5 cursor-pointer font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver comprobante</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderBadge(d.estado)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(d.fechaDonacion).toLocaleDateString()}
                      </span>
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