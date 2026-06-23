
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';
import { LoadingSpinner } from './index';

export default function CompanyActiveGuard({ children }) {
  const [status,  setStatus]  = useState(undefined); // undefined = لسا بيحمّل
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api.get('/companies/me')
      .then(r => setStatus(r.data.data.company?.status || null))
      .catch(() => setStatus(null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return <LoadingSpinner fullScreen />;

  if (status !== 'active') {
    return <Navigate to="/company/profile" replace />;
  }

  return children;
}