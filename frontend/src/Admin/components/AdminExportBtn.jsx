'use strict';
/**
 * AdminExportBtn.jsx
 * CSV export/download button — calls /admin/export/:type endpoint.
 * Import: import AdminExportBtn from './AdminExportBtn';
 */

import { useState } from 'react';
import { Icon } from './AdminIcons';
import { C } from './AdminTokens';

export default function AdminExportBtn({ type, label, params = {}, small = false }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const query  = new URLSearchParams(params).toString();
      const url    = `/api/v1/admin/export/${type}${query ? '?' + query : ''}`;
      const res    = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const blob   = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a      = document.createElement('a');
      a.href       = objUrl;
      a.download   = `${type}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      alert('Export failed — please try again');
    }
    setLoading(false);
  };

  return (
    <button onClick={handleExport} disabled={loading}
      style={{
        ...C.btn, ...C.btnGhost,
        padding: small ? '6px 12px' : '9px 16px',
        fontSize: small ? 12 : 13,
        opacity: loading ? 0.7 : 1,
      }}>
      <Icon name="download" size={small ? 13 : 14} />
      {loading ? 'Exporting...' : (label || 'Export CSV')}
    </button>
  );
}