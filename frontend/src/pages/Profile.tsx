import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { updateUser } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('');

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const data = response.data;
        setNombre(data.nombre || '');
        setEmail(data.email || '');
        setTelefono(data.telefono || '');
        setRol(data.rol || '');
      } catch (err: any) {
        setErrorMsg('No se pudieron cargar los datos de perfil.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!nombre.trim()) {
      setErrorMsg('El nombre es obligatorio.');
      return;
    }

    setSaving(true);

    try {
      const response = await api.patch('/users/profile', {
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
      });

      // Actualizar el estado global en AuthContext (y localStorage)
      updateUser({
        nombre: response.data.nombre,
        telefono: response.data.telefono,
      });

      setSuccessMsg('Datos de contacto actualizados con éxito.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Ocurrió un error al guardar los cambios.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Administrá tus datos personales y de contacto en el sistema.
            </p>
          </div>
        </div>

        {/* Notificación de éxito (Criterio 2) */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3.5 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Notificación de error */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Correo Electrónico (Solo Lectura) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              Correo Electrónico
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              El correo está asociado a tu identidad y no puede modificarse directamente.
            </p>
          </div>

          {/* Rol del usuario */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Rol Asignado
            </label>
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {rol}
              </span>
            </div>
          </div>

          {/* Nombre y Apellido (Editable) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Nombre y Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Teléfono de contacto (Editable) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 3515551234"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botón de Guardar */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};