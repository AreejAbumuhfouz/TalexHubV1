// // import axios from 'axios';
// // import toast  from 'react-hot-toast';

// // const api = axios.create({
// //   baseURL:         import.meta.env.VITE_API_URL,
// //   withCredentials: true,
// //   timeout:         30000,
// //   headers:         { 'Content-Type': 'application/json' },
// // });

// // // ════════════════════════════════════════════════════════════
// // // CSRF — جلب التوكن تلقائياً قبل كل طلب POST/PUT/PATCH/DELETE
// // // ════════════════════════════════════════════════════════════
// // let csrfToken      = null;
// // let csrfFetching   = null; // promise مشترك — ما يتجلب مرتين بنفس الوقت

// // const CSRF_METHODS = ['post', 'put', 'patch', 'delete'];

// // const fetchCsrf = () => {
// //   if (csrfFetching) return csrfFetching;           // انتظر اللي شغال
// //   csrfFetching = axios
// //     .get(`${import.meta.env.VITE_API_URL}/csrf-token`, {
// //       withCredentials: true,
// //     })
// //     .then(({ data }) => {
// //       csrfToken    = data.csrfToken;
// //       csrfFetching = null;
// //       return csrfToken;
// //     })
// //     .catch((err) => {
// //       csrfFetching = null;
// //       throw err;
// //     });
// //   return csrfFetching;
// // };

// // // ✅ Request interceptor — يحط الـ CSRF token تلقائياً
// // api.interceptors.request.use(
// //   async (config) => {
// //     if (CSRF_METHODS.includes(config.method?.toLowerCase())) {
// //       if (!csrfToken) await fetchCsrf();
// //       config.headers['X-CSRF-Token'] = csrfToken;
// //     }
// //     return config;
// //   },
// //   (err) => Promise.reject(err)
// // );

// // // ════════════════════════════════════════════════════════════
// // // Refresh Token Logic
// // // ════════════════════════════════════════════════════════════
// // let isRefreshing = false;
// // let failedQueue  = [];

// // const processQueue = (error) => {
// //   failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
// //   failedQueue = [];
// // };

// // const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register'];

// // api.interceptors.response.use(
// //   (response) => response,

// //   async (error) => {
// //     const original = error.config;
// //     const status   = error.response?.status;
// //     const url      = original?.url || '';

// //     // ✅ لو 403 بسبب CSRF — اجلب توكن جديد وأعد الطلب مرة وحدة
// //     if (status === 403 && error.response?.data?.message === 'Invalid CSRF token') {
// //       if (!original._csrfRetry) {
// //         original._csrfRetry = true;
// //         csrfToken = null;                          // امسح التوكن القديم
// //         await fetchCsrf();                         // جلب جديد
// //         original.headers['X-CSRF-Token'] = csrfToken;
// //         return api(original);                      // أعد الطلب
// //       }
// //     }

// //     const shouldRefresh =
// //       status === 401 &&
// //       !original._retry &&
// //       !SKIP_REFRESH.some(s => url.includes(s));

// //     if (shouldRefresh) {
// //       if (isRefreshing) {
// //         return new Promise((resolve, reject) => {
// //           failedQueue.push({ resolve, reject });
// //         })
// //           .then(() => api(original))
// //           .catch((e) => Promise.reject(e));
// //       }

// //       original._retry = true;
// //       isRefreshing    = true;

// //       try {
// //         await api.post('/auth/refresh');
// //         processQueue(null);
// //         return api(original);
// //       } catch (refreshErr) {
// //         processQueue(refreshErr);
// //         const { default: useAuthStore } = await import('../store/authStore');
// //         useAuthStore.getState().logout();
// //         window.location.href = '/login';
// //         return Promise.reject(refreshErr);
// //       } finally {
// //         isRefreshing = false;
// //       }
// //     }

// //     if (status === 403 && error.response?.data?.upgradeRequired) {
// //       const msg = error.response.data.message;
// //       toast.error(
// //         typeof msg === 'object'
// //           ? (msg.ar || msg.en)
// //           : (msg || 'يرجى الترقية إلى Pro للوصول لهذه الميزة')
// //       );
// //       return Promise.reject(error);
// //     }

// //     const message = error.response?.data?.message;
// //     if (status !== 401 && message && !original?._skipErrorToast) {
// //       const msg = typeof message === 'object'
// //         ? (message.ar || message.en || JSON.stringify(message))
// //         : message;
// //       // لا تعرض خطأ CSRF للمستخدم — بتتحل تلقائياً
// //       if (msg !== 'Invalid CSRF token') toast.error(msg);
// //     }

// //     return Promise.reject(error);
// //   }
// // );

// // // ✅ احتفظ بـ initCsrf للاستخدام اليدوي لو احتجته
// // export const initCsrf = fetchCsrf;

// // export default api;


// import axios from 'axios';
// import toast  from 'react-hot-toast';

// const api = axios.create({
//   baseURL:         import.meta.env.VITE_API_URL,
//   withCredentials: true,   // ✅ مهم للـ cookies
//   timeout:         30000,
//   headers:         { 'Content-Type': 'application/json' },
// });

// // ✅ Request interceptor — بسيط بدون CSRF
// api.interceptors.request.use(
//   (config) => config,
//   (err) => Promise.reject(err)
// );

// // ════════════════════════════════════════════════════════════
// // Refresh Token Logic
// // ════════════════════════════════════════════════════════════
// let isRefreshing = false;
// let failedQueue  = [];

// const processQueue = (error) => {
//   failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
//   failedQueue = [];
// };

// const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register'];

// api.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const original = error.config;
//     const status   = error.response?.status;
//     const url      = original?.url || '';

//     const shouldRefresh =
//       status === 401 &&
//       !original._retry &&
//       !SKIP_REFRESH.some(s => url.includes(s));

//     if (shouldRefresh) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(() => api(original))
//           .catch((e) => Promise.reject(e));
//       }

//       original._retry = true;
//       isRefreshing    = true;

//       try {
//         await api.post('/auth/refresh');
//         processQueue(null);
//         return api(original);
//       } catch (refreshErr) {
//         processQueue(refreshErr);
//         const { default: useAuthStore } = await import('../store/authStore');
//         useAuthStore.getState().logout();
//         window.location.href = '/login';
//         return Promise.reject(refreshErr);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     if (status === 403 && error.response?.data?.upgradeRequired) {
//       const msg = error.response.data.message;
//       toast.error(
//         typeof msg === 'object'
//           ? (msg.ar || msg.en)
//           : (msg || 'يرجى الترقية إلى Pro للوصول لهذه الميزة')
//       );
//       return Promise.reject(error);
//     }

//     const message = error.response?.data?.message;
//     if (status !== 401 && message && !original?._skipErrorToast) {
//       const msg = typeof message === 'object'
//         ? (message.ar || message.en || JSON.stringify(message))
//         : message;
//       toast.error(msg);
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from 'axios';
import toast  from 'react-hot-toast';

const api = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,   // ✅ مهم للكوكيز
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

const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/set-cookies'];

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
        typeof msg === 'object' ? (msg.ar || msg.en) : (msg || 'يرجى الترقية إلى Pro')
      );
      return Promise.reject(error);
    }

    const message = error.response?.data?.message;
    if (status !== 401 && message && !original?._skipErrorToast) {
      const msg = typeof message === 'object'
        ? (message.ar || message.en || JSON.stringify(message))
        : message;
      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;
