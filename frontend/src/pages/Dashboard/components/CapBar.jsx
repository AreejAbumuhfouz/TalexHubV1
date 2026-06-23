export default function CapBar({ current, max }) {
  const p = Math.min(100, Math.round((current / max) * 100));
  const c = p > 90 ? '#EF4444' : p > 70 ? '#F59E0B' : '#22C55E';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 50, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: c, borderRadius: 2, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{current}/{max}</span>
    </div>
  );
}