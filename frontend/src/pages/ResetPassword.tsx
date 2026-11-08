import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('El token de restablecimiento es inválido o no está presente en el enlace.');
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Por favor, completá ambos campos de contraseña.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    const isAlphanumeric = /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(newPassword);
    if (newPassword.length < 8 || !isAlphanumeric) {
      setError('La nueva contraseña debe tener al menos 8 caracteres y ser alfanumérica (contener letras y números).');
      return;
    }

    setLoading(true);

    try {
      await api.patch('/auth/reset-password', {
        token,
        newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      setError(
        Array.isArray(serverMsg) ? serverMsg.join('. ') : (serverMsg || 'Error al restablecer la contraseña.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Restablecer Contraseña</h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            Ingresá tu nueva clave cumpliendo con las políticas de seguridad.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center text-center p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
            <h3 className="text-base font-semibold text-emerald-900">¡Contraseña restablecida!</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Tu clave fue actualizada exitosamente. Redirigiendo al inicio de sesión...
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
            >
              Ingresar ahora <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, alfanumérica"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Debe incluir letras y al menos un número.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};