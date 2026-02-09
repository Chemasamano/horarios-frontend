import React from 'react';
import { Calendar, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <Calendar size={32} color="#3b82f6" />
          <h1>Sistema de Horarios Escolares</h1>
        </div>
        
        <div className="header-actions">
          <span className="text-light">Ciclo: 2026-A</span>
          <button className="btn btn-secondary">
            <Settings size={18} />
            Configuración
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;