import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { PawPrint, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      console.log('Respuesta backend login:', response.data);

      const token =
        response.data.accessToken ||
        response.data.access_token ||
        response.data.token;

      const userData = response.data.user;

      if (!token || !userData) {
        throw new Error('La respuesta del servidor no contiene un token o usuario válido.');
      }

      login(token, userData);

      // Redirigir según el rol
      if (userData.rol === 'ADMIN') {
        navigate('/admin/matching');
      } else if (userData.rol === 'VOLUNTARIO') {
        navigate('/voluntario/perfil');
      } else if (userData.rol === 'DONANTE') {
        navigate('/donante/mis-donaciones');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Error capturado en login:', err);
      setError(
        err.response?.data?.message || err.message || 'Error al iniciar sesión. Verificá tus credenciales.'
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
            <PawPrint className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
          <p className="text-sm text-slate-500">Ingresá tus datos para acceder al sistema</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@patitasdelsur.org"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Registrate acá
          </Link>
        </p>
      </div>
    </div>
  );
};