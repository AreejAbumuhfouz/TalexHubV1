'use strict';
/**
 * AdminPagination.jsx
 * Pagination bar with first/prev/next/last buttons.
 * Import: import AdminPagination from './AdminPagination';
 */

import { Icon } from './AdminIcons';
import { C } from './AdminTokens';

export default function AdminPagination({ page, total, limit, onPage, isRtl }) {
  const totalPages = Math.ceil(total / limit) || 1;
  const start      = (page - 1) * limit + 1;
  const end        = Math.min(page * limit, total);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderTop: '1px solid var(--border)',
      fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', gap: 8,
    }}>
      <span>{start}–{end} of {total}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => onPage(1)} disabled={page <= 1}
          style={{ ...C.btn, ...C.btnGhost, padding: '5px 10px', opacity: page <= 1 ? 0.4 : 1, fontSize: 11 }}>
          {isRtl ? '»' : '«'}
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          style={{ ...C.btn, ...C.btnGhost, padding: '5px 10px', opacity: page <= 1 ? 0.4 : 1 }}>
          <Icon name={isRtl ? 'chevronR' : 'chevronL'} size={13} />
        </button>
        <span style={{ padding: '0 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {page} / {totalPages}
        </span>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          style={{ ...C.btn, ...C.btnGhost, padding: '5px 10px', opacity: page >= totalPages ? 0.4 : 1 }}>
          <Icon name={isRtl ? 'chevronL' : 'chevronR'} size={13} />
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page >= totalPages}
          style={{ ...C.btn, ...C.btnGhost, padding: '5px 10px', opacity: page >= totalPages ? 0.4 : 1, fontSize: 11 }}>
          {isRtl ? '«' : '»'}
        </button>
      </div>
    </div>
  );
}