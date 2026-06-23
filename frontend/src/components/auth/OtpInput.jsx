import { useRef } from 'react';

export default function OtpInput({ value = '', onChange, length = 6, hasError = false }) {
  // Refs must be created at top level — never inside a loop
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const allRefs = [ref0, ref1, ref2, ref3, ref4, ref5];
  const refs = allRefs.slice(0, length);

  const vals = value.split('');

  const handleChange = (i, v) => {
    const digit = v.replace(/\D/, '');
    const arr   = [...vals];
    arr[i]      = digit || '';
    onChange(arr.join(''));
    if (digit && i < length - 1) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0)  refs[i - 1].current?.focus();
    if (e.key === 'ArrowLeft'  && i > 0)              refs[i - 1].current?.focus();
    if (e.key === 'ArrowRight' && i < length - 1)     refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (paste) {
      onChange(paste.padEnd(length, ''));
      refs[Math.min(paste.length, length - 1)].current?.focus();
    }
  };

  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center', direction:'ltr' }} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!vals[i];
        return (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={vals[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            style={{
              width:48, height:54, textAlign:'center',
              fontSize:22, fontWeight:900,
              borderRadius:12,
              border:`2px solid ${hasError ? 'var(--danger)' : filled ? 'var(--accent-600)' : 'var(--border)'}`,
              background: hasError ? 'rgba(239,68,68,0.06)' : filled ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              color: hasError ? 'var(--danger)' : 'var(--text-primary)',
              outline:'none',
              transition:'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
              fontFamily:'var(--font-en)',
              boxShadow: filled ? '0 0 0 3px rgba(26,26,30,0.07)' : 'none',
              cursor:'text',
            }}
            onFocus={e => {
              e.target.style.border     = `2px solid ${hasError ? 'var(--danger)' : 'var(--accent-600)'}`;
              e.target.style.boxShadow  = '0 0 0 3px rgba(26,26,30,0.08)';
              e.target.style.background = 'var(--bg-primary)';
            }}
            onBlur={e => {
              e.target.style.border     = `2px solid ${hasError ? 'var(--danger)' : filled ? 'var(--accent-600)' : 'var(--border)'}`;
              e.target.style.boxShadow  = filled ? '0 0 0 3px rgba(26,26,30,0.07)' : 'none';
              e.target.style.background = hasError ? 'rgba(239,68,68,0.06)' : filled ? 'var(--bg-secondary)' : 'var(--bg-primary)';
            }}
          />
        );
      })}
    </div>
  );
}