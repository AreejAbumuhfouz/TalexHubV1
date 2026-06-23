export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      borderRadius: 14,
      border: '1px solid var(--border)',
      padding: '16px 18px',
      animation: 'pulse 1.5s ease-in-out infinite',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 80, height: 12, background: 'var(--bg-secondary)', borderRadius: 4 }} />
        <div style={{ width: 32, height: 32, background: 'var(--bg-secondary)', borderRadius: 9 }} />
      </div>
      <div style={{ width: 60, height: 28, background: 'var(--bg-secondary)', borderRadius: 6, marginTop: 12 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 48,
            background: 'var(--bg-secondary)',
            borderRadius: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 1 - (i * 0.1),
          }}
        />
      ))}
    </div>
  );
}