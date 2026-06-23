'use strict';
/**
 * AdminBadge.jsx
 * Status and plan badge component.
 * Import: import AdminBadge from './AdminBadge';
 */

import { STATUS_COLORS } from './AdminTokens';

export default function AdminBadge({ value, custom }) {
  const key    = (value || '').toLowerCase().replace(/ /g, '_');
  const colors = custom || STATUS_COLORS[key] || { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
      background: colors.bg, color: colors.color,
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  );
}