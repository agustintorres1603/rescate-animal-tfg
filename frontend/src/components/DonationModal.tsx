import React, { useState, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Paperclip,
  Trash2
} from 'lucide-react';

interface CampaignSummary {
  id: string;
  titulo: string;
  animal?: {
    nombre: string;
  };
}

interface DonationModalProps {
  campaign: CampaignSummary;
  onClose: () => void;
  onSuccess: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ campaign, onClose, onSuccess }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [monto, setMonto] = useState<number | ''>('');
  const [codigoTransaccion, setCodigoTransaccion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('El comprobante no debe superar los 5 MB.');
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!monto || Number(monto) <= 0) {
      setError('Por favor ingresá un monto válido mayor a 0.');
      return;
    }
    if (!codigoTransaccion.trim()) {
      setError('El código o referencia de transacción es obligatorio.');
      return;
    }
    if (!selectedFile) {
      setError('Tenés que adjuntar el comprobante en PDF o imagen.');
      return;
    }

    setLoading(true);
    try {
      // 1. Subida del archivo físico mediante multipart/form-data
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await api.post('/upload/comprobante', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = uploadRes.data.url;

      // 2. Creación formal de la donación con la URL del comprobante guardado
      await api.post('/donations', {
        campanaId: campaign.id,
        monto: Number(monto),
        codigoTransaccion: codigoTransaccion.trim(),
        comprobanteUrl: uploadedUrl,
        ...(user?.id ? { usuarioId: user.id } : {}),
      });

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la donación o comprobante.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Registrar Donación</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{campaign.titulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">¡Donación enviada con éxito!</h4>
              <p className="text-sm text-slate-600">
                El comprobante fue cargado y se encuentra en estado <strong>PENDIENTE</strong> para su validación administrativa.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Monto */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Monto a donar ($ ARS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="Ej. 10000"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Código de transacción */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Nro. de Operación / Código de Transferencia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MP-55443322 o Referencia bancaria"
                  value={codigoTransaccion}
                  onChange={(e) => setCodigoTransaccion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
                />
              </div>

              {/* Selector de Comprobante (PDF / Imagen) */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Comprobante de Transferencia (PDF, JPG, PNG)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20"
                  >
                    <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-indigo-600">
                      Hacé clic para seleccionar tu archivo PDF o imagen
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Máximo 5 MB</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div className="text-xs truncate">
                        <p className="font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-slate-500 text-[10px]">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo comprobante...</span>
                    </>
                  ) : (
                    <span>Confirmar Donación</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};