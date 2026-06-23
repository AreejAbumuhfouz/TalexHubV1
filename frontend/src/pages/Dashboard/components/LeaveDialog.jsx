export default function LeaveDialog({ isAr, font, type = 'leave', onConfirm, onCancel }) {
  const isEnd = type === 'end';
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: 'var(--bg-primary)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,.3)', textAlign: 'center', padding: '28px 24px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: isEnd ? 'rgba(239,68,68,.1)' : 'rgba(245,158,11,.1)', border: `2px solid ${isEnd ? 'rgba(239,68,68,.25)' : 'rgba(245,158,11,.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
          {isEnd ? '🚪' : '👋'}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: font, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          {isEnd ? (isAr ? 'إنهاء الغرفة' : 'End Room') : (isAr ? 'مغادرة الغرفة' : 'Leave Room')}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.6, margin: '0 0 24px' }}>
          {isEnd
            ? (isAr ? 'هل أنت متأكد من إنهاء الغرفة للجميع؟ لا يمكن التراجع.' : 'Are you sure you want to end the room for everyone? This cannot be undone.')
            : (isAr ? 'هل تريد مغادرة الغرفة؟ يمكنك العودة لاحقاً.' : 'Are you sure you want to leave the room? You can rejoin later.')
          }
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: isEnd ? '#EF4444' : '#F59E0B', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
            {isEnd ? (isAr ? 'نعم، إنهاء' : 'Yes, End') : (isAr ? 'نعم، مغادرة' : 'Yes, Leave')}
          </button>
        </div>
      </div>
    </div>
  );
}