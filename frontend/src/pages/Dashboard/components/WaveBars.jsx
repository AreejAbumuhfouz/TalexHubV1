export default function WaveBars({ active, color = '#22C55E', sm = false }) {
  const w = sm ? 2.5 : 3;
  const bars = sm
    ? [{ min: 3, max: 10 }, { min: 5, max: 16 }, { min: 3, max: 12 }, { min: 6, max: 18 }, { min: 3, max: 10 }]
    : [{ min: 4, max: 14 }, { min: 6, max: 20 }, { min: 4, max: 16 }, { min: 7, max: 22 }, { min: 4, max: 14 }];

  return (
    <>
      <div style={{
        display: 'flex',
        gap: sm ? 2 : 3,
        alignItems: 'center',   // ✅ center so bars grow both up and down
        justifyContent: 'center',
        height: sm ? 20 : 28,
      }}>
        {bars.map((b, i) => (
          <div key={i} style={{
            width: w,
            borderRadius: 99,
            background: active ? color : 'var(--border)',
            height: active ? `${b.max}px` : '3px',
            transition: 'height .15s ease, background .2s',
            animation: active ? `wvbar${i} ${0.3 + i * 0.07}s ease-in-out infinite alternate` : 'none',
            transformOrigin: 'center',
          }} />
        ))}
      </div>
      <style>{`
        @keyframes wvbar0 { from { height: ${bars[0].min}px } to { height: ${bars[0].max}px } }
        @keyframes wvbar1 { from { height: ${bars[1].min}px } to { height: ${bars[1].max}px } }
        @keyframes wvbar2 { from { height: ${bars[2].min}px } to { height: ${bars[2].max}px } }
        @keyframes wvbar3 { from { height: ${bars[3].min}px } to { height: ${bars[3].max}px } }
        @keyframes wvbar4 { from { height: ${bars[4].min}px } to { height: ${bars[4].max}px } }
      `}</style>
    </>
  );
}