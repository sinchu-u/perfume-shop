import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5246',
  headers: {
    'Content-Type': 'application/json',
  },
  // Serialize arrays as repeated params: volumes=50&volumes=100
  // (ASP.NET Core expects this format for List<int> from query)
  paramsSerializer: (params) => {
    const parts = [];
    Object.entries(params).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
      } else if (val !== undefined && val !== null && val !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
    });
    return parts.join('&');
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
