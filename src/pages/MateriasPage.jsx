import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { materiasApi } from '../api/horariosApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MateriasPage = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemestre, setFilterSemestre] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMateria, setEditingMateria] = useState(null);
  const [formData, setFormData] = useState({
    clave: '',
    nombre: '',
    hsm_totales: '',
    mapa_curricular: 'MAPA_2024',
    semestre: 'PRIMERO'
  });

  useEffect(() => {
    loadMaterias();
  }, []);

  const loadMaterias = async () => {
    try {
      const response = await materiasApi.getAll();
      setMaterias(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar materias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMateria) {
        await materiasApi.update(editingMateria.id, formData);
        toast.success('Materia actualizada correctamente');
      } else {
        await materiasApi.create(formData);
        toast.success('Materia creada correctamente');
      }
      closeModal();
      loadMaterias();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar materia');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta materia?')) {
      try {
        await materiasApi.delete(id);
        toast.success('Materia eliminada correctamente');
        loadMaterias();
      } catch (error) {
        toast.error('Error al eliminar materia');
        console.error(error);
      }
    }
  };

  const handleEdit = (materia) => {
    setEditingMateria(materia);
    setFormData({
      clave: materia.clave,
      nombre: materia.nombre,
      hsm_totales: materia.hsm_totales,
      mapa_curricular: materia.mapa_curricular,
      semestre: materia.semestre
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMateria(null);
    setFormData({
      clave: '',
      nombre: '',
      hsm_totales: '',
      mapa_curricular: 'MAPA_2024',
      semestre: 'PRIMERO'
    });
  };

  const filteredMaterias = materias.filter(materia => {
    const matchesSearch = 
      materia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materia.clave?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemestre = filterSemestre === '' || materia.semestre === filterSemestre;
    
    return matchesSearch && matchesSemestre;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="materias-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Materias</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Nueva Materia
          </button>
        </div>

        {/* Filtros */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} 
              />
              <input
                type="text"
                placeholder="Buscar por nombre o clave..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="form-select"
            style={{ width: '200px' }}
            value={filterSemestre}
            onChange={(e) => setFilterSemestre(e.target.value)}
          >
            <option value="">Todos los semestres</option>
            <option value="PRIMERO">Primero</option>
            <option value="SEGUNDO">Segundo</option>
            <option value="TERCERO">Tercero</option>
            <option value="CUARTO">Cuarto</option>
            <option value="QUINTO">Quinto</option>
            <option value="SEXTO">Sexto</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Clave</th>
                <th>Nombre</th>
                <th>Semestre</th>
                <th>HSM Totales</th>
                <th>Mapa Curricular</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterias.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron materias
                  </td>
                </tr>
              ) : (
                filteredMaterias.map((materia) => (
                  <tr key={materia.id}>
                    <td><strong>{materia.clave}</strong></td>
                    <td>{materia.nombre}</td>
                    <td>
                      <span className="badge badge-info">
                        {materia.semestre}
                      </span>
                    </td>
                    <td>{materia.hsm_totales} HSM</td>
                    <td>{materia.mapa_curricular}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleEdit(materia)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleDelete(materia.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMateria ? 'Editar Materia' : 'Nueva Materia'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Clave *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.clave}
                  onChange={(e) => setFormData({...formData, clave: e.target.value})}
                  required
                  placeholder="Ej: MAT-101"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Ej: Matemáticas I"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">HSM Totales *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.hsm_totales}
                    onChange={(e) => setFormData({...formData, hsm_totales: e.target.value})}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Semestre *</label>
                  <select
                    className="form-select"
                    value={formData.semestre}
                    onChange={(e) => setFormData({...formData, semestre: e.target.value})}
                    required
                  >
                    <option value="PRIMERO">Primero</option>
                    <option value="SEGUNDO">Segundo</option>
                    <option value="TERCERO">Tercero</option>
                    <option value="CUARTO">Cuarto</option>
                    <option value="QUINTO">Quinto</option>
                    <option value="SEXTO">Sexto</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mapa Curricular *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.mapa_curricular}
                  onChange={(e) => setFormData({...formData, mapa_curricular: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMateria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default MateriasPage;