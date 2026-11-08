import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { PawPrint, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<'VOLUNTARIO' | 'DONANTE'>('VOLUNTARIO');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación Criterio 3: Todos los campos requeridos
    if (!nombre.trim() || !email.trim() || !password.trim() || !telefono.trim()) {
      setError('Todos los campos son obligatorios (nombre, correo, contraseña y teléfono).');
      return;
    }

    // Validación Criterio 2: Mínimo 8 caracteres y alfanumérica
    const isAlphanumeric = /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(password);
    if (password.length < 8 || !isAlphanumeric) {
      setError('La contraseña debe tener al menos 8 caracteres y contener caracteres alfanuméricos (letras y números).');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        telefono: telefono.trim(),
        rol,
      });

      setRegistered(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      if (Array.isArray(serverMessage)) {
        setError(serverMessage.join('. '));
      } else {
        setError(serverMessage || 'Error al registrar la cuenta. Verificá los datos ingresados.');
      }
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
          <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
          <p className="text-sm text-slate-500">Sumate a la red de Patitas del Sur</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {registered ? (
          <div className="flex flex-col items-center text-center p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
            <h3 className="text-base font-semibold text-emerald-900">¡Registro exitoso!</h3>
            <p className="text-xs text-emerald-700 mt-1">Redirigiendo a la pantalla de inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, alfanumérica"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Debe contener letras y al menos un número.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono de Contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+54 9 351 1234567"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ¿Cómo querés colaborar?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRol('VOLUNTARIO')}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    rol === 'VOLUNTARIO'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <p className="text-sm font-semibold">Hogar de Tránsito</p>
                  <p className="text-xs text-slate-500 mt-0.5">Quiero cuidar un animal temporalmente</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRol('DONANTE')}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                    rol === 'DONANTE'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <p className="text-sm font-semibold">Donante</p>
                  <p className="text-xs text-slate-500 mt-0.5">Quiero colaborar económicamente</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrarse'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Iniciá sesión acá
          </Link>
        </p>
      </div>
    </div>
  );
};