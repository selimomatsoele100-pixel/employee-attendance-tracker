import axios from 'axios';

// Detect environment: localhost in development, deployed backend in production
const API_BASE_URL =
  process.env.REACT_APP_API_URL || (
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://YOUR_DEPLOYED_BACKEND_URL/api'
  );

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Log requests and handle errors
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error(
        '[API Error] Backend not reachable. Please check if the server is running.'
      );
    } else {
      console.error('[API Error]', error.response);
    }
    return Promise.reject(error);
  }
);

// Attendance API
export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  create: (data) => api.post('/attendance', data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getByEmployeeID: (employeeID) => api.get(`/attendance/employee/${employeeID}`),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
};

// Stats API
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
};

export default api;
