'use strict';
/**
 * AdminStatCard.jsx
 * Stat card with icon, label, value, optional sub-label.
 * Import: import AdminStatCard from './AdminStatCard';
 */

import { Icon } from './AdminIcons';
import { C } from './AdminTokens';

export default function AdminStatCard({ label, value, icon, color = '#7B72EE', sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      ...C.card, padding: '18px 20px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'none')}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value ?? <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>—</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}