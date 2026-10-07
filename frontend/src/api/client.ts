import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

function isStudentCall(url?: string) {
  const u = url || '';
  return u.includes('/students/verify') || u.includes('/auth/student');
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(isStudentCall(config.url) ? 'studentToken' : 'token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !isStudentCall(err.config?.url)) {
      const hadAdmin = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      if (hadAdmin && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    if (err.response?.status === 401 && isStudentCall(err.config?.url)) {
      const hadStudent = !!localStorage.getItem('studentToken');
      localStorage.removeItem('studentToken');
      localStorage.removeItem('student');
      if (hadStudent && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
