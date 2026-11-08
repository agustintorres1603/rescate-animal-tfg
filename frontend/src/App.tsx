import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';
import { AdminAnimals } from './pages/AdminAnimals';
import { AdminCampaigns } from './pages/AdminCampaigns';
import { AdminMatching } from './pages/AdminMatching';
import { AdminDonations } from './pages/AdminDonations';
import { AdminDashboard } from './pages/AdminDashboard'; // HU-015
import { VolunteerProfile } from './pages/VolunteerProfile';
import { VolunteerActiveTransit } from './pages/VolunteerActiveTransit';
import { PublicCatalog } from './pages/PublicCatalog';
import { DonorDonations } from './pages/DonorDonations';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<PublicCatalog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Rutas Protegidas - Perfil Transversal (HU-004) */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'VOLUNTARIO', 'DONANTE']} />}>
                <Route path="/perfil" element={<Profile />} />
              </Route>

              {/* Rutas Protegidas - Voluntario */}
              <Route element={<ProtectedRoute allowedRoles={['VOLUNTARIO', 'ADMIN']} />}>
                <Route path="/voluntario/perfil" element={<VolunteerProfile />} />
                <Route path="/voluntario/mi-transito" element={<VolunteerActiveTransit />} />
              </Route>

              {/* Rutas Protegidas - Donante */}
              <Route element={<ProtectedRoute allowedRoles={['DONANTE', 'ADMIN']} />}>
                <Route path="/donante/mis-donaciones" element={<DonorDonations />} />
              </Route>

              {/* Rutas Protegidas - Admin (HU-005 a HU-015) */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/animales" element={<AdminAnimals />} />
                <Route path="/admin/campanas" element={<AdminCampaigns />} />
                <Route path="/admin/matching" element={<AdminMatching />} />
                <Route path="/admin/donaciones" element={<AdminDonations />} />
              </Route>

              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}