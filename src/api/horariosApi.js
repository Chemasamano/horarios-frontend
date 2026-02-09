import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// DOCENTES
// ============================================
export const docentesApi = {
  getAll: (params = {}) => api.get('/docentes', { params }),
  getById: (id) => api.get(`/docentes/${id}`),
  create: (data) => api.post('/docentes', data),
  update: (id, data) => api.put(`/docentes/${id}`, data),
  delete: (id) => api.delete(`/docentes/${id}`),
  getHorario: (id, params = {}) => api.get(`/docentes/${id}/horario`, { params })
};

// ============================================
// MATERIAS
// ============================================
export const materiasApi = {
  getAll: (params = {}) => api.get('/materias', { params }),
  getById: (id) => api.get(`/materias/${id}`),
  create: (data) => api.post('/materias', data),
  update: (id, data) => api.put(`/materias/${id}`, data),
  delete: (id) => api.delete(`/materias/${id}`)
};

// ============================================
// GRUPOS
// ============================================
export const gruposApi = {
  getAll: (params = {}) => api.get('/grupos', { params }),
  getById: (id) => api.get(`/grupos/${id}`),
  create: (data) => api.post('/grupos', data),
  update: (id, data) => api.put(`/grupos/${id}`, data),
  delete: (id) => api.delete(`/grupos/${id}`),
  getHorario: (id, params = {}) => api.get(`/grupos/${id}/horario`, { params })
};

// ============================================
// AULAS
// ============================================
export const aulasApi = {
  getAll: (params = {}) => api.get('/aulas', { params }),
  getById: (id) => api.get(`/aulas/${id}`),
  create: (data) => api.post('/aulas', data),
  update: (id, data) => api.put(`/aulas/${id}`, data),
  delete: (id) => api.delete(`/aulas/${id}`),
  verificarDisponibilidad: (id, data) => api.post(`/aulas/${id}/verificar-disponibilidad`, data)
};

// ============================================
// HORARIOS
// ============================================
export const horariosApi = {
  getAll: (params = {}) => api.get('/horarios', { params }),
  getById: (id) => api.get(`/horarios/${id}`),
  create: (data) => api.post('/horarios', data),
  update: (id, data) => api.put(`/horarios/${id}`, data),
  delete: (id) => api.delete(`/horarios/${id}`),
  validar: (data) => api.post('/horarios/validar', data)
};

// ============================================
// CONFIGURACIÓN
// ============================================
export const configuracionApi = {
  getAll: (params = {}) => api.get('/configuracion-horarios', { params }),
  getById: (id) => api.get(`/configuracion-horarios/${id}`),
  create: (data) => api.post('/configuracion-horarios', data),
  update: (id, data) => api.put(`/configuracion-horarios/${id}`, data),
  delete: (id) => api.delete(`/configuracion-horarios/${id}`)
};

// ============================================
// GENERADOR AUTOMÁTICO
// ============================================
export const generadorApi = {
  generar: (data) => api.post('/generador/generar', data),
  vistaPrevia: (params) => api.get('/generador/vista-previa', { params }),
  estadisticas: (params) => api.get('/generador/estadisticas', { params }),
  limpiar: (data) => api.delete('/generador/limpiar', { data }),
  exportar: (params) => api.get('/generador/exportar', { params })
};

// ============================================
// ASIGNACIONES DOCENTE-MATERIA
// ============================================
export const asignacionesApi = {
  getAll: (params = {}) => api.get('/asignaciones', { params }),
  getById: (id) => api.get(`/asignaciones/${id}`),
  create: (data) => api.post('/asignaciones', data),
  update: (id, data) => api.put(`/asignaciones/${id}`, data),
  delete: (id) => api.delete(`/asignaciones/${id}`)
};

export default api;