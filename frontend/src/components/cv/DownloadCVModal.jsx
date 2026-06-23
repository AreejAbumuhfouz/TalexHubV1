

import { useState, useEffect, useRef } from 'react';
import { Download, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';

// ════════════════════════════════════════════════════════════
// Client-side PDF — always available, no server needed
// ════════════════════════════════════════════════════════════
const clientPDF = async (html, fileName) => {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const A4_PX = 794;
  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, {
    position: 'fixed', top: '0', left: '0',
    width: `${A4_PX}px`, height: '1px',
    opacity: '0', pointerEvents: 'none',
    zIndex: '-9999', border: 'none', background: '#fff',
  });
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  await new Promise(r => setTimeout(r, 900));

  const body    = iframe.contentDocument.body;
  const scrollH = Math.max(body.scrollHeight, body.offsetHeight, 200);
  iframe.style.height = `${scrollH}px`;
  await new Promise(r => setTimeout(r, 200));

  try {
    const canvas = await html2canvas(body, {
      scale: 2.5, useCORS: false, allowTaint: true,
      backgroundColor: '#ffffff', logging: false,
      width: A4_PX, height: scrollH,
      windowWidth: A4_PX, windowHeight: scrollH,
      scrollX: 0, scrollY: 0,
    });

    const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pgW  = pdf.internal.pageSize.getWidth();
    const pgH  = pdf.internal.pageSize.getHeight();
    const pgPx = Math.floor((pgH / pgW) * canvas.width);

    let yPx = 0, page = 0;
    while (yPx < canvas.height && page < 10) {
      if (page > 0) pdf.addPage();
      const sliceH = Math.min(pgPx, canvas.height - yPx);
      const slice  = document.createElement('canvas');
      slice.width  = canvas.width;
      slice.height = pgPx;
      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, yPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      pdf.addImage(slice.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, pgW,
        (pgPx / canvas.width) * pgW, undefined, 'FAST');
      yPx += sliceH;
      page++;
    }
    pdf.save(`${fileName}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
};

// ════════════════════════════════════════════════════════════
// Server-side PDF — higher quality, stored in R2
// Returns { url } on success, throws on failure
// يستخدم الكوكيز الـ httpOnly تلقائياً (credentials: include)
// لا نحتاج localStorage أو token في الـ header
// ════════════════════════════════════════════════════════════
const serverPDF = async (html, fileName, cvId) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/cvs/generate-pdf`, {
    method:      'POST',
    credentials: 'include',           // الكوكي httpOnly يُرسل تلقائياً
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ html, cvId }),
  });

  if (!res.ok) {
    // Don't throw the server message as a visible error — just signal failure
    throw new Error('SERVER_FAIL');
  }

  const data = await res.json();
  const url  = data?.data?.downloadUrl;
  if (!url) throw new Error('SERVER_FAIL');

  // Trigger browser download
  const a = document.createElement('a');
  a.href     = url;
  a.download = `${fileName}.pdf`;
  a.target   = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ════════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════════
export default function DownloadCVModal({ html, defaultName, isAr, onClose, cvId }) {
  const [name,   setName]   = useState('');
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const [err,    setErr]    = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const now  = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const base = (defaultName || (isAr ? 'سيرتي الذاتية' : 'My CV'))
      .replace(/[^\w\u0600-\u06FF\s\-]/g, '').trim();
    setName(`${base} ${date}`);
    setTimeout(() => inputRef.current?.select(), 120);
  }, [defaultName, isAr]);

  const handleDownload = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    setErr('');
    try {
      // 1. Try server PDF silently (no toast on failure)
      let usedServer = false;
      try {
        await serverPDF(html, name.trim(), cvId);
        usedServer = true;
      } catch {
        // Server failed — fall through to client silently
      }

      // 2. Client-side fallback if server failed
      if (!usedServer) {
        await clientPDF(html, name.trim());
      }

      setDone(true);
    } catch (e) {
      console.error('PDF generation failed:', e);
      setErr(isAr
        ? 'فشل إنشاء PDF — يرجى المحاولة مرة أخرى'
        : 'Failed to generate PDF — please try again');
    } finally {
      setSaving(false);
    }
  };

  const suggestions = [
    defaultName ? `${defaultName} CV` : null,
    isAr ? `سيرة ذاتية ${new Date().getFullYear()}` : `Resume ${new Date().getFullYear()}`,
    isAr ? 'سيرتي الذاتية' : 'My CV',
  ].filter(Boolean);

  return (
    <>
      <div onClick={!saving ? onClose : undefined}
        style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', animation:'dl-fade .2s ease' }} />

      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        zIndex:201, width:'min(420px,calc(100vw - 24px))',
        background:'var(--bg-primary)', border:'1px solid var(--border)',
        borderRadius:20, boxShadow:'0 32px 80px rgba(0,0,0,.22)',
        overflow:'hidden', animation:'dl-up .28s cubic-bezier(.4,0,.2,1)',
        direction: isAr?'rtl':'ltr', fontFamily: isAr?'var(--font-ar)':'var(--font-en)',
      }}>
        <div style={{ height:3, background:'linear-gradient(90deg,#6366F1,#8B5CF6,#EC4899)' }} />

        {/* Header */}
        <div style={{ padding:'18px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FileText size={19} color="var(--text-secondary)" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize:14.5, fontWeight:800, color:'var(--text-primary)', margin:0, letterSpacing:'-.02em' }}>
                {isAr ? 'تحميل PDF' : 'Download PDF'}
              </p>
              <p style={{ fontSize:11.5, color:'var(--text-secondary)', margin:0 }}>
                {saving
                  ? (isAr ? 'جاري إنشاء الملف...' : 'Generating your file...')
                  : (isAr ? 'يُحفظ مباشرة في جهازك' : 'Saves directly to your device')}
              </p>
            </div>
          </div>
          <button onClick={!saving ? onClose : undefined} disabled={saving}
            style={{ width:28, height:28, borderRadius:8, background:'var(--bg-secondary)', border:'1px solid var(--border)', cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:saving?.4:1 }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.borderColor='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
            <X size={13} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:20 }}>
          {!done ? (
            <>
              <label style={{ fontSize:10, fontWeight:700, color:'var(--text-secondary)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.1em' }}>
                {isAr ? 'اسم الملف' : 'File Name'}
              </label>
              <div style={{ display:'flex', alignItems:'center', border:'1.5px solid var(--border)', borderRadius:11, overflow:'hidden', background:'var(--bg-secondary)', marginBottom:10 }}
                onFocusCapture={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,.1)'; }}
                onBlurCapture={e  => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}>
                <input ref={inputRef} value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleDownload()}
                  placeholder={isAr ? 'اسم الملف...' : 'File name...'}
                  style={{ flex:1, padding:'11px 14px', border:'none', outline:'none', background:'transparent', fontSize:13.5, color:'var(--text-primary)', fontFamily:'inherit' }} />
                <span style={{ padding:'0 12px', fontSize:11.5, fontWeight:700, color:'var(--text-secondary)', borderInlineStart:'1px solid var(--border)', background:'var(--bg-primary)', lineHeight:'44px', fontFamily:'monospace' }}>.pdf</span>
              </div>

              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
                {suggestions.map((s,i) => (
                  <button key={i} onClick={() => setName(s)}
                    style={{ padding:'4px 10px', borderRadius:7, cursor:'pointer', fontSize:11.5, fontFamily:'inherit', transition:'all .15s', background:name===s?'var(--text-primary)':'var(--bg-secondary)', color:name===s?'var(--bg-primary)':'var(--text-secondary)', border:`1px solid ${name===s?'var(--text-primary)':'var(--border)'}` }}>
                    {s}
                  </button>
                ))}
              </div>

              {err && (
                <div style={{ padding:'9px 12px', background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.2)', borderRadius:9, marginBottom:12 }}>
                  <p style={{ fontSize:12, color:'#EF4444', margin:0 }}>{err}</p>
                </div>
              )}

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={!saving ? onClose : undefined} disabled={saving}
                  style={{ flex:1, padding:'11px', borderRadius:11, border:'1.5px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:saving?'not-allowed':'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', opacity:saving?.5:1 }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.borderColor='var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button onClick={handleDownload} disabled={saving || !name.trim()}
                  style={{ flex:2, padding:'11px', borderRadius:11, border:'none', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13, fontWeight:700, transition:'all .2s', background:(saving||!name.trim())?'var(--border)':'var(--text-primary)', color:(saving||!name.trim())?'var(--text-secondary)':'var(--bg-primary)', cursor:(saving||!name.trim())?'not-allowed':'pointer' }}
                  onMouseEnter={e => { if (!saving && name.trim()) { e.currentTarget.style.opacity='.88'; e.currentTarget.style.transform='translateY(-1px)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='none'; }}>
                  {saving
                    ? <><Loader2 size={15} style={{ animation:'dl-spin .8s linear infinite' }} />{isAr ? 'جاري الإنشاء...' : 'Generating...'}</>
                    : <><Download size={15} strokeWidth={2.5} />{isAr ? 'تحميل PDF' : 'Download PDF'}</>}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'12px 0 8px' }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(34,197,94,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <CheckCircle2 size={30} color="#22C55E" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize:16, fontWeight:800, color:'var(--text-primary)', margin:'0 0 7px', letterSpacing:'-.025em' }}>
                {isAr ? 'تم التحميل بنجاح ✓' : 'Downloaded Successfully ✓'}
              </p>
              <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:'0 0 22px', lineHeight:1.65 }}>
                {isAr ? `تم حفظ "${name}.pdf"` : `"${name}.pdf" saved to Downloads`}
              </p>
              <button onClick={onClose}
                style={{ padding:'10px 32px', borderRadius:11, border:'none', background:'var(--text-primary)', color:'var(--bg-primary)', cursor:'pointer', fontSize:13.5, fontWeight:700, fontFamily:'inherit' }}>
                {isAr ? 'تم ✓' : 'Done ✓'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dl-fade { from{opacity:0} to{opacity:1} }
        @keyframes dl-up   { from{opacity:0;transform:translate(-50%,-47%)} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes dl-spin { to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}