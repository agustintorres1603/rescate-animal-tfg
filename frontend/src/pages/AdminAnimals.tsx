import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Plus, 
  HeartHandshake, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Stethoscope, 
  Edit3, 
  X,
  Save
} from 'lucide-react';

interface Animal {
  id: string;
  nombre: string;
  especie: 'PERRO' | 'GATO';
  edadAproxMeses: number;
  tamano: 'CHICO' | 'MEDIANO' | 'GRANDE';
  estadoSalud: string;
  requierePatio: boolean;
  sociablePerros: boolean;
  sociableGatos: boolean;
  necesitaMedicacion: boolean;
  estado: 'RESCATADO' | 'EN_TRANSITO' | 'ADOPTADO';
}

export const AdminAnimals: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State - Alta (HU-005)
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState<'PERRO' | 'GATO'>('PERRO');
  const [edadAproxMeses, setEdadAproxMeses] = useState<number | ''>('');
  const [tamano, setTamano] = useState<'CHICO' | 'MEDIANO' | 'GRANDE'>('MEDIANO');
  const [estadoSalud, setEstadoSalud] = useState('');
  const [requierePatio, setRequierePatio] = useState(false);
  const [sociablePerros, setSociablePerros] = useState(true);
  const [sociableGatos, setSociableGatos] = useState(true);
  const [necesitaMedicacion, setNecesitaMedicacion] = useState(false);

  // Form State - Edición Clínica (HU-006)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [editEstadoSalud, setEditEstadoSalud] = useState('');
  const [editNecesitaMedicacion, setEditNecesitaMedicacion] = useState(false);
  const [editEstado, setEditEstado] = useState<'RESCATADO' | 'EN_TRANSITO' | 'ADOPTADO'>('RESCATADO');

  const fetchAnimals = async () => {
    try {
      const res = await api.get('/animals');
      setAnimals(res.data);
    } catch (err: any) {
      setError('Error al cargar la lista de animales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const resetCreateForm = () => {
    setNombre('');
    setEspecie('PERRO');
    setEdadAproxMeses('');
    setTamano('MEDIANO');
    setEstadoSalud('');
    setRequierePatio(false);
    setSociablePerros(true);
    setSociableGatos(true);
    setNecesitaMedicacion(false);
    setError(null);
  };

  const handleOpenCreateModal = () => {
    resetCreateForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setEditEstadoSalud(animal.estadoSalud);
    setEditNecesitaMedicacion(animal.necesitaMedicacion);
    setEditEstado(animal.estado);
    setError(null);
    setIsEditModalOpen(true);
  };

  // Guardar Alta (HU-005)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre.trim() || edadAproxMeses === '' || !estadoSalud.trim()) {
      setError('Por favor completá todos los campos obligatorios pendientes.');
      return;
    }

    if (Number(edadAproxMeses) < 0) {
      setError('La edad estimada no puede ser un número negativo.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/animals', {
        nombre: nombre.trim(),
        especie,
        edadAproxMeses: Number(edadAproxMeses),
        tamano,
        estadoSalud: estadoSalud.trim(),
        requierePatio,
        sociablePerros,
        sociableGatos,
        necesitaMedicacion,
      });

      setSuccess(`Ficha de "${nombre}" registrada con éxito en estado RESCATADO.`);
      setIsModalOpen(false);
      resetCreateForm();
      await fetchAnimals();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al guardar la ficha clínica.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Guardar Edición Clínica (HU-006)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    setError(null);
    setSuccess(null);

    if (!editEstadoSalud.trim()) {
      setError('El diagnóstico / estado de salud no puede quedar vacío.');
      return;
    }

    setSubmitting(true);

    try {
      await api.patch(`/animals/${selectedAnimal.id}`, {
        estadoSalud: editEstadoSalud.trim(),
        necesitaMedicacion: editNecesitaMedicacion,
        estado: editEstado,
      });

      setSuccess(`Historial clínico de "${selectedAnimal.nombre}" actualizado con éxito.`);
      setIsEditModalOpen(false);
      setSelectedAnimal(null);
      await fetchAnimals();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al actualizar el historial clínico.'));
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
            <span>Fichas Clínicas de Animales</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
              Gestión Veterinaria
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Registro de ingresos, actualización de tratamientos clínicos y ciclo de adopción.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Rescatado</span>
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && !isEditModalOpen && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Listado de Animales */}
      {loading ? (
        <div className="py-12 flex justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : animals.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No hay animales registrados aún</p>
          <p className="text-xs text-slate-400 mt-1">
            Registrá la primera ficha clínica presionando el botón "Registrar Rescatado".
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Animal</th>
                  <th className="px-6 py-3.5">Edad / Tamaño</th>
                  <th className="px-6 py-3.5">Estado Clínico</th>
                  <th className="px-6 py-3.5">Compatibilidad / Restricciones</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {animals.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{a.nombre}</p>
                      <span className="inline-block text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                        {a.especie}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p>{a.edadAproxMeses} meses</p>
                      <p className="text-slate-400 mt-0.5">Tamaño: {a.tamano}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-700 font-medium">{a.estadoSalud}</p>
                      {a.necesitaMedicacion ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 border border-amber-200">
                          <Stethoscope className="w-3 h-3" /> Requiere Medicación
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                          Sin medicación activa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={a.requierePatio ? 'text-amber-600 font-medium' : 'text-slate-400'}>
                          • Patio: {a.requierePatio ? 'Excluyente' : 'Opcional'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">
                          • Sociable: {a.sociablePerros ? 'Perros ✓' : 'Perros ✗'} | {a.sociableGatos ? 'Gatos ✓' : 'Gatos ✗'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          a.estado === 'RESCATADO'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : a.estado === 'EN_TRANSITO'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {a.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEditModal(a)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Actualizar estado de salud y ficha clínica"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL HU-006: Edición Clínica y Estado de Salud */}
      {isEditModalOpen && selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 my-8 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Actualizar Ficha: {selectedAnimal.nombre}
                </h3>
                <p className="text-xs text-slate-500">
                  Modificación de diagnósticos, medicación y estado operativo.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico Médico y Avances Veterinarios <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editEstadoSalud}
                  onChange={(e) => setEditEstadoSalud(e.target.value)}
                  placeholder="Detallar evolución médica, dosis de fármacos o cirugías..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado General del Animal
                </label>
                <select
                  value={editEstado}
                  onChange={(e: any) => setEditEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="RESCATADO">RESCATADO (Disponible para matching de tránsito)</option>
                  <option value="EN_TRANSITO">EN_TRANSITO (Alojado en hogar temporal)</option>
                  <option value="ADOPTADO">ADOPTADO (Cierra ciclo de tránsito y adopción definitiva)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Al pasar a <strong>ADOPTADO</strong>, el animal no participará de nuevas asignaciones algorítmicas de tránsito.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editNecesitaMedicacion}
                    onChange={(e) => setEditNecesitaMedicacion(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Requiere administración activa de medicación</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 ml-5">
                  Esta variable condiciona la compatibilidad con hogares capacitados para suministrar tratamientos.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios Clínicos
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HU-005: Formulario de Alta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 my-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Animal</h3>
                <p className="text-xs text-slate-500">
                  Las variables biológicas y clínicas condicionan el algoritmo Gale-Shapley.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Animal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Milo, Luna"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Especie <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={especie}
                    onChange={(e: any) => setEspecie(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="PERRO">PERRO</option>
                    <option value="GATO">GATO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Edad Estimada (Meses) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={edadAproxMeses}
                    onChange={(e) => setEdadAproxMeses(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej: 12"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tamaño <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tamano}
                    onChange={(e: any) => setTamano(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="CHICO">CHICO</option>
                    <option value="MEDIANO">MEDIANO</option>
                    <option value="GRANDE">GRANDE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico / Estado de Salud <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={estadoSalud}
                  onChange={(e) => setEstadoSalud(e.target.value)}
                  placeholder="Detallar condiciones sanitarias, heridas o tratamientos iniciales..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Variables Críticas para Matching (Gale-Shapley)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={requierePatio}
                      onChange={(e) => setRequierePatio(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Requiere Patio Cerrado</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={necesitaMedicacion}
                      onChange={(e) => setNecesitaMedicacion(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Necesita Medicación Activa</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={sociablePerros}
                      onChange={(e) => setSociablePerros(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Sociable con Perros</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={sociableGatos}
                      onChange={(e) => setSociableGatos(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Sociable con Gatos</span>
                  </label>
                </div>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Ficha en RESCATADO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};