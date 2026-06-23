
import { Link } from 'react-router-dom';
import useLangStore from '../../i18n';
import LogoGold from '../../assets/images/LogoGold.png';

export default function AuthLayout({ children, side }) {
  const { lang, dir } = useLangStore();
  const isAr = lang === 'ar';

  return (
    <div dir={dir} style={{ minHeight:'100vh', display:'flex', background:'var(--bg-primary)' }}>
      <style>{`
        @media (max-width: 1023px) { .al-side { display: none !important; } }
        @media (min-width: 1024px) { .al-side { display: flex !important; } }
      `}</style>

      {/* ── Decorative side panel ── */}
      <div className="al-side" style={{
        width:'42%', flexShrink:0,
        background:'var(--bg-secondary)',
        borderInlineEnd:'1px solid var(--border)',
        flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'60px 48px',
        position:'relative', overflow:'hidden',
      }}>
        {/* Subtle shapes */}
        <div style={{ position:'absolute', top:-80, insetInlineEnd:-80, width:300, height:300, borderRadius:'50%', background:'rgba(26,26,30,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, insetInlineStart:-100, width:400, height:400, borderRadius:'50%', background:'rgba(26,26,30,0.03)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'40%', insetInlineStart:32, width:1, height:160, background:'linear-gradient(to bottom, transparent, var(--border), transparent)' }} />

        {/* Logo */}
        <Link to="/" style={{ textDecoration:'none', marginBottom:40, display:'block' }}>
          <img src={LogoGold} alt="TalexHub" style={{ height:42, width:'auto', objectFit:'contain' }} />
        </Link>

        {/* Slot content */}
        <div style={{ position:'relative', zIndex:1, textAlign:'center', color:'var(--text-primary)', width:'100%' }}>
          {side}
        </div>

        {/* Trust badge */}
        <div style={{
          position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
          display:'flex', alignItems:'center', gap:8,
          background:'var(--bg-tertiary)',
          border:'1px solid var(--border)',
          borderRadius:99, padding:'7px 16px', whiteSpace:'nowrap',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--success)', boxShadow:`0 0 7px var(--success)`, flexShrink:0 }} />
          <span style={{ fontSize:12, color:'var(--text-secondary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
            {isAr ? '+45,000 مستخدم نشط' : '+45,000 Active Users'}
          </span>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'40px 32px', overflowY:'auto',
        background:'var(--bg-primary)',
      }}>
        {/* Mobile logo */}
        <Link to="/" className="al-side-hidden" style={{ textDecoration:'none', marginBottom:32, display:'block' }}>
          <img src={LogoGold} alt="TalexHub" style={{ height:36, width:'auto', objectFit:'contain' }} />
        </Link>

        <div style={{ width:'100%', maxWidth:440 }}>
          {children}
        </div>
      </div>
    </div>
  );
}