'use strict';
/**
 * useAdminTable.js
 * Reusable data-fetch hook used by every admin tab.
 *
 * Usage:
 *   const { rows, total, page, setPage, loading, setParams, reload, limit } =
 *     useAdminTable('/admin/users', 20);
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function useAdminTable(endpoint, defaultLimit = 20) {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [params, setParams]   = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page, limit: defaultLimit, ...params };
      const r = await api.get(endpoint, { params: p });
      setRows(r.data.data || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    setLoading(false);
  }, [endpoint, page, params]);

  useEffect(() => { load(); }, [page, params]);

  return {
    rows, total, page, setPage,
    loading, params, setParams,
    reload: load,
    limit: defaultLimit,
  };
}