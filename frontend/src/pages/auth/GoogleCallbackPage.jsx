import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
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

    checkAuth()
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
