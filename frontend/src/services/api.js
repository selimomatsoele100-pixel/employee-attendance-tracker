import axios from 'axios';

// Production backend URL (Render)
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://employee-attendance-tracker-3.onrender.com/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('[API Error] Backend not reachable. Please check if the server is running.');
    } else {
      console.error('[API Error]', error.response);
    }
    return Promise.reject(error);
  }
);

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
