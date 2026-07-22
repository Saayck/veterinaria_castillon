import axios from 'axios';

// En despliegue partido (frontend en Pages + backend en otra URL) se define VITE_API_URL.
// Local/Docker: vacío → llamadas relativas /api que nginx reenvía al backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    // Salta las páginas de aviso de túneles gratuitos (localtunnel / ngrok) en las llamadas XHR.
    'bypass-tunnel-reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('user');
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
