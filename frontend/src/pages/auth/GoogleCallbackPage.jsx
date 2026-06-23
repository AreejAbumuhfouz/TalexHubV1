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
      toast.error(isAr ? 'فشل تسجيل الدخول بـ Google، حاول مرة أخرى' : 'Google login failed, please try again');
      navigate('/login', { replace: true });
      return;
    }

    checkAuth()
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        toast.error(isAr ? 'فشل تسجيل الدخول، حاول مرة أخرى' : 'Login failed, please try again');
        navigate('/login', { replace: true });
      });
  }, []);

  return null;
}