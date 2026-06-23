'use strict';
/**
 * AdminTable.jsx
 * Reusable data table with loading state, empty state, hover rows.
 * Import: import AdminTable from './AdminTable';
 */

import { C } from './AdminTokens';
import { Spinner } from './AdminUI';

export default function AdminTable({ columns, rows, loading, empty = 'No data', isRtl, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ ...C.th, textAlign: isRtl ? 'right' : 'left', width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ ...C.td, textAlign: 'center', padding: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                  <Spinner size={18} /> Loading...
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ ...C.td, textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                {empty}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={row.id || i}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map((col, j) => (
                <td key={j} style={{ ...C.td, textAlign: isRtl ? 'right' : 'left' }}>
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}