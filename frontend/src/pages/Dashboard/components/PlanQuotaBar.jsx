import { Crown, Layers, Timer, Users, Zap, AlertCircle } from 'lucide-react';
import { DEFAULT_PLANS } from './utils';

export default function PlanQuotaBar({ planKey, plans, usedToday, usedMonth, isAr, font }) {
  const cfg = plans[planKey] || DEFAULT_PLANS[planKey] || DEFAULT_PLANS.free;
  const col = cfg.color;
  const dayMax = cfg.maxRoomsPerDay || 0;
  const monMax = cfg.maxRoomsPerMonth || 0;
  const dayUsed = usedToday || 0;
  const monUsed = usedMonth || 0;
  const dayLeft = dayMax === 0 ? 0 : Math.max(0, dayMax - dayUsed);
  const monLeft = monMax === 0 ? 0 : Math.max(0, monMax - monUsed);
  const exhausted = cfg.canCreate && dayMax > 0 && dayLeft === 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      padding: '11px 16px', borderRadius: 14,
      background: exhausted ? 'rgba(239,68,68,.05)' : col + '08',
      border: `1px solid ${exhausted ? 'rgba(239,68,68,.2)' : col + '25'}`,
      marginBottom: 20,
    }}>
      {/* <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: col + '15', border: `1px solid ${col}30` }}>
        <Crown size={11} color={col} fill={col} />
        <span style={{ fontSize: 11.5, fontWeight: 800, color: col, fontFamily: font }}>{cfg.label}</span>
      </div> */}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: 1 }}>
        {[
          { icon: <Layers size={11} />, val: cfg.stages, label: isAr ? 'منصات' : 'Stages' },
          { icon: <Timer size={11} />, val: `${cfg.durationMinutes}${isAr ? 'د' : 'm'}`, label: isAr ? 'مدة' : 'Duration' },
          { icon: <Users size={11} />, val: cfg.capacity, label: isAr ? 'سعة' : 'Capacity' },
        ].map((s, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>
            {s.icon} <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{s.val}</strong> {s.label}
          </span>
        ))}
      </div>

      {cfg.canCreate ? (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 4 }}>{isAr ? 'اليوم' : 'Today'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 50, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dayMax > 0 ? Math.min(100, (dayUsed / dayMax) * 100) : 0}%`, background: dayLeft === 0 ? '#EF4444' : col, borderRadius: 3, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: dayLeft === 0 ? '#EF4444' : col, fontFamily: 'var(--font-en)' }}>{dayUsed}/{dayMax}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 4 }}>{isAr ? 'الشهر' : 'Month'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 50, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${monMax > 0 ? Math.min(100, (monUsed / monMax) * 100) : 0}%`, background: monLeft === 0 ? '#EF4444' : col, borderRadius: 3, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: monLeft === 0 ? '#EF4444' : col, fontFamily: 'var(--font-en)' }}>{monUsed}/{monMax}</span>
            </div>
          </div>
          {exhausted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444', fontFamily: font }}>
              <AlertCircle size={12} /> {isAr ? 'انتهى الحد' : 'Limit reached'}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>
          <Zap size={12} color={col} />
          {isAr ? 'الإنشاء يتطلب Pro' : 'Creation requires Pro'}
          <a href="/pricing" style={{ color: col, fontWeight: 700, textDecoration: 'none', fontSize: 11 }}>{isAr ? 'ترقية ←' : '→ Upgrade'}</a>
        </div>
      )}
    </div>
  );
}