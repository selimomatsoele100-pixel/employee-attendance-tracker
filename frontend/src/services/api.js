import axios from 'axios';

// Auto-detect environment - use relative path in production
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  create: (data) => api.post('/attendance', data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getByEmployeeID: (employeeID) => api.get(`/attendance/employee/${employeeID}`),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
};

export default api;