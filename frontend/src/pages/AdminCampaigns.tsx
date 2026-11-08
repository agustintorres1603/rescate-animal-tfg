import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  HeartHandshake, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  DollarSign, 
  ExternalLink, 
  X,
  Target,
  Sparkles,
  UploadCloud
} from 'lucide-react';

interface Animal {
  id: string;
  nombre: string;
  especie: string;
  estadoSalud: string;
  estado: string;
}

interface Campaign {
  id: string;
  titulo: string;
  descripcion: string;
  montoObjetivo: string | number;
  montoRecaudado: string | number;
  estado: 'ACTIVA' | 'FINALIZADA';
  facturaUrl?: string;
  createdAt: string;
  animal: {
    id: string;
    nombre: string;
    especie: string;
    estadoSalud: string;
  };
}

export const AdminCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [animalId, setAnimalId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState<number | ''>('');
  const [facturaUrl, setFacturaUrl] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resCampaigns, resAnimals] = await Promise.all([
        api.get('/campaigns'),
        api.get('/animals'),
      ]);
      setCampaigns(resCampaigns.data);
      setAnimals(resAnimals.data);
    } catch (err: any) {
      setError('Error al cargar la información de campañas y animales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setAnimalId('');
    setTitulo('');
    setDescripcion('');
    setMontoObjetivo('');
    setFacturaUrl('');
    setFileName(null);
    setError(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Manejo de carga de presupuesto/factura (PDF o imagen a Base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Por favor adjuntá un documento PDF o una imagen (JPG/PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo seleccionado supera el límite máximo de 5 MB.');
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFacturaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Apertura segura de comprobantes adjuntos (evita pestaña en negro de Chrome/Edge)
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
      console.error('Error al abrir el documento adjunto:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validación Criterio 2: Monto objetivo menor o igual a cero
    if (montoObjetivo === '' || Number(montoObjetivo) <= 0) {
      setError('El importe del monto objetivo debe ser mayor a cero.');
      return;
    }

    if (!animalId) {
      setError('Tenés que seleccionar un animal para asociar la campaña.');
      return;
    }

    if (!titulo.trim() || !descripcion.trim()) {
      setError('El título y la descripción son obligatorios.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/campaigns', {
        animalId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        montoObjetivo: Number(montoObjetivo),
        facturaUrl: facturaUrl.trim() || undefined,
      });

      setSuccess(`Campaña "${titulo}" publicada con éxito en estado ACTIVA.`);
      setIsModalOpen(false);
      resetForm();
      await loadData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al publicar la campaña.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>Campañas de Recaudación Médica</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Financiamiento Clínico
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Creá y publicá colectas asociadas a intervenciones quirúrgicas o tratamientos veterinarios.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Campaña</span>
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Listado de Campañas */}
      {loading ? (
        <div className="py-12 flex justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No hay campañas de recaudación activas</p>
          <p className="text-xs text-slate-400 mt-1">
            Publicá la primera campaña presionando el botón "Publicar Campaña".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const objetivo = Number(camp.montoObjetivo);
            const recaudado = Number(camp.montoRecaudado);
            const porcentaje = objetivo > 0 ? Math.min(100, Math.round((recaudado / objetivo) * 100)) : 0;

            return (
              <div 
                key={camp.id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {camp.estado}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-base line-clamp-1">{camp.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{camp.descripcion}</p>
                  </div>

                  {/* Animal Asociado */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                    <p className="text-slate-400 font-medium">Paciente / Rescate:</p>
                    <p className="font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
                      <span>{camp.animal?.nombre}</span>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                        {camp.animal?.especie}
                      </span>
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">{camp.animal?.estadoSalud}</p>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">Recaudado: ${recaudado.toLocaleString()}</span>
                      <span className="text-slate-400 font-medium">{porcentaje}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${porcentaje}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-right">
                      Meta: ${objetivo.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Factura / Presupuesto Adjunto */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  {camp.facturaUrl ? (
                    <button
                      type="button"
                      onClick={() => handleOpenDocument(camp.facturaUrl!)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Presupuesto Adjunto</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Sin comprobante adjunto
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL HU-007: Publicación de Campaña */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 my-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Publicar Campaña de Recaudación</h3>
                <p className="text-xs text-slate-500">
                  Definí los fondos requeridos y adjuntá el presupuesto clínico correspondiente.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Animal Rescatado con Deuda Clínica <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">-- Seleccionar Animal --</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.especie}) - Estado: {a.estado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Colecta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Cirugía ortopédica y prótesis para Milo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Médica y Destino de los Fondos <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Explicá el cuadro veterinario, internación, medicamentos y honorarios requeridos..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monto Objetivo ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={montoObjetivo}
                    onChange={(e) => setMontoObjetivo(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">El valor ingresado debe ser estrictamente mayor a 0.</p>
              </div>

              {/* Selector de Presupuesto / Factura en PDF o Imagen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presupuesto o Factura Clínica Veterinaria (PDF / Imagen)
                </label>
                
                {!fileName ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 cursor-pointer bg-slate-50 hover:bg-indigo-50/40 transition-colors">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Seleccionar documento PDF o imagen</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Comprobante de deuda o cotización quirúrgica (máx 5MB)</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-semibold text-indigo-900 truncate">{fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFacturaUrl(''); setFileName(null); }}
                      className="text-slate-400 hover:text-red-600 cursor-pointer ml-2 p-1"
                      title="Quitar archivo adjunto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  El comprobante quedará disponible para que los donantes auditen la veracidad del costo clínico.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Publicar Campaña ACTIVA
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};