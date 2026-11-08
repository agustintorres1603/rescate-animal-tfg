import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  PawPrint,
  Pill,
  Calendar
} from 'lucide-react';

interface HogarData {
  tipoVivienda: 'CASA' | 'DEPARTAMENTO' | '';
  tienePatioCerrado: boolean | null;
  tieneOtrosAnimales: boolean | null;
  aceptaMedicacion: boolean | null;
  disponibilidadDias: number | '';
  activo: boolean;
}

export const VolunteerProfile: React.FC = () => {
  const [formData, setFormData] = useState<HogarData>({
    tipoVivienda: '',
    tienePatioCerrado: null,
    tieneOtrosAnimales: null,
    aceptaMedicacion: null,
    disponibilidadDias: '',
    activo: true,
  });

  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos existentes si ya los completó antes
  const fetchProfile = async () => {
    try {
      const response = await api.get('/transits/profile/me');
      if (response.data) {
        setHasProfile(true);
        setFormData({
          tipoVivienda: response.data.tipoVivienda || '',
          tienePatioCerrado: response.data.tienePatioCerrado ?? null,
          tieneOtrosAnimales: response.data.tieneOtrosAnimales ?? null,
          aceptaMedicacion: response.data.aceptaMedicacion ?? null,
          disponibilidadDias: response.data.disponibilidadDias || '',
          activo: response.data.activo ?? true,
        });
      }
    } catch {
      // 404 es normal si el voluntario recién se registra y no cargó datos previos
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // HU-011: Registro y validación técnica
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Criterio 2: Validación estricta de todos los campos
    if (
      !formData.tipoVivienda ||
      formData.tienePatioCerrado === null ||
      formData.tieneOtrosAnimales === null ||
      formData.aceptaMedicacion === null ||
      formData.disponibilidadDias === '' ||
      Number(formData.disponibilidadDias) <= 0
    ) {
      setError('Por favor completá todos los campos del entorno habitacional requeridos para la evaluación técnica.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/transits/profile', {
        tipoVivienda: formData.tipoVivienda,
        tienePatioCerrado: Boolean(formData.tienePatioCerrado),
        tieneOtrosAnimales: Boolean(formData.tieneOtrosAnimales),
        aceptaMedicacion: Boolean(formData.aceptaMedicacion),
        disponibilidadDias: Number(formData.disponibilidadDias),
      });

      setHasProfile(true);
      setFormData((prev) => ({ ...prev, activo: true }));
      setSuccess('Perfil habitacional registrado exitosamente con estado ACTIVO para la red de tránsitos.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al guardar los datos del hogar de tránsito.'
      );
    } finally {
      setSaving(false);
    }
  };

  // HU-012: Toggle de disponibilidad temporal
  const handleToggleAvailability = async () => {
    if (!hasProfile) return;
    setToggling(true);
    setError(null);
    setSuccess(null);

    const nuevoEstado = !formData.activo;

    try {
      await api.patch('/transits/profile/availability', { activo: nuevoEstado });
      setFormData((prev) => ({ ...prev, activo: nuevoEstado }));
      setSuccess(
        nuevoEstado
          ? 'Hogar marcado como DISPONIBLE: entrarás en las próximas ejecuciones del emparejamiento.'
          : 'Disponibilidad PAUSADA: tu hogar quedará excluido temporalmente de las asignaciones.'
      );
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar la disponibilidad.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* Encabezado con Switch HU-012 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Condiciones de tu Hogar de Tránsito</h1>
              <p className="text-xs text-slate-500">
                Esta información alimenta al motor algorítmico Gale-Shapley para asignarte animales compatibles.
              </p>
            </div>
          </div>

          {/* HU-012: Control de Disponibilidad */}
          {hasProfile && (
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 px-3 rounded-xl border border-slate-200 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800 block">
                  {formData.activo ? 'Hogar Disponible' : 'Disponibilidad Pausada'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formData.activo ? 'Elegible para matching' : 'Excluido del algoritmo'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={toggling}
                className="cursor-pointer text-indigo-600 disabled:opacity-50 transition-transform active:scale-95"
                title="Pausar o activar disponibilidad"
              >
                {formData.activo ? (
                  <ToggleRight className="w-9 h-9 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulario HU-011 */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Tipo de Vivienda */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de Vivienda <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['CASA', 'DEPARTAMENTO'] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoVivienda: tipo })}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer text-center ${
                    formData.tipoVivienda === tipo
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {tipo === 'CASA' ? 'Casa' : 'Departamento'}
                </button>
              ))}
            </div>
          </div>

          {/* Días de disponibilidad */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Disponibilidad temporal estimada (en días) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min={1}
                max={365}
                required
                value={formData.disponibilidadDias}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    disponibilidadDias: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  })
                }
                placeholder="Ej: 30"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Tiempo estimado que podés resguardar al animal durante su recuperación o espera de adopción.
            </span>
          </div>

          {/* Opciones con radio buttons explícitos para asegurar respuesta técnica */}
          <div className="space-y-4 pt-2">
            {/* Cerramiento perimetral */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">¿Posee cerramiento perimetral seguro o patio cerrado?</p>
                  <p className="text-[11px] text-slate-500">Requerido principalmente para perros medianos o grandes.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tienePatioCerrado"
                    checked={formData.tienePatioCerrado === true}
                    onChange={() => setFormData({ ...formData, tienePatioCerrado: true })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Sí</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tienePatioCerrado"
                    checked={formData.tienePatioCerrado === false}
                    onChange={() => setFormData({ ...formData, tienePatioCerrado: false })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Otras mascotas */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PawPrint className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">¿Convivís con otras mascotas en el hogar?</p>
                  <p className="text-[11px] text-slate-500">Permite filtrar animales que requieran sociabilidad comprobada.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tieneOtrosAnimales"
                    checked={formData.tieneOtrosAnimales === true}
                    onChange={() => setFormData({ ...formData, tieneOtrosAnimales: true })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Sí</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tieneOtrosAnimales"
                    checked={formData.tieneOtrosAnimales === false}
                    onChange={() => setFormData({ ...formData, tieneOtrosAnimales: false })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* Disposición medicación */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">¿Tenés disposición para administrar medicación o curaciones?</p>
                  <p className="text-[11px] text-slate-500">Fundamental para animales en tratamiento postoperatorio o rescate.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="aceptaMedicacion"
                    checked={formData.aceptaMedicacion === true}
                    onChange={() => setFormData({ ...formData, aceptaMedicacion: true })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Sí</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="aceptaMedicacion"
                    checked={formData.aceptaMedicacion === false}
                    onChange={() => setFormData({ ...formData, aceptaMedicacion: false })}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Guardar Condiciones Habitacionales</span>
          </button>
        </form>
      </div>
    </div>
  );
};