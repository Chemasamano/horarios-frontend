import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
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
  
  // Estados para secciones colapsables
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    academico: false,
    laboral: false,
    horario: false
  });

  const [formData, setFormData] = useState({
    // Datos personales
    numero_nomina: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombres: '',
    
    // Datos académicos
    licenciatura: '',
    tiene_titulo_licenciatura: false,
    maestria: '',
    tiene_titulo_maestria: false,
    
    // Datos laborales
    relacion_laboral: 'INTERINO',
    fecha_ingreso_sistema: '',
    fecha_adscripcion_plantel: '',
    categoria: '',
    jornada: '',
    hsm_jornada: 0,
    hsm_definitivas: 0,
    hsm_adicionales: 0,
    
    // Configuración de horario
    hora_entrada: '',
    horas_descarga: 0,
    turno: 'MATUTINO',
    activo: true
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
      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        // Asegurar que los booleanos se envíen correctamente
        tiene_titulo_licenciatura: Boolean(formData.tiene_titulo_licenciatura),
        tiene_titulo_maestria: Boolean(formData.tiene_titulo_maestria),
        activo: Boolean(formData.activo)
      };

      if (editingDocente) {
        await docentesApi.update(editingDocente.id, dataToSend);
        toast.success('Docente actualizado correctamente');
      } else {
        await docentesApi.create(dataToSend);
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
      licenciatura: docente.licenciatura || '',
      tiene_titulo_licenciatura: docente.tiene_titulo_licenciatura || false,
      maestria: docente.maestria || '',
      tiene_titulo_maestria: docente.tiene_titulo_maestria || false,
      relacion_laboral: docente.relacion_laboral,
      fecha_ingreso_sistema: docente.fecha_ingreso_sistema,
      fecha_adscripcion_plantel: docente.fecha_adscripcion_plantel,
      categoria: docente.categoria || '',
      jornada: docente.jornada || '',
      hsm_jornada: docente.hsm_jornada || 0,
      hsm_definitivas: docente.hsm_definitivas || 0,
      hsm_adicionales: docente.hsm_adicionales || 0,
      hora_entrada: docente.hora_entrada || '',
      horas_descarga: docente.horas_descarga || 0,
      turno: docente.turno || 'MATUTINO',
      activo: docente.activo !== undefined ? docente.activo : true
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
      licenciatura: '',
      tiene_titulo_licenciatura: false,
      maestria: '',
      tiene_titulo_maestria: false,
      relacion_laboral: 'INTERINO',
      fecha_ingreso_sistema: '',
      fecha_adscripcion_plantel: '',
      categoria: '',
      jornada: '',
      hsm_jornada: 0,
      hsm_definitivas: 0,
      hsm_adicionales: 0,
      hora_entrada: '',
      horas_descarga: 0,
      turno: 'MATUTINO',
      activo: true
    });
    // Resetear secciones expandidas
    setExpandedSections({
      personal: true,
      academico: false,
      laboral: false,
      horario: false
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
                <th>Categoría</th>
                <th>HSM Totales</th>
                <th>Turno</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocentes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
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
                    <td>{docente.categoria || 'N/A'}</td>
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
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="form-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('personal')}
                >
                  <h4>Datos Personales</h4>
                  {expandedSections.personal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.personal && (
                  <div className="section-content">
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
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 2: DATOS ACADÉMICOS */}
              <div className="form-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('academico')}
                >
                  <h4>Datos Académicos</h4>
                  {expandedSections.academico ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.academico && (
                  <div className="section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Licenciatura</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.licenciatura}
                          onChange={(e) => setFormData({...formData, licenciatura: e.target.value})}
                          placeholder="Ej: Ingeniería en Sistemas"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={formData.tiene_titulo_licenciatura}
                            onChange={(e) => setFormData({...formData, tiene_titulo_licenciatura: e.target.checked})}
                          />
                          Tiene título de licenciatura
                        </label>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Maestría</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.maestria}
                          onChange={(e) => setFormData({...formData, maestria: e.target.value})}
                          placeholder="Ej: Maestría en Educación"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={formData.tiene_titulo_maestria}
                            onChange={(e) => setFormData({...formData, tiene_titulo_maestria: e.target.checked})}
                          />
                          Tiene título de maestría
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 3: DATOS LABORALES */}
              <div className="form-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('laboral')}
                >
                  <h4>Datos Laborales</h4>
                  {expandedSections.laboral ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.laboral && (
                  <div className="section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                        <label className="form-label">Categoría</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          placeholder="Ej: Profesor Asociado C"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Jornada</label>
                        <select
                          className="form-select"
                          value={formData.jornada}
                          onChange={(e) => setFormData({...formData, jornada: e.target.value})}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="MEDIO_TIEMPO">Medio Tiempo (20 HSM)</option>
                          <option value="TRES_CUARTOS">Tres Cuartos (30 HSM)</option>
                          <option value="TIEMPO_COMPLETO">Tiempo Completo (40 HSM)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">HSM Jornada</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.hsm_jornada}
                          onChange={(e) => setFormData({...formData, hsm_jornada: parseInt(e.target.value) || 0})}
                          min="0"
                          max="40"
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
                        <label className="form-label">
                          HSM Totales: {(formData.hsm_definitivas || 0) + (formData.hsm_adicionales || 0)}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 4: CONFIGURACIÓN DE HORARIO */}
              <div className="form-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('horario')}
                >
                  <h4>Configuración de Horario</h4>
                  {expandedSections.horario ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                {expandedSections.horario && (
                  <div className="section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Hora de Entrada Preferente</label>
                        <input
                          type="time"
                          className="form-input"
                          value={formData.hora_entrada}
                          onChange={(e) => setFormData({...formData, hora_entrada: e.target.value})}
                        />
                        <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          Solo para docentes de base
                        </small>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Horas de Descarga</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.horas_descarga}
                          onChange={(e) => setFormData({...formData, horas_descarga: parseInt(e.target.value) || 0})}
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

                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={formData.activo}
                            onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                          />
                          Docente activo
                        </label>
                      </div>
                    </div>
                  </div>
                )}
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
          width: 95%;
          max-width: 900px;
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

        .form-section {
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
        }

        .section-header:hover {
          background: #f3f4f6;
        }

        .section-header h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #374151;
        }

        .section-content {
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default DocentesPage;
