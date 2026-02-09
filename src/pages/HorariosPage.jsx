import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Zap, 
  Eye, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { generadorApi, horariosApi } from '../api/horariosApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HorariosPage = () => {
  const [loading, setLoading] = useState(false);
  const [cicloEscolar, setCicloEscolar] = useState('2026-A');
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [showVistaPrevia, setShowVistaPrevia] = useState(false);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    loadHorarios();
    loadEstadisticas();
  }, [cicloEscolar]);

  const loadHorarios = async () => {
    try {
      const response = await horariosApi.getAll({ ciclo_escolar: cicloEscolar });
      setHorarios(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const loadEstadisticas = async () => {
    try {
      const response = await generadorApi.estadisticas({ ciclo_escolar: cicloEscolar });
      setEstadisticas(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleVistaPrevia = async () => {
    setLoading(true);
    try {
      const response = await generadorApi.vistaPrevia({ ciclo_escolar: cicloEscolar });
      setVistaPrevia(response.data.data);
      setShowVistaPrevia(true);
    } catch (error) {
      toast.error('Error al obtener vista previa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerar = async () => {
    if (!window.confirm('¿Está seguro de generar los horarios automáticamente? Esto eliminará los horarios existentes.')) {
      return;
    }

    setGenerando(true);
    try {
      const response = await generadorApi.generar({ ciclo_escolar: cicloEscolar });
      
      if (response.data.success) {
        toast.success(`¡Horarios generados! Total: ${response.data.horarios_generados}`);
        loadHorarios();
        loadEstadisticas();
        
        if (response.data.errores && response.data.errores.length > 0) {
          console.warn('Errores durante la generación:', response.data.errores);
        }
      } else {
        toast.error(response.data.message || 'Error al generar horarios');
      }
    } catch (error) {
      toast.error('Error al generar horarios');
      console.error(error);
    } finally {
      setGenerando(false);
    }
  };

  const handleLimpiar = async () => {
    if (!window.confirm('¿Está seguro de eliminar TODOS los horarios del ciclo?')) {
      return;
    }

    try {
      const response = await generadorApi.limpiar({ ciclo_escolar: cicloEscolar });
      toast.success(response.data.message);
      loadHorarios();
      loadEstadisticas();
    } catch (error) {
      toast.error('Error al limpiar horarios');
      console.error(error);
    }
  };

  const handleExportar = async (tipo) => {
    try {
      const response = await generadorApi.exportar({ 
        ciclo_escolar: cicloEscolar,
        tipo: tipo 
      });
      
      // Crear y descargar archivo JSON
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `horarios_${tipo}_${cicloEscolar}.json`;
      link.click();
      
      toast.success('Horarios exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar horarios');
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando información de horarios..." />;

  return (
    <div className="horarios-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title">Generador de Horarios</h2>
        <p className="page-subtitle">Generación automática de horarios escolares</p>
      </div>

      {/* Selector de Ciclo Escolar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Ciclo Escolar</label>
          <select
            className="form-select"
            style={{ maxWidth: '300px' }}
            value={cicloEscolar}
            onChange={(e) => setCicloEscolar(e.target.value)}
          >
            <option value="2026-A">2026-A</option>
            <option value="2026-B">2026-B</option>
            <option value="2027-A">2027-A</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={24} color="#3b82f6" />
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Total Horarios
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {estadisticas.resumen.total_horarios}
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={24} color="#10b981" />
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Automáticos
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {estadisticas.resumen.generados_automaticamente}
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={24} color="#8b5cf6" />
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Docentes
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {estadisticas.resumen.docentes_con_horario}
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={24} color="#f59e0b" />
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Grupos
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {estadisticas.resumen.grupos_con_horario}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones Principales */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
          Acciones
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className="btn btn-primary"
            onClick={handleVistaPrevia}
            disabled={loading}
          >
            <Eye size={18} />
            Vista Previa
          </button>

          <button 
            className="btn btn-success"
            onClick={handleGenerar}
            disabled={generando}
          >
            <Zap size={18} />
            {generando ? 'Generando...' : 'Generar Horarios'}
          </button>

          <button 
            className="btn btn-danger"
            onClick={handleLimpiar}
          >
            <Trash2 size={18} />
            Limpiar Horarios
          </button>
        </div>

        {/* Exportar */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
            Exportar Horarios
          </h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => handleExportar('docente')}
            >
              <Download size={18} />
              Por Docente
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => handleExportar('grupo')}
            >
              <Download size={18} />
              Por Grupo
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => handleExportar('aula')}
            >
              <Download size={18} />
              Por Aula
            </button>
          </div>
        </div>
      </div>

      {/* Vista Previa Modal */}
      {showVistaPrevia && vistaPrevia && (
        <div className="modal-overlay" onClick={() => setShowVistaPrevia(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Vista Previa - {cicloEscolar}</h3>
              <button onClick={() => setShowVistaPrevia(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                Estadísticas Previas
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Docentes Activos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {vistaPrevia.estadisticas.docentes_activos}
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Grupos del Ciclo</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {vistaPrevia.estadisticas.grupos_ciclo}
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Aulas Disponibles</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {vistaPrevia.estadisticas.aulas_disponibles}
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Horarios Existentes</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {vistaPrevia.estadisticas.horarios_existentes}
                  </p>
                </div>
              </div>
            </div>

            {vistaPrevia.advertencias && vistaPrevia.advertencias.length > 0 && (
              <div style={{ 
                padding: '1rem', 
                background: '#fef3c7', 
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <strong style={{ color: '#92400e' }}>Advertencias:</strong>
                </div>
                <ul style={{ marginLeft: '1.5rem', color: '#92400e' }}>
                  {vistaPrevia.advertencias.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowVistaPrevia(false)}
              >
                Cerrar
              </button>
              {vistaPrevia.puede_generar && (
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    setShowVistaPrevia(false);
                    handleGenerar();
                  }}
                >
                  <Zap size={18} />
                  Continuar y Generar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Horarios Generados */}
      {horarios.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Horarios Generados ({horarios.length})
          </h3>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Hora</th>
                  <th>Docente</th>
                  <th>Materia</th>
                  <th>Grupo</th>
                  <th>Aula</th>
                  <th>Turno</th>
                </tr>
              </thead>
              <tbody>
                {horarios.slice(0, 20).map((horario) => (
                  <tr key={horario.id}>
                    <td><strong>{horario.dia_semana}</strong></td>
                    <td>{horario.hora_inicio} - {horario.hora_fin}</td>
                    <td>{horario.docente?.nombre_completo || 'N/A'}</td>
                    <td>{horario.materia?.nombre || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">
                        {horario.grupo?.numero_grupo || 'N/A'}
                      </span>
                    </td>
                    <td>{horario.aula?.numero_aula || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        horario.turno === 'MATUTINO' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {horario.turno}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {horarios.length > 20 && (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Mostrando 20 de {horarios.length} horarios. Exporta para ver todos.
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 1rem;
        }

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

export default HorariosPage;