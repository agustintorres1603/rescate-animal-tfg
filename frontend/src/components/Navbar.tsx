import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Huella Segura</span>
            </Link>
            <div className="hidden md:flex ml-8 space-x-4">
              <Link to="/" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Catálogo
              </Link>
              {hasRole('VOLUNTARIO') && (
                <>
                  <Link to="/voluntario/perfil" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Mi Hogar de Tránsito
                  </Link>
                  <Link to="/voluntario/mi-transito" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Mi Tránsito Activo
                  </Link>
                </>
              )}
              {hasRole('DONANTE') && (
                <Link to="/donante/mis-donaciones" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Mis Donaciones
                </Link>
              )}
              {hasRole('ADMIN') && (
                <>
                  <Link to="/admin/dashboard" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Métricas
                  </Link>
                  <Link to="/admin/animales" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Fichas Clínicas
                  </Link>
                  <Link to="/admin/campanas" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Campañas Médicas
                  </Link>
                  <Link to="/admin/matching" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Asignación de Tránsitos
                  </Link>
                  <Link to="/admin/donaciones" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Auditoría Donaciones
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/perfil"
                  title="Gestionar mi perfil"
                  className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{user.nombre}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                    {user.rol}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};