import React from 'react';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner-container">
        <div className="spinner"></div>
        {message && <p style={{ marginTop: '1rem', color: '#6b7280' }}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;