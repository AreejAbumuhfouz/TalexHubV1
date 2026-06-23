
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import api from '../services/api';

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       user:            null,
//       isAuthenticated: false,
//       isLoading:       false,
//       error:           null,

//       login: async (email, password, rememberMe = false) => {
//         set({ isLoading: true, error: null });
//         try {
//           const { data } = await api.post('/auth/login', { email, password, rememberMe });
//           set({ user: data.data.user, isAuthenticated: true, isLoading: false });
//           return { success: true, companyStatus: data.data.companyStatus };
//         } catch (err) {
//           const msg   = err.response?.data?.message || 'فشل تسجيل الدخول';
//           const extra = err.response?.data || {};
//           set({ isLoading: false, error: msg });
//           return { success: false, message: msg, ...extra };
//         }
//       },

//       register: async (payload) => {
//         set({ isLoading: true, error: null });
//         try {
//           const { data } = await api.post('/auth/register', payload);
//           set({ isLoading: false });

//           const userId = data?.data?.userId ?? data?.data?.id ?? data?.data?.user?.id;
//           const email  = data?.data?.email  ?? data?.data?.user?.email ?? payload.email;

//           if (!userId) {
//             return { success: false, message: 'Server error: missing userId' };
//           }

//           return { success: true, userId, email };
//         } catch (err) {
//           const msg = err.response?.data?.message || 'فشل إنشاء الحساب';
//           set({ isLoading: false, error: msg });
//           return { success: false, message: msg };
//         }
//       },

//       verifyOtp: async (userId, otp, purpose = 'email_verify') => {
//         set({ isLoading: true });
//         try {
//           await api.post('/auth/verify-otp', { userId, otp, purpose });
//           set({ isLoading: false });
//           return { success: true };
//         } catch (err) {
//           set({ isLoading: false });
//           return { success: false, message: err.response?.data?.message || 'رمز غير صحيح' };
//         }
//       },

//       resendOtp: async (userId, purpose = 'email_verify') => {
//         try {
//           await api.post('/auth/resend-otp', { userId, purpose });
//           return { success: true };
//         } catch (err) {
//           return { success: false, message: err.response?.data?.message };
//         }
//       },

//       forgotPassword: async (email) => {
//         // لا نضبط isLoading هنا لأنه يسبب re-render في PublicRoute ويعمل redirect
//         try {
//           const { data } = await api.post('/auth/forgot-password', { email });
//           return { success: true, userId: data.data?.userId };
//         } catch (err) {
//           return { success: false, message: err.response?.data?.message };
//         }
//       },

//       resetPassword: async (userId, otp, newPassword) => {
//         // لا نضبط isLoading هنا لأنه يسبب re-render في PublicRoute ويعمل redirect
//         try {
//           await api.post('/auth/reset-password', { userId, otp, newPassword });
//           return { success: true };
//         } catch (err) {
//           return { success: false, message: err.response?.data?.message };
//         }
//       },

//       // يستدعى عند تحميل الصفحة — يستعيد المستخدم من الكوكي الـ httpOnly
//       checkAuth: async () => {
//         set({ isLoading: true });
//         try {
//           const { data } = await api.get('/auth/me');
//           set({ user: data.data.user, isAuthenticated: true, isLoading: false });
//         } catch {
//           set({ user: null, isAuthenticated: false, isLoading: false });
//         }
//       },

//       logout: async () => {
//         try { await api.post('/auth/logout'); } catch { /* silent */ }
//         set({ user: null, isAuthenticated: false, error: null });
//       },

//       updateUser: (updates) => set({ user: { ...get().user, ...updates } }),
//       clearError:  ()       => set({ error: null }),
//     }),
//     {
//       name: 'auth-meta',
//       storage: createJSONStorage(() => sessionStorage),
     
//       partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
//     }
//   )
// );

// export default useAuthStore;

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      // ✅ لا نضبط isLoading هنا — يسبب re-render في PublicRoute ويعمل redirect
      login: async (email, password, rememberMe = false) => {
        try {
          const { data } = await api.post('/auth/login', { email, password, rememberMe });
          set({ user: data.data.user, isAuthenticated: true, error: null });
          return { success: true, companyStatus: data.data.companyStatus };
        } catch (err) {
          const msg   = err.response?.data?.message || 'فشل تسجيل الدخول';
          const extra = err.response?.data || {};
          set({ error: msg });
          return { success: false, message: msg, ...extra };
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', payload);
          set({ isLoading: false });

          const userId = data?.data?.userId ?? data?.data?.id ?? data?.data?.user?.id;
          const email  = data?.data?.email  ?? data?.data?.user?.email ?? payload.email;

          if (!userId) {
            return { success: false, message: 'Server error: missing userId' };
          }

          return { success: true, userId, email };
        } catch (err) {
          const msg = err.response?.data?.message || 'فشل إنشاء الحساب';
          set({ isLoading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      verifyOtp: async (userId, otp, purpose = 'email_verify') => {
        set({ isLoading: true });
        try {
          await api.post('/auth/verify-otp', { userId, otp, purpose });
          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'رمز غير صحيح' };
        }
      },

      resendOtp: async (userId, purpose = 'email_verify') => {
        try {
          await api.post('/auth/resend-otp', { userId, purpose });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message };
        }
      },

      forgotPassword: async (email) => {
        try {
          const { data } = await api.post('/auth/forgot-password', { email });
          return { success: true, userId: data.data?.userId };
        } catch (err) {
          return { success: false, message: err.response?.data?.message };
        }
      },

      resetPassword: async (userId, otp, newPassword) => {
        try {
          await api.post('/auth/reset-password', { userId, otp, newPassword });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message };
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* silent */ }
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateUser: (updates) => set({ user: { ...get().user, ...updates } }),
      clearError:  ()       => set({ error: null }),
    }),
    {
      name: 'auth-meta',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;