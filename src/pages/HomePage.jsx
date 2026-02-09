import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  UsersRound, 
  Building2, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { docentesApi, materiasApi, gruposApi, aulasApi, horariosApi } from '../api/horariosApi';
import toast from 'react-hot-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    docentes: 0,
    materias: 0,
    grupos: 0,
    aulas: 0,
    horarios: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [docentesRes, materiasRes, gruposRes, aulasRes, horariosRes] = await Promise.all([
        docentesApi.getAll(),
        materiasApi.getAll(),
        gruposApi.getAll(),
        aulasApi.getAll(),
        horariosApi.getAll()
      ]);

      setStats({
        docentes: docentesRes.data.total || 0,
        materias: materiasRes.data.total || 0,
        grupos: gruposRes.data.total || 0,
        aulas: aulasRes.data.total || 0,
        horarios: horariosRes.data.total || 0
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Docentes',
      value: stats.docentes,
      icon: Users,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      route: '/docentes'
    },
    {
      title: 'Materias',
      value: stats.materias,
      icon: BookOpen,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      route: '/materias'
    },
    {
      title: 'Grupos',
      value: stats.grupos,
      icon: UsersRound,
      color: '#10b981',
      bgColor: '#d1fae5',
      route: '/grupos'
    },
    {
      title: 'Aulas',
      value: stats.aulas,
      icon: Building2,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      route: '/aulas'
    },
    {
      title: 'Horarios Generados',
      value: stats.horarios,
      icon: Calendar,
      color: '#ef4444',
      bgColor: '#fee2e2',
      route: '/horarios'
    }
  ];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h2 className="page-title">Panel de Control</h2>
        <p className="page-subtitle">Sistema de Gestión de Horarios Escolares</p>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card"
            onClick={() => navigate(stat.route)}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid #e5e7eb'
            }}
          >
            <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
              <stat.icon size={32} color={stat.color} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones Rápidas */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
          Acciones Rápidas
        </h3>
        <div className="quick-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/docentes')}
          >
            <Users size={18} />
            Registrar Docente
          </button>
          <button 
            className="btn btn-success"
            onClick={() => navigate('/materias')}
          >
            <BookOpen size={18} />
            Registrar Materia
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/grupos')}
          >
            <UsersRound size={18} />
            Registrar Grupo
          </button>
          <button 
            className="btn btn-success"
            onClick={() => navigate('/horarios')}
          >
            <Calendar size={18} />
            Generar Horarios
          </button>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="info-cards" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Clock size={24} color="#3b82f6" />
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Estado del Sistema</h4>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            El sistema está funcionando correctamente
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: '600' }}>Operativo</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <TrendingUp size={24} color="#8b5cf6" />
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Próximos Pasos</h4>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem', color: '#6b7280' }}>
              ✓ Registrar todos los docentes
            </li>
            <li style={{ marginBottom: '0.75rem', color: '#6b7280' }}>
              ✓ Configurar materias y grupos
            </li>
            <li style={{ marginBottom: '0.75rem', color: '#6b7280' }}>
              ✓ Asignar materias a docentes
            </li>
            <li style={{ color: '#6b7280' }}>
              → Generar horarios automáticamente
            </li>
          </ul>
        </div>
      </div>

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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default HomePage;