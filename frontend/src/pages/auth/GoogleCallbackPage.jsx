// import { useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import useAuthStore from '../../store/authStore';
// import useLangStore from '../../i18n';

// export default function GoogleCallbackPage() {
//   const navigate      = useNavigate();
//   const [params]      = useSearchParams();
//   const { checkAuth } = useAuthStore();
//   const { lang }      = useLangStore();
//   const isAr = lang === 'ar';

//   useEffect(() => {
//     // ✅ خطأ من Google
//     if (params.get('error')) {
//       toast.error(isAr ? 'فشل تسجيل الدخول بـ Google' : 'Google login failed');
//       navigate('/login', { replace: true });
//       return;
//     }

//     const accessToken  = params.get('accessToken');
//     const refreshToken = params.get('refreshToken');

//     // ✅ لو في توكنات في الـ URL — احفظهم في كوكيز
//     if (accessToken && refreshToken) {
//       const IS_PROD = window.location.protocol === 'https:';
//       const cookieOpts = `path=/; max-age=${15 * 60}; ${IS_PROD ? 'secure; samesite=none' : 'samesite=lax'}`;
//       const refreshOpts = `path=/; max-age=${30 * 24 * 60 * 60}; ${IS_PROD ? 'secure; samesite=none' : 'samesite=lax'}`;

//       document.cookie = `accessToken=${accessToken}; ${cookieOpts}`;
//       document.cookie = `refreshToken=${refreshToken}; ${refreshOpts}`;

//       // ✅ امسح التوكنات من الـ URL فوراً (أمان)
//       window.history.replaceState({}, '', '/auth/callback');
//     }

//     // ✅ تحقق من الـ auth وروّح للداشبورد
//     checkAuth()
//       .then(() => {
//         const role = useAuthStore.getState().user?.role;
//         if (role === 'admin' || role === 'support') {
//           navigate('/admin', { replace: true });
//         } else if (role === 'company') {
//           navigate('/company/dashboard', { replace: true });
//         } else {
//           navigate('/dashboard', { replace: true });
//         }
//       })
//       .catch(() => {
//         toast.error(isAr ? 'فشل تسجيل الدخول، حاول مرة أخرى' : 'Login failed, please try again');
//         navigate('/login', { replace: true });
//       });
//   }, []);

//   return null;
// }


import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import useLangStore from '../../i18n';

export default function GoogleCallbackPage() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const { checkAuth } = useAuthStore();
  const { lang }      = useLangStore();
  const isAr = lang === 'ar';

  useEffect(() => {
    if (params.get('error')) {
      toast.error(isAr ? 'فشل تسجيل الدخول بـ Google' : 'Google login failed');
      navigate('/login', { replace: true });
      return;
    }

    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    // ✅ امسح التوكنات من الـ URL فوراً
    window.history.replaceState({}, '', '/auth/callback');

    if (!accessToken || !refreshToken) {
      toast.error(isAr ? 'فشل تسجيل الدخول' : 'Login failed');
      navigate('/login', { replace: true });
      return;
    }

    // ✅ أرسل التوكنات للباكند عشان يحطهم في كوكيز httpOnly
    api.post('/auth/set-cookies', { accessToken, refreshToken })
      .then(() => checkAuth())
      .then(() => {
        const role = useAuthStore.getState().user?.role;
        if (role === 'admin' || role === 'support') navigate('/admin', { replace: true });
        else if (role === 'company') navigate('/company/dashboard', { replace: true });
        else navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        toast.error(isAr ? 'فشل تسجيل الدخول' : 'Login failed');
        navigate('/login', { replace: true });
      });
  }, []);

  return null;
}
