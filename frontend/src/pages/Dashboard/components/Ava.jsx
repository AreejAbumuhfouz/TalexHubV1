import { Crown, Shield, Hand, MicOff } from 'lucide-react';

export default function Ava({ name, url, size = 40, speaking = false, muted = false, host = false, cohost = false, hand = false }) {
  const init = (name || '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const ring = speaking ? '#22C55E' : host ? '#F59E0B' : cohost ? '#818CF8' : 'transparent';
  
  const Chip = ({ c, children }) => (
    <div style={{ width: 15, height: 15, borderRadius: '50%', background: c, border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
  );

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', border: `2.5px solid ${ring}`, boxShadow: speaking ? '0 0 0 3px rgba(34,197,94,.18)' : 'none', overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s' }}>
        {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#818CF8,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * .33, fontWeight: 700, color: '#fff' }}>{init}</div>}
      </div>
      {host && <div style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)' }}><Crown size={14} color="#F59E0B" fill="#F59E0B" /></div>}
      {(muted || cohost || hand) && (
        <div style={{ position: 'absolute', bottom: -2, right: -2, display: 'flex', gap: 2 }}>
          {cohost && !host && <Chip c="#818CF8"><Shield size={8} color="#fff" /></Chip>}
          {hand && !host && !cohost && <Chip c="#F59E0B"><Hand size={8} color="#fff" /></Chip>}
          {muted && <Chip c="#EF4444"><MicOff size={7} color="#fff" /></Chip>}
        </div>
      )}
    </div>
  );
}