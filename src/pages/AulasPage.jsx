import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { aulasApi } from '../api/horariosApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AulasPage = () => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAula, setEditingAula] = useState(null);
  const [formData, setFormData] = useState({
    numero_aula: '',
    capacidad: '',
    tipo: 'AULA'
  });

  useEffect(() => {
    loadAulas();
  }, []);

  const loadAulas = async () => {
    try {
      const response = await aulasApi.getAll();
      setAulas(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar aulas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAula) {
        await aulasApi.update(editingAula.id, formData);
        toast.success('Aula actualizada correctamente');
      } else {
        await aulasApi.create(formData);
        toast.success('Aula creada correctamente');
      }
      closeModal();
      loadAulas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar aula');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta aula?')) {
      try {
        await aulasApi.delete(id);
        toast.success('Aula eliminada correctamente');
        loadAulas();
      } catch (error) {
        toast.error('Error al eliminar aula');
        console.error(error);
      }
    }
  };

  const handleEdit = (aula) => {
    setEditingAula(aula);
    setFormData({
      numero_aula: aula.numero_aula,
      capacidad: aula.capacidad,
      tipo: aula.tipo
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAula(null);
    setFormData({
      numero_aula: '',
      capacidad: '',
      tipo: 'AULA'
    });
  };

  const filteredAulas = aulas.filter(aula => {
    const matchesSearch = 
      aula.numero_aula?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === '' || aula.tipo === filterTipo;
    
    return matchesSearch && matchesTipo;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="aulas-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Aulas</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Nueva Aula
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
                placeholder="Buscar por número de aula..."
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
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="AULA">Aula</option>
            <option value="LABORATORIO">Laboratorio</option>
            <option value="TALLER">Taller</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número de Aula</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAulas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron aulas
                  </td>
                </tr>
              ) : (
                filteredAulas.map((aula) => (
                  <tr key={aula.id}>
                    <td><strong>{aula.numero_aula}</strong></td>
                    <td>
                      <span className={`badge ${
                        aula.tipo === 'AULA' ? 'badge-info' : 
                        aula.tipo === 'LABORATORIO' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {aula.tipo}
                      </span>
                    </td>
                    <td>{aula.capacidad} personas</td>
                    <td>
                      <span className="badge badge-success">
                        Activa
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleEdit(aula)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleDelete(aula.id)}
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
              <h3>{editingAula ? 'Editar Aula' : 'Nueva Aula'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Número de Aula *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.numero_aula}
                  onChange={(e) => setFormData({...formData, numero_aula: e.target.value})}
                  required
                  placeholder="Ej: A-101, LAB-201"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select
                    className="form-select"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    required
                  >
                    <option value="AULA">Aula</option>
                    <option value="LABORATORIO">Laboratorio</option>
                    <option value="TALLER">Taller</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Capacidad *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                    required
                    min="1"
                    placeholder="Ej: 40"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAula ? 'Actualizar' : 'Crear'}
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

export default AulasPage;