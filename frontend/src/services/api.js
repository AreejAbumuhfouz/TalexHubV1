
import axios from 'axios';
import toast  from 'react-hot-toast';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout:         30000,
  headers:         { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => config,
  (err) => Promise.reject(err)
);

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;
    const status   = error.response?.status;
    const url      = original?.url || '';

    const shouldRefresh =
      status === 401 &&
      !original._retry &&
      !SKIP_REFRESH.some(s => url.includes(s));

    if (shouldRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr);
        const { default: useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403 && error.response?.data?.upgradeRequired) {
      const msg = error.response.data.message;
      toast.error(
        typeof msg === 'object' ? (msg.ar || msg.en) : (msg || 'يرجى الترقية إلى Pro للوصول لهذه الميزة')
      );
      return Promise.reject(error);
    }

    const message = error.response?.data?.message;
    if (status !== 401 && message && !original?._skipErrorToast) {

      const msg = typeof message === 'object' ? (message.ar || message.en || JSON.stringify(message)) : message;
      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export const initCsrf = async () => {
  const { data } = await api.get('/csrf-token');
  api.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;
};

export default api;

