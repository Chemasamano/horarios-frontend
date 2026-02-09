import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { docentesApi } from '../api/horariosApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DocentesPage = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelacion, setFilterRelacion] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDocente, setEditingDocente] = useState(null);
  const [formData, setFormData] = useState({
    numero_nomina: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombres: '',
    relacion_laboral: 'INTERINO',
    fecha_ingreso_sistema: '',
    fecha_adscripcion_plantel: '',
    hsm_definitivas: 0,
    hsm_adicionales: 0,
    categoria: '',
    jornada: '',
    turno: 'MATUTINO'
  });

  useEffect(() => {
    loadDocentes();
  }, []);

  const loadDocentes = async () => {
    try {
      const response = await docentesApi.getAll();
      setDocentes(response.data.data || []);
    } catch (error) {
      toast.error('Error al cargar docentes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDocente) {
        await docentesApi.update(editingDocente.id, formData);
        toast.success('Docente actualizado correctamente');
      } else {
        await docentesApi.create(formData);
        toast.success('Docente creado correctamente');
      }
      closeModal();
      loadDocentes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar docente');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este docente?')) {
      try {
        await docentesApi.delete(id);
        toast.success('Docente eliminado correctamente');
        loadDocentes();
      } catch (error) {
        toast.error('Error al eliminar docente');
        console.error(error);
      }
    }
  };

  const handleEdit = (docente) => {
    setEditingDocente(docente);
    setFormData({
      numero_nomina: docente.numero_nomina,
      apellido_paterno: docente.apellido_paterno,
      apellido_materno: docente.apellido_materno,
      nombres: docente.nombres,
      relacion_laboral: docente.relacion_laboral,
      fecha_ingreso_sistema: docente.fecha_ingreso_sistema,
      fecha_adscripcion_plantel: docente.fecha_adscripcion_plantel,
      hsm_definitivas: docente.hsm_definitivas || 0,
      hsm_adicionales: docente.hsm_adicionales || 0,
      categoria: docente.categoria || '',
      jornada: docente.jornada || '',
      turno: docente.turno || 'MATUTINO'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDocente(null);
    setFormData({
      numero_nomina: '',
      apellido_paterno: '',
      apellido_materno: '',
      nombres: '',
      relacion_laboral: 'INTERINO',
      fecha_ingreso_sistema: '',
      fecha_adscripcion_plantel: '',
      hsm_definitivas: 0,
      hsm_adicionales: 0,
      categoria: '',
      jornada: '',
      turno: 'MATUTINO'
    });
  };

  const filteredDocentes = docentes.filter(docente => {
    const matchesSearch = 
      docente.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.numero_nomina?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRelacion = filterRelacion === '' || docente.relacion_laboral === filterRelacion;
    
    return matchesSearch && matchesRelacion;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="docentes-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Docentes</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Nuevo Docente
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
                placeholder="Buscar por nombre o nómina..."
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
            value={filterRelacion}
            onChange={(e) => setFilterRelacion(e.target.value)}
          >
            <option value="">Todas las relaciones</option>
            <option value="BASE">Base</option>
            <option value="INTERINO">Interino</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nómina</th>
                <th>Nombre Completo</th>
                <th>Relación Laboral</th>
                <th>HSM Totales</th>
                <th>Turno</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocentes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron docentes
                  </td>
                </tr>
              ) : (
                filteredDocentes.map((docente) => (
                  <tr key={docente.id}>
                    <td><strong>{docente.numero_nomina}</strong></td>
                    <td>{docente.nombre_completo}</td>
                    <td>
                      <span className={`badge ${docente.relacion_laboral === 'BASE' ? 'badge-success' : 'badge-warning'}`}>
                        {docente.relacion_laboral}
                      </span>
                    </td>
                    <td>{docente.hsm_totales_calculadas} HSM</td>
                    <td>
                      <span className="badge badge-info">
                        {docente.turno || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleEdit(docente)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleDelete(docente.id)}
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
              <h3>{editingDocente ? 'Editar Docente' : 'Nuevo Docente'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Número de Nómina *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.numero_nomina}
                    onChange={(e) => setFormData({...formData, numero_nomina: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relación Laboral *</label>
                  <select
                    className="form-select"
                    value={formData.relacion_laboral}
                    onChange={(e) => setFormData({...formData, relacion_laboral: e.target.value})}
                    required
                  >
                    <option value="BASE">Base</option>
                    <option value="INTERINO">Interino</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido Paterno *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido Materno *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({...formData, apellido_materno: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nombres *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha Ingreso Sistema *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha_ingreso_sistema}
                    onChange={(e) => setFormData({...formData, fecha_ingreso_sistema: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha Adscripción Plantel *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha_adscripcion_plantel}
                    onChange={(e) => setFormData({...formData, fecha_adscripcion_plantel: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HSM Definitivas</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.hsm_definitivas}
                    onChange={(e) => setFormData({...formData, hsm_definitivas: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HSM Adicionales</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.hsm_adicionales}
                    onChange={(e) => setFormData({...formData, hsm_adicionales: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Turno</label>
                  <select
                    className="form-select"
                    value={formData.turno}
                    onChange={(e) => setFormData({...formData, turno: e.target.value})}
                  >
                    <option value="MATUTINO">Matutino</option>
                    <option value="VESPERTINO">Vespertino</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDocente ? 'Actualizar' : 'Crear'}
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
          max-width: 800px;
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

export default DocentesPage;