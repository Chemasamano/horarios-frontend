import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { gruposApi } from '../api/horariosApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GruposPage = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [formData, setFormData] = useState({
    numero_grupo: '',
    semestre: 'PRIMERO',
    ciclo_escolar: '2026-A',
    turno: 'MATUTINO',
    cantidad_alumnos: ''
  });

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      const response = await gruposApi.getAll();
      setGrupos(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar grupos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrupo) {
        await gruposApi.update(editingGrupo.id, formData);
        toast.success('Grupo actualizado correctamente');
      } else {
        await gruposApi.create(formData);
        toast.success('Grupo creado correctamente');
      }
      closeModal();
      loadGrupos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar grupo');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este grupo?')) {
      try {
        await gruposApi.delete(id);
        toast.success('Grupo eliminado correctamente');
        loadGrupos();
      } catch (error) {
        toast.error('Error al eliminar grupo');
        console.error(error);
      }
    }
  };

  const handleEdit = (grupo) => {
    setEditingGrupo(grupo);
    setFormData({
      numero_grupo: grupo.numero_grupo,
      semestre: grupo.semestre,
      ciclo_escolar: grupo.ciclo_escolar,
      turno: grupo.turno,
      cantidad_alumnos: grupo.cantidad_alumnos
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    setFormData({
      numero_grupo: '',
      semestre: 'PRIMERO',
      ciclo_escolar: '2026-A',
      turno: 'MATUTINO',
      cantidad_alumnos: ''
    });
  };

  const filteredGrupos = grupos.filter(grupo => {
    const matchesSearch = 
      grupo.numero_grupo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTurno = filterTurno === '' || grupo.turno === filterTurno;
    
    return matchesSearch && matchesTurno;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="grupos-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Grupos</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Nuevo Grupo
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
                placeholder="Buscar por número de grupo..."
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
            value={filterTurno}
            onChange={(e) => setFilterTurno(e.target.value)}
          >
            <option value="">Todos los turnos</option>
            <option value="MATUTINO">Matutino</option>
            <option value="VESPERTINO">Vespertino</option>
            <option value="MIXTO">Mixto</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número de Grupo</th>
                <th>Semestre</th>
                <th>Ciclo Escolar</th>
                <th>Turno</th>
                <th>Cantidad Alumnos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrupos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron grupos
                  </td>
                </tr>
              ) : (
                filteredGrupos.map((grupo) => (
                  <tr key={grupo.id}>
                    <td><strong>{grupo.numero_grupo}</strong></td>
                    <td>
                      <span className="badge badge-info">
                        {grupo.semestre}
                      </span>
                    </td>
                    <td>{grupo.ciclo_escolar}</td>
                    <td>
                      <span className={`badge ${
                        grupo.turno === 'MATUTINO' ? 'badge-success' : 
                        grupo.turno === 'VESPERTINO' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {grupo.turno}
                      </span>
                    </td>
                    <td>{grupo.cantidad_alumnos} alumnos</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleEdit(grupo)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleDelete(grupo.id)}
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
              <h3>{editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Número de Grupo *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.numero_grupo}
                  onChange={(e) => setFormData({...formData, numero_grupo: e.target.value})}
                  required
                  placeholder="Ej: 101, 231, etc."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div className="form-group">
                  <label className="form-label">Ciclo Escolar *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ciclo_escolar}
                    onChange={(e) => setFormData({...formData, ciclo_escolar: e.target.value})}
                    required
                    placeholder="Ej: 2026-A"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Turno *</label>
                  <select
                    className="form-select"
                    value={formData.turno}
                    onChange={(e) => setFormData({...formData, turno: e.target.value})}
                    required
                  >
                    <option value="MATUTINO">Matutino</option>
                    <option value="VESPERTINO">Vespertino</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cantidad de Alumnos</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.cantidad_alumnos}
                    onChange={(e) => setFormData({...formData, cantidad_alumnos: e.target.value})}
                    min="0"
                    placeholder="Ej: 35"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGrupo ? 'Actualizar' : 'Crear'}
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

export default GruposPage;