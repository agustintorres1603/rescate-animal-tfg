import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { KeyRound, AlertCircle, CheckCircle2, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDevResetUrl(null);

    if (!email.trim()) {
      setError('Por favor, ingresá tu correo electrónico.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(response.data.message || 'Se ha enviado un enlace de restablecimiento a su casilla.');
      if (response.data.resetUrl) {
        setDevResetUrl(response.data.resetUrl);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al solicitar la recuperación de contraseña.'
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
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Recuperar Contraseña</h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            Ingresá tu correo electrónico para recibir las instrucciones de restablecimiento.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Correo de recuperación enviado</span>
              </div>
              <p className="text-xs text-emerald-700">{success}</p>
            </div>

            {devResetUrl && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-2">
                <p className="font-semibold flex items-center gap-1">
                  <span>Enlace de acceso directo (Modo Desarrollo):</span>
                </p>
                <a
                  href={devResetUrl}
                  className="inline-flex items-center gap-1 text-indigo-700 font-bold underline break-all hover:text-indigo-900"
                >
                  Continuar al restablecimiento de clave
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico Registrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@patitasdelsur.org"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Enlace de Recuperación'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};