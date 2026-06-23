import { useState, useEffect } from 'react';
import { Hourglass, Timer } from 'lucide-react';

export default function RoomTimer({ expiresAt, isAr, onWarn }) {
  const [rem, setRem] = useState('');
  const [warned, setWarned] = useState(false);
  useEffect(() => {
    const tick = () => {
      const d = new Date(expiresAt) - new Date();
      if (d <= 0) { setRem(isAr ? 'انتهت' : 'Ended'); return; }
      const m = Math.floor(d / 60000), s = Math.floor((d % 60000) / 1000);
      setRem(`${m}:${s.toString().padStart(2, '0')}`);
      if (m === 5 && !warned) { setWarned(true); onWarn?.(); }
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [expiresAt, isAr, warned]);
  const urgent = rem.includes(':') && parseInt(rem) < 5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-en)', color: urgent ? '#EF4444' : 'var(--text-secondary)', background: urgent ? 'rgba(239,68,68,.07)' : 'var(--bg-secondary)', border: `1px solid ${urgent ? 'rgba(239,68,68,.2)' : 'var(--border)'}` }}>
      {urgent ? <Hourglass size={11} /> : <Timer size={11} />} {rem}
    </div>
  );
}