'use strict';
/**
 * AdminSearch.jsx
 * Search input + filter selects bar.
 * Import: import AdminSearch from './AdminSearch';
 *
 * filters: [{ value, onChange, options: [{ value, label }] }]
 */

import { Icon } from './AdminIcons';
import { C } from './AdminTokens';

export default function AdminSearch({ value, onChange, placeholder = 'Search...', filters = [], isRtl }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Search input */}
      <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
        <div style={{
          position: 'absolute', top: '50%',
          [isRtl ? 'right' : 'left']: 11,
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)',
          pointerEvents: 'none',
        }}>
          <Icon name="search" size={14} />
        </div>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ ...C.input, [isRtl ? 'paddingRight' : 'paddingLeft']: 36 }}
          onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
      </div>

      {/* Filter selects */}
      {filters.map((f, i) => (
        <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)}
          style={{ ...C.select, width: 'auto', minWidth: 130 }}>
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
    </div>
  );
}