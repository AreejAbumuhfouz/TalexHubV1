
// // 'use strict';
// // import { useState, useEffect, useRef, useCallback } from 'react';
// // import {
// //   Camera, User, Link2, Briefcase,
// //   Pencil, Check, Save, Loader2, X, Search, MapPin, ChevronDown,
// //   AlertCircle, RefreshCw, Link, Trash2, Plus, ArrowDown
// // } from 'lucide-react';
// // import useLang from '../../i18n';
// // import useAuthStore from '../../store/authStore';
// // import useThemeStore from '../../store/themeStore';
// // import api from '../../services/api';
// // import toast from 'react-hot-toast';
// // import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// // // ✅ كل البيانات من ملف منفصل
// // import {
// //   NATIONALITIES, COUNTRIES, CITIES_BY_COUNTRY,
// //   PHONE_CODES, JOB_TITLES, ALL_LOCATIONS,
// // } from '../../components/dashboard/locationData';

// // /* ══════════════════════════════════════════════════════════
// //    PHONE PARSE HELPER
// // ══════════════════════════════════════════════════════════ */
// // function parsePhone(full = '') {
// //   if (!full) return { countryCode: 'JO', number: '' };
// //   const sorted = [...PHONE_CODES].sort((a, b) => b.dial.length - a.dial.length);
// //   for (const c of sorted) {
// //     if (full.startsWith(c.dial)) {
// //       return { countryCode: c.code, number: full.slice(c.dial.length).trim() };
// //     }
// //   }
// //   return { countryCode: 'JO', number: full.replace(/^\+?\d{1,4}\s*/, '') };
// // }

// // /* ══════════════════════════════════════════════════════════
// //    PHONE INPUT — ✅ FIXED: full list + selected on top
// // ══════════════════════════════════════════════════════════ */

// // function PhoneInput({ label, value, onChange, isAr }) {
// //   const parsed = parsePhone(value);
// //   const [countryCode, setCountryCode] = useState(parsed.countryCode || 'JO');
// //   const [number,      setNumber]      = useState(parsed.number      || '');
// //   const [open,        setOpen]        = useState(false);
// //   const [query,       setQuery]       = useState('');
// //   const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
// //   const wrapRef   = useRef(null);
// //   const searchRef = useRef(null);
// //   const inputRef  = useRef(null);

// //   // Parse phone on value change
// //   useEffect(() => {
// //     const p = parsePhone(value);
// //     setCountryCode(p.countryCode || 'JO');
// //     setNumber(p.number || '');
// //   }, [value]);

// //   // Calculate dropdown position
// //   const calculatePosition = useCallback(() => {
// //     if (!wrapRef.current) return;
// //     const rect = wrapRef.current.getBoundingClientRect();
// //     const spaceBelow = window.innerHeight - rect.bottom;
// //     const dropdownHeight = 320; // Approximate height
    
// //     // If not enough space below, show above
// //     let top;
// //     if (spaceBelow > dropdownHeight) {
// //       top = rect.bottom + 6;
// //     } else {
// //       top = rect.top - dropdownHeight - 6;
// //     }
    
// //     setDropdownPosition({
// //       top: top,
// //       left: rect.left,
// //       width: rect.width,
// //     });
// //   }, []);

// //   // Close when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = (e) => {
// //       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
// //         setOpen(false);
// //         setQuery('');
// //       }
// //     };
// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, []);

// //   // Focus search input when dropdown opens
// //   useEffect(() => {
// //     if (open) {
// //       setQuery('');
// //       calculatePosition();
// //       setTimeout(() => searchRef.current?.focus(), 50);
      
// //       // Recalculate on scroll/resize
// //       window.addEventListener('scroll', calculatePosition, true);
// //       window.addEventListener('resize', calculatePosition);
// //       return () => {
// //         window.removeEventListener('scroll', calculatePosition, true);
// //         window.removeEventListener('resize', calculatePosition);
// //       };
// //     }
// //   }, [open, calculatePosition]);

// //   const emit = (code, num) => {
// //     const c = PHONE_CODES.find(x => x.code === code) || PHONE_CODES[0];
// //     onChange('phone', num.trim() ? `${c.dial} ${num.trim()}` : '');
// //   };

// //   const pickCountry = (c) => {
// //     setCountryCode(c.code);
// //     setOpen(false);
// //     setQuery('');
// //     emit(c.code, number);
// //     setTimeout(() => inputRef.current?.focus(), 60);
// //   };

// //   const onNumberChange = (e) => {
// //     const raw = e.target.value.replace(/[^\d\s\-().]/g, '');
// //     setNumber(raw);
// //     emit(countryCode, raw);
// //   };

// //   // Filter countries - selected first
// //   const filtered = PHONE_CODES
// //     .filter(c => {
// //       if (!query.trim()) return true;
// //       const q = query.toLowerCase();
// //       return (
// //         c.en.toLowerCase().includes(q) ||
// //         c.ar.includes(query) ||
// //         c.dial.includes(q) ||
// //         c.code.toLowerCase().includes(q)
// //       );
// //     })
// //     .sort((a, b) => {
// //       if (a.code === countryCode) return -1;
// //       if (b.code === countryCode) return 1;
// //       return 0;
// //     });

// //   const selected = PHONE_CODES.find(c => c.code === countryCode) || PHONE_CODES[0];

// //   return (
// //     <div ref={wrapRef} style={{ marginBottom: 14, position: 'relative', zIndex: 1 }}>
// //       {/* Field */}
// //       <div style={{
// //         background: 'var(--bg-secondary)',
// //         border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
// //         borderRadius: 10, transition: 'border-color .2s',
// //       }}>
// //         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>
// //           {label}
// //         </span>
// //         <div style={{ display: 'flex', alignItems: 'center', padding: '3px 10px 8px', gap: 8 }}>
// //           {/* Country trigger button */}
// //           <button
// //             type="button"
// //             onClick={() => setOpen(p => !p)}
// //             style={{
// //               display: 'flex', alignItems: 'center', gap: 6,
// //               padding: '5px 9px', borderRadius: 8, flexShrink: 0,
// //               background: open ? 'var(--bg-secondary)' : 'var(--bg-primary)',
// //               border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
// //               cursor: 'pointer', transition: 'all .18s',
// //             }}
// //           >
// //             <span style={{ fontSize: 19, lineHeight: 1 }}>{selected.flag}</span>
// //             <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>
// //               {selected.dial}
// //             </span>
// //             <ChevronDown size={11} color="var(--text-secondary)"
// //               style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }} />
// //           </button>

// //           <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

// //           <input
// //             ref={inputRef}
// //             type="tel"
// //             value={number}
// //             onChange={onNumberChange}
// //             placeholder={isAr ? 'رقم الهاتف' : 'Phone number'}
// //             dir="ltr"
// //             style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13.5, fontFamily: 'var(--font-en)' }}
// //           />

// //           {number && (
// //             <button 
// //               type="button" 
// //               onClick={() => { setNumber(''); onChange('phone', ''); }} 
// //               style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2, flexShrink: 0 }}
// //             >
// //               <X size={13} />
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* Dropdown - rendered with portal to avoid clipping */}
// //       {open && (
// //         <div style={{
// //           position: 'fixed',
// //           top: dropdownPosition.top,
// //           left: dropdownPosition.left,
// //           width: dropdownPosition.width || 320,
// //           maxWidth: 'min(360px, 90vw)',
// //           zIndex: 9999999, // Very high z-index
// //           background: 'var(--bg-primary)',
// //           border: '1.5px solid var(--border)',
// //           borderRadius: 13,
// //           overflow: 'hidden',
// //           boxShadow: '0 20px 50px rgba(0,0,0,.35)',
// //           animation: 'phoneOpen .15s ease',
// //         }}>
// //           {/* Search */}
// //           <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
// //             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
// //             <input
// //               ref={searchRef}
// //               value={query}
// //               onChange={e => setQuery(e.target.value)}
// //               onKeyDown={e => {
// //                 if (e.key === 'Escape') { setOpen(false); setQuery(''); }
// //                 if (e.key === 'Enter' && filtered[0]) pickCountry(filtered[0]);
// //               }}
// //               placeholder={isAr ? 'ابحث عن دولة أو مفتاح...' : 'Search country or dial code...'}
// //               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
// //             />
// //             {query && (
// //               <button 
// //                 type="button" 
// //                 onClick={() => setQuery('')} 
// //                 style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}
// //               >
// //                 <X size={12} />
// //               </button>
// //             )}
// //           </div>

// //           {/* Country list */}
// //           <div style={{ maxHeight: 260, overflowY: 'auto' }}>
// //             {filtered.length === 0 ? (
// //               <div style={{ padding: '18px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
// //                 {isAr ? 'لا توجد نتائج' : 'No results'}
// //               </div>
// //             ) : filtered.map((c, i) => {
// //               const isSel = c.code === countryCode;
// //               return (
// //                 <button
// //                   key={c.code}
// //                   type="button"
// //                   onClick={() => pickCountry(c)}
// //                   style={{
// //                     width: '100%', padding: '10px 14px', border: 'none',
// //                     background: isSel ? 'rgba(99,102,241,.12)' : 'transparent',
// //                     cursor: 'pointer', fontFamily: 'inherit',
// //                     display: 'flex', alignItems: 'center', gap: 10,
// //                     borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
// //                     transition: 'background .12s',
// //                     textAlign: isAr ? 'right' : 'left',
// //                   }}
// //                   onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
// //                   onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
// //                 >
// //                   <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
// //                   <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSel ? 700 : 400 }}>
// //                     {isAr ? c.ar : c.en}
// //                   </span>
// //                   <span style={{ fontSize: 13, fontWeight: 700, color: isSel ? '#6366f1' : 'var(--text-secondary)', fontFamily: 'var(--font-en)', flexShrink: 0 }}>
// //                     {c.dial}
// //                   </span>
// //                   {isSel && <Check size={13} color="#6366f1" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
// //                 </button>
// //               );
// //             })}
// //           </div>

// //           {/* Footer */}
// //           <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //             <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
// //               {filtered.length} {isAr ? 'دولة' : 'countries'}
// //             </span>
// //             <button
// //               type="button"
// //               onClick={() => { setOpen(false); setQuery(''); }}
// //               style={{ padding: '5px 14px', borderRadius: 7, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}
// //             >
// //               {isAr ? 'تم' : 'Done'}
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <style>{`
// //         @keyframes phoneOpen {
// //           from { opacity: 0; transform: translateY(-8px); }
// //           to { opacity: 1; transform: none; }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }
// // /* ══════════════════════════════════════════════════════════
// //    SEARCHABLE SELECT
// // ══════════════════════════════════════════════════════════ */
// // function SearchableSelect({ label, value, onChange, options, placeholder, isAr, icon: Icon, disabled = false }) {
// //   const [open,   setOpen]   = useState(false);
// //   const [query,  setQuery]  = useState('');
// //   const [coords, setCoords] = useState({ top: 0, left: 0, width: 200 });
// //   const wrapRef  = useRef(null);
// //   const inputRef = useRef(null);

// //   useEffect(() => {
// //     const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
// //     document.addEventListener('mousedown', h);
// //     return () => document.removeEventListener('mousedown', h);
// //   }, []);

// //   useEffect(() => {
// //     if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 40); }
// //   }, [open]);

// //   const calcCoords = () => {
// //     if (!wrapRef.current) return;
// //     const r = wrapRef.current.getBoundingClientRect();
// //     const spaceBelow = window.innerHeight - r.bottom;
// //     const dropH = Math.min(options.length * 44 + 80, 300);
// //     const top = spaceBelow > dropH ? r.bottom + 6 : r.top - dropH - 6;
// //     setCoords({ top, left: r.left, width: r.width });
// //   };

// //   useEffect(() => {
// //     if (!open) return;
// //     calcCoords();
// //     window.addEventListener('scroll', calcCoords, true);
// //     window.addEventListener('resize', calcCoords);
// //     return () => { window.removeEventListener('scroll', calcCoords, true); window.removeEventListener('resize', calcCoords); };
// //   }, [open, options.length]);

// //   const filtered = options.filter(o => {
// //     const lbl = typeof o === 'string' ? o : `${o.en} ${o.ar || ''} ${o.flag || ''}`;
// //     return lbl.toLowerCase().includes(query.toLowerCase());
// //   });

// //   const getLabel = (o) => typeof o === 'string' ? o : (isAr && o.ar ? `${o.flag || ''} ${o.ar}` : `${o.flag || ''} ${o.en}`);
// //   const displayValue = value ? (() => {
// //     const found = options.find(o => (typeof o === 'string' ? o : o.en) === value || (o.ar && o.ar === value));
// //     return found ? getLabel(found) : value;
// //   })() : '';

// //   const select = (o) => { onChange(typeof o === 'string' ? o : o.en); setOpen(false); setQuery(''); };

// //   const openDD = () => {
// //     if (disabled) return;
// //     calcCoords();
// //     setOpen(p => !p);
// //   };

// //   return (
// //     <div ref={wrapRef} style={{ marginBottom: 14 }}>
// //       <button type="button" disabled={disabled} onClick={openDD} style={{
// //         width: '100%', textAlign: isAr ? 'right' : 'left',
// //         background: 'var(--bg-secondary)',
// //         border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
// //         borderRadius: 10, padding: 0,
// //         cursor: disabled ? 'not-allowed' : 'pointer',
// //         transition: 'border-color .2s', opacity: disabled ? .55 : 1, fontFamily: 'inherit',
// //       }}>
// //         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
// //         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 9px' }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
// //             {Icon && <Icon size={13} color={value ? 'var(--text-primary)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />}
// //             <span style={{ fontSize: 13, color: value ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //               {displayValue || placeholder}
// //             </span>
// //           </div>
// //           <ChevronDown size={14} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
// //         </div>
// //       </button>

// //       {open && (
// //         <div style={{
// //           position: 'fixed', top: coords.top, left: coords.left, width: coords.width,
// //           zIndex: 9999,
// //           background: 'var(--bg-primary)', border: '1.5px solid var(--border)',
// //           borderRadius: 12, overflow: 'hidden',
// //           boxShadow: '0 16px 40px rgba(0,0,0,.28)',
// //           animation: 'ssOpen .14s ease',
// //         }}>
// //           <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
// //             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
// //             <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
// //               onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
// //               placeholder={isAr ? 'ابحث...' : 'Search...'}
// //               dir={isAr ? 'rtl' : 'ltr'}
// //               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
// //             />
// //             {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}><X size={12} /></button>}
// //           </div>
// //           <div style={{ maxHeight: 220, overflowY: 'auto' }}>
// //             {filtered.length === 0
// //               ? <div style={{ padding: '16px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد نتائج' : 'No results'}</div>
// //               : filtered.map((o, i) => {
// //                 const isSel = value === (typeof o === 'string' ? o : o.en) || (o.ar && value === o.ar);
// //                 return (
// //                   <button key={i} type="button" onClick={() => select(o)} style={{
// //                     width: '100%', padding: '10px 14px', border: 'none',
// //                     background: isSel ? 'var(--bg-secondary)' : 'transparent',
// //                     color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
// //                     textAlign: isAr ? 'right' : 'left',
// //                     display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
// //                     borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
// //                     transition: 'background .12s',
// //                   }}
// //                     onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
// //                     onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
// //                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLabel(o)}</span>
// //                     {isSel && <Check size={14} color="var(--text-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
// //                   </button>
// //                 );
// //               })
// //             }
// //           </div>
// //           {value && (
// //             <div style={{ borderTop: '1px solid var(--border)', padding: '6px 12px' }}>
// //               <button type="button" onClick={() => { onChange(''); setOpen(false); }} style={{
// //                 width: '100%', padding: '7px 8px', border: 'none', background: 'transparent',
// //                 cursor: 'pointer', fontSize: 12, color: '#EF4444', fontFamily: 'inherit',
// //                 borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6,
// //               }}>
// //                 <X size={11} /> {isAr ? 'مسح' : 'Clear'}
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       )}
// //       <style>{`@keyframes ssOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════
// //    JOB TITLE COMBOBOX
// // ══════════════════════════════════════════════════════════ */
// // function JobTitleCombobox({ label, value, onChange, isAr }) {
// //   const [open,   setOpen]   = useState(false);
// //   const [query,  setQuery]  = useState(value || '');
// //   const [coords, setCoords] = useState({ top: 0, left: 0, width: 300 });
// //   const wrapRef  = useRef(null);
// //   const inputRef = useRef(null);

// //   useEffect(() => { setQuery(value || ''); }, [value]);

// //   useEffect(() => {
// //     const h = e => {
// //       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
// //         setOpen(false);
// //         if (!query.trim()) onChange(''); else onChange(query.trim());
// //       }
// //     };
// //     document.addEventListener('mousedown', h);
// //     return () => document.removeEventListener('mousedown', h);
// //   }, [query]);

// //   const calcCoords = () => {
// //     if (!wrapRef.current) return;
// //     const r = wrapRef.current.getBoundingClientRect();
// //     const spaceBelow = window.innerHeight - r.bottom;
// //     const dropH = 290;
// //     const top = spaceBelow > dropH ? r.bottom + 6 : r.top - dropH - 6;
// //     setCoords({ top, left: r.left, width: r.width });
// //   };

// //   useEffect(() => {
// //     if (!open) return;
// //     calcCoords();
// //     window.addEventListener('scroll', calcCoords, true);
// //     window.addEventListener('resize', calcCoords);
// //     return () => { window.removeEventListener('scroll', calcCoords, true); window.removeEventListener('resize', calcCoords); };
// //   }, [open]);

// //   useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);

// //   const filtered = query
// //     ? JOB_TITLES.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 14)
// //     : JOB_TITLES.slice(0, 14);

// //   const select = (t) => { setQuery(t); onChange(t); setOpen(false); };

// //   return (
// //     <div ref={wrapRef} style={{ marginBottom: 14 }}>
// //       <div style={{ background: 'var(--bg-secondary)', border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: 10, transition: 'border-color .2s' }}>
// //         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
// //         <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 9px', gap: 7 }}>
// //           <Briefcase size={13} color={value ? 'var(--text-primary)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
// //           <input
// //             ref={inputRef}
// //             value={query}
// //             dir={isAr ? 'rtl' : 'ltr'}
// //             placeholder={isAr ? 'اكتب أو ابحث عن مسمى وظيفي...' : 'Type or search a job title...'}
// //             onChange={e => { setQuery(e.target.value); onChange(e.target.value); if (!open) { calcCoords(); setOpen(true); } }}
// //             onFocus={() => { calcCoords(); setOpen(true); }}
// //             onKeyDown={e => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && filtered[0]) select(filtered[0]); }}
// //             style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
// //           />
// //           {query && <button type="button" onClick={() => { setQuery(''); onChange(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}><X size={12} /></button>}
// //           <ChevronDown size={13} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
// //         </div>
// //       </div>

// //       {open && (
// //         <div style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,.28)', animation: 'ssOpen .14s ease' }}>
// //           <div style={{ maxHeight: 240, overflowY: 'auto' }}>
// //             {filtered.length === 0
// //               ? <div style={{ padding: '14px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد نتائج · سيُحفظ ما كتبته' : 'No matches · your text will be saved'}</div>
// //               : filtered.map((t, i) => {
// //                 const isSel = value === t;
// //                 return (
// //                   <button key={i} type="button" onClick={() => select(t)} style={{
// //                     width: '100%', padding: '10px 14px', border: 'none',
// //                     background: isSel ? 'var(--bg-secondary)' : 'transparent',
// //                     color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
// //                     textAlign: isAr ? 'right' : 'left',
// //                     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
// //                     borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
// //                     transition: 'background .12s',
// //                   }}
// //                     onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
// //                     onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
// //                     {t}
// //                     {isSel && <Check size={14} color="var(--text-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
// //                   </button>
// //                 );
// //               })}
// //           </div>
// //           <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
// //             <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
// //               {isAr ? '💡 يمكنك كتابة أي مسمى وظيفي غير موجود في القائمة' : '💡 You can type any custom title not in the list'}
// //             </p>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════
// //    LOCATION MULTI-PICKER
// // ══════════════════════════════════════════════════════════ */
// // function LocationMultiPicker({ label, value = [], onChange, isAr }) {
// //   const [open,   setOpen]   = useState(false);
// //   const [query,  setQuery]  = useState('');
// //   const [coords, setCoords] = useState({ top: 0, left: 0, width: 300 });
// //   const wrapRef   = useRef(null);
// //   const searchRef = useRef(null);

// //   useEffect(() => {
// //     const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
// //     document.addEventListener('mousedown', h);
// //     return () => document.removeEventListener('mousedown', h);
// //   }, []);

// //   const calcCoords = () => {
// //     if (!wrapRef.current) return;
// //     const r = wrapRef.current.getBoundingClientRect();
// //     const spaceBelow = window.innerHeight - r.bottom;
// //     const top = spaceBelow > 340 ? r.bottom + 6 : r.top - 340 - 6;
// //     setCoords({ top, left: r.left, width: r.width });
// //   };

// //   useEffect(() => {
// //     if (!open) return;
// //     calcCoords();
// //     setTimeout(() => searchRef.current?.focus(), 40);
// //     window.addEventListener('scroll', calcCoords, true);
// //     window.addEventListener('resize', calcCoords);
// //     return () => { window.removeEventListener('scroll', calcCoords, true); window.removeEventListener('resize', calcCoords); };
// //   }, [open]);

// //   const filtered = query.trim()
// //     ? ALL_LOCATIONS.filter(l => {
// //       const q = query.toLowerCase();
// //       return l.en.toLowerCase().includes(q) || (l.ar && l.ar.includes(query));
// //     }).slice(0, 20)
// //     : ALL_LOCATIONS.slice(0, 20);

// //   const isSelected = (loc) => value.includes(loc.key);
// //   const toggle = (loc) => onChange(isSelected(loc) ? value.filter(v => v !== loc.key) : [...value, loc.key]);
// //   const remove = (key) => onChange(value.filter(v => v !== key));

// //   const getDisplay = (key) => {
// //     const found = ALL_LOCATIONS.find(l => l.key === key);
// //     if (!found) return { label: key, icon: '📍' };
// //     return { label: isAr && found.ar ? found.ar : found.en, icon: found.icon };
// //   };

// //   const modes     = filtered.filter(l => l.type === 'mode');
// //   const countries = filtered.filter(l => l.type === 'country');
// //   const cities    = filtered.filter(l => l.type === 'city');

// //   const renderGroup = (items, groupLabel) => {
// //     if (!items.length) return null;
// //     return (
// //       <>
// //         <div style={{ padding: '5px 14px 4px', fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
// //           {groupLabel}
// //         </div>
// //         {items.map((loc) => {
// //           const sel = isSelected(loc);
// //           return (
// //             <button key={loc.key} type="button" onClick={() => toggle(loc)} style={{
// //               width: '100%', padding: '9px 14px', border: 'none',
// //               background: sel ? 'var(--bg-secondary)' : 'transparent',
// //               color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
// //               textAlign: isAr ? 'right' : 'left',
// //               display: 'flex', alignItems: 'center', gap: 9,
// //               borderBottom: '1px solid var(--border)', transition: 'background .12s',
// //             }}
// //               onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
// //               onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
// //               <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{loc.icon}</span>
// //               <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                 {isAr && loc.ar ? loc.ar : loc.en}
// //               </span>
// //               {sel
// //                 ? <Check size={14} color="var(--text-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
// //                 : <div style={{ width: 14, height: 14, borderRadius: 4, border: '1.5px solid var(--border)', flexShrink: 0 }} />
// //               }
// //             </button>
// //           );
// //         })}
// //       </>
// //     );
// //   };

// //   return (
// //     <div ref={wrapRef} style={{ marginBottom: 14 }}>
// //       <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px' }}>{label}</p>
// //       {value.length > 0 && (
// //         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
// //           {value.map(key => {
// //             const { label: lbl, icon } = getDisplay(key);
// //             return (
// //               <div key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600 }}>
// //                 <span style={{ fontSize: 14 }}>{icon}</span>
// //                 <span>{lbl}</span>
// //                 <button type="button" onClick={() => remove(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0 0 0 2px', opacity: .6 }}>
// //                   <X size={11} strokeWidth={2.5} />
// //                 </button>
// //               </div>
// //             );
// //           })}
// //           <button type="button" onClick={() => onChange([])} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>
// //             <X size={10} /> {isAr ? 'مسح الكل' : 'Clear all'}
// //           </button>
// //         </div>
// //       )}
// //       <button type="button" onClick={() => { calcCoords(); setOpen(p => !p); }} style={{
// //         width: '100%', textAlign: isAr ? 'right' : 'left',
// //         background: 'var(--bg-secondary)', border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
// //         borderRadius: 10, padding: '9px 13px', cursor: 'pointer', fontFamily: 'inherit',
// //         display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color .2s',
// //       }}>
// //         <MapPin size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
// //         <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>
// //           {value.length ? (isAr ? `${value.length} موقع مختار` : `${value.length} location${value.length > 1 ? 's' : ''} selected`) : (isAr ? 'اختر المواقع المرغوبة...' : 'Choose desired locations...')}
// //         </span>
// //         <ChevronDown size={13} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
// //       </button>

// //       {open && (
// //         <div style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 13, overflow: 'hidden', boxShadow: '0 16px 44px rgba(0,0,0,.28)', animation: 'ssOpen .14s ease' }}>
// //           <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
// //             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
// //             <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
// //               placeholder={isAr ? 'ابحث عن مدينة أو دولة...' : 'Search city or country...'}
// //               dir={isAr ? 'rtl' : 'ltr'}
// //               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
// //             />
// //             {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}><X size={12} /></button>}
// //           </div>
// //           <div style={{ maxHeight: 240, overflowY: 'auto' }}>
// //             {!query && renderGroup(modes, isAr ? 'نوع العمل' : 'Work Mode')}
// //             {!query && renderGroup(countries, isAr ? 'الدول' : 'Countries')}
// //             {renderGroup(query ? filtered : cities, isAr ? (query ? 'النتائج' : 'المدن') : (query ? 'Results' : 'Cities'))}
// //             {filtered.length === 0 && <div style={{ padding: '20px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد نتائج' : 'No results found'}</div>}
// //           </div>
// //           <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //             <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
// //               {value.length > 0 ? (isAr ? `${value.length} مختار` : `${value.length} selected`) : (isAr ? 'اختر أكثر من موقع' : 'Pick multiple')}
// //             </span>
// //             <button type="button" onClick={() => setOpen(false)} style={{ padding: '5px 14px', borderRadius: 8, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit' }}>
// //               {isAr ? 'تم' : 'Done'}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════
// //    SMALL HELPERS
// // ══════════════════════════════════════════════════════════ */
// // function Field({ label, name, type = 'text', as = 'input', rows = 3, placeholder = '', value, onChange }) {
// //   return (
// //     <div style={{ marginBottom: 14 }}>
// //       <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s, background .2s' }}
// //         onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
// //         onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
// //         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
// //         {as === 'textarea' ? (
// //           <textarea rows={rows} value={value || ''} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
// //             style={{ display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
// //         ) : (
// //           <input type={type} value={value || ''} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
// //             style={{ display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // function SelectField({ label, value, onChange, children }) {
// //   return (
// //     <div style={{ marginBottom: 14 }}>
// //       <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s' }}
// //         onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
// //         onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
// //         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
// //         <select value={value} onChange={onChange} style={{ display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' }}>
// //           {children}
// //         </select>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════
// //    AVATAR MODAL
// // ══════════════════════════════════════════════════════════ */
// // function AvatarModal({ onClose, onSelect, currentUrl, isAr }) {
// //   const [presets, setPresets] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [picking, setPicking] = useState(null);

// //   useEffect(() => {
// //     api.get('/users/presets/avatars')
// //       .then(({ data }) => setPresets(data.data.avatars))
// //       .catch(() => toast.error(isAr ? 'فشل تحميل الصور' : 'Failed to load avatars'))
// //       .finally(() => setLoading(false));
// //   }, []);

// //   const handleSelect = async (preset) => {
// //     setPicking(preset.id);
// //     try {
// //       await api.patch('/users/me/avatar/preset', { avatarUrl: preset.url });
// //       onSelect(preset.url);
// //       toast.success(isAr ? 'تم تحديث الصورة ✓' : 'Avatar updated ✓');
// //       onClose();
// //     } catch {
// //       toast.error(isAr ? 'فشل تحديث الصورة' : 'Failed to update avatar');
// //     } finally { setPicking(null); }
// //   };

// //   return (
// //     <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
// //       <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 480, padding: 24, position: 'relative', animation: 'profFadeUp 0.25s ease' }}>
// //         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
// //           <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{isAr ? 'اختر صورة شخصية' : 'Choose Avatar'}</h2>
// //           <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //             <X size={14} color="var(--text-primary)" strokeWidth={2.5} />
// //           </button>
// //         </div>
// //         {loading ? (
// //           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
// //             {[1, 2, 3, 4].map(i => <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: 'var(--border)', animation: 'profPulse 1.5s ease-in-out infinite' }} />)}
// //           </div>
// //         ) : presets.length === 0 ? (
// //           <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: '20px 0' }}>{isAr ? 'لا توجد صور متاحة' : 'No avatars available'}</p>
// //         ) : (
// //           <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(presets.length, 4)},1fr)`, gap: 12 }}>
// //             {presets.map(preset => {
// //               const isActive  = currentUrl === preset.url;
// //               const isPicking = picking === preset.id;
// //               return (
// //                 <button key={preset.id} onClick={() => !picking && handleSelect(preset)} disabled={!!picking} style={{ padding: 4, borderRadius: 12, cursor: picking ? 'not-allowed' : 'pointer', border: `${isActive ? '2.5px' : '1.5px'} solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}`, background: isActive ? 'var(--bg-secondary)' : 'transparent', opacity: picking && !isPicking ? 0.5 : 1, transition: 'all .18s', position: 'relative', fontFamily: 'inherit' }}>
// //                   <div style={{ position: 'relative' }}>
// //                     <img src={preset.url} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, objectFit: 'cover', display: 'block', opacity: isPicking ? 0.4 : 1 }} />
// //                     {isPicking && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={22} color="var(--text-primary)" strokeWidth={2} style={{ animation: 'profSpin 0.8s linear infinite' }} /></div>}
// //                   </div>
// //                   {isActive && !isPicking && (
// //                     <div style={{ position: 'absolute', top: 6, insetInlineEnd: 6, width: 20, height: 20, borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                       <Check size={11} color="var(--bg-primary)" strokeWidth={3} />
// //                     </div>
// //                   )}
// //                 </button>
// //               );
// //             })}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════
// //    MAIN PAGE
// // ══════════════════════════════════════════════════════════ */
// // const API_BASE   = (import.meta.env.VITE_API_URL ).replace('/api/v1', '');
// // const toAbsolute = (url) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

// // export default function ProfilePage() {
// //   const { lang }     = useLang();
// //   const { theme }    = useThemeStore();
// //   const isAr         = lang === 'ar';
// //   const { user, updateUser } = useAuthStore();
// //   const avatarRef    = useRef(null);
// //   const [collapsed, setCollapsed] = useState(false);

// //   const [form, setForm] = useState({
// //     fullName: '', phone: '', headline: '', bio: '',
// //     locationCountry: '', locationCity: '', dateOfBirth: '', gender: '', nationality: '',
// //     linkedinUrl: '', portfolioUrl: '',
// //     desiredJobTitle: '', desiredSalaryMin: '', desiredSalaryMax: '',
// //     openToWork: true, discoverable: true,
// //     desiredJobTypes: [], desiredIndustries: [], desiredLocations: [],
// //   });

// //   const [loading,   setLoading]   = useState(true);
// //   const [saving,    setSaving]    = useState(false);
// //   const [avatarUp,  setAvatarUp]  = useState(false);
// //   const [preview,   setPreview]   = useState(null);
// //   const [avatarSrc, setAvatarSrc] = useState(null);
// //   const [showModal, setShowModal] = useState(false);
// //   const [activeTab, setActiveTab] = useState('personal');

// //   const fetchProfile = useCallback(async () => {
// //     try {
// //       const { data } = await api.get('/users/me');
// //       const u = data.data.user;
// //       setAvatarSrc(u.avatarUrl || null);
// //       setForm({
// //         fullName:          u.fullName          || '',
// //         phone:             u.phone             || '',
// //         headline:          u.headline          || '',
// //         bio:               u.bio               || '',
// //         locationCountry:   u.locationCountry   || '',
// //         locationCity:      u.locationCity      || '',
// //         dateOfBirth:       u.dateOfBirth?.split?.('T')[0] || '',
// //         gender:            u.gender            || '',
// //         nationality:       u.nationality       || '',
// //         linkedinUrl:       u.linkedinUrl       || '',
// //         portfolioUrl:      u.portfolioUrl      || '',
// //         desiredJobTitle:   u.desiredJobTitle   || '',
// //         desiredSalaryMin:  u.desiredSalaryMin  || '',
// //         desiredSalaryMax:  u.desiredSalaryMax  || '',
// //         openToWork:        u.openToWork        ?? true,
// //         discoverable:      u.discoverable      ?? true,
// //         autoApplyEnabled:  u.autoApplyEnabled  ?? false,
// //         desiredJobTypes:   u.desiredJobTypes   || [],
// //         desiredIndustries: u.desiredIndustries || [],
// //         desiredLocations:  u.desiredLocations  || [],
// //       });
// //     } catch {
// //       toast.error(isAr ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile');
// //     } finally { setLoading(false); }
// //   }, [isAr]);

// //   useEffect(() => { fetchProfile(); }, [fetchProfile]);

// //   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

// //   const handleSave = async () => {
// //     setSaving(true);
// //     try {
// //       const { data } = await api.patch('/users/me', form);
// //       updateUser(data.data.user);
// //       toast.success(isAr ? 'تم حفظ الملف الشخصي ✓' : 'Profile saved ✓');
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
// //     } finally { setSaving(false); }
// //   };

// //   const handleAvatarPick = (file) => {
// //     if (!file) return;
// //     if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) { toast.error(isAr ? 'JPEG/PNG/WebP فقط' : 'JPEG/PNG/WebP only'); return; }
// //     if (file.size > 5 * 1024 * 1024) { toast.error(isAr ? 'الحد الأقصى 5 ميغا' : 'Max 5MB'); return; }
// //     setPreview({ file, url: URL.createObjectURL(file) });
// //   };

// //   const handleAvatarUpload = async () => {
// //     if (!preview) return;
// //     setAvatarUp(true);
// //     const fd = new FormData();
// //     fd.append('avatar', preview.file);
// //     try {
// //       const { data } = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
// //       const finalUrl = data.data.avatarUrl;
// //       setAvatarSrc(finalUrl);
// //       setPreview(null);
// //       updateUser({ avatarUrl: finalUrl, avatarKey: data.data.avatarKey || null });
// //       toast.success(isAr ? 'تم رفع الصورة بنجاح ✓' : 'Photo uploaded successfully ✓', { duration: 4000, position: 'top-center' });
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || (isAr ? 'فشل رفع الصورة' : 'Upload failed'), { duration: 4000, position: 'top-center' });
// //     } finally { setAvatarUp(false); }
// //   };

// //   const handlePresetChosen = (url) => {
// //     setAvatarSrc(url);
// //     setPreview(null);
// //     updateUser({ avatarUrl: url, avatarKey: null });
// //   };

// //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
// //   const initials = (form.fullName || user?.fullName || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

// //   const JOB_TYPES = [
// //     { key: 'full_time',  ar: 'دوام كامل', en: 'Full-time'  },
// //     { key: 'part_time',  ar: 'دوام جزئي', en: 'Part-time'  },
// //     { key: 'freelance',  ar: 'مستقل',      en: 'Freelance'  },
// //     { key: 'internship', ar: 'تدريب',      en: 'Internship' },
// //     { key: 'remote',     ar: 'عن بُعد',    en: 'Remote'     },
// //   ];
// //   const toggleJobType = (k) => {
// //     const arr = form.desiredJobTypes || [];
// //     set('desiredJobTypes', arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);
// //   };

// //   const completionFields = [
// //     { done: !!form.fullName },
// //     { done: !!form.headline },
// //     { done: !!form.bio },
// //     { done: !!form.phone },
// //     { done: !!form.locationCountry },
// //     { done: !!form.linkedinUrl },
// //     { done: !!form.desiredJobTitle },
// //     { done: !!(avatarSrc || preview) },
// //   ];
// //   const completionPct = Math.round((completionFields.filter(f => f.done).length / completionFields.length) * 100);

// //   const TABS = [
// //     { key: 'personal', ar: 'الشخصية', en: 'Personal', icon: User },
// //     { key: 'social',   ar: 'الروابط', en: 'Social',   icon: Link },
// //     { key: 'career',   ar: 'المهنة',  en: 'Career',   icon: Briefcase },
// //   ];

// //   return (
// //     <>
// //       <style>{`
// //         @keyframes profSpin    { to { transform: rotate(360deg); } }
// //         @keyframes profPulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
// //         @keyframes profSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
// //         @keyframes profFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
// //         * { box-sizing: border-box; } body { margin: 0; }
// //         ::-webkit-scrollbar { width: 5px; }
// //         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
// //         @media(max-width:1024px){ .prof-main { padding-bottom: 80px !important; } }
// //         @media(max-width:580px)  { .prof-g2 { grid-template-columns: 1fr !important; } }
// //       `}</style>

// //       {showModal && (
// //         <AvatarModal
// //           currentUrl={avatarSrc}
// //           onClose={() => setShowModal(false)}
// //           onSelect={url => { setAvatarSrc(url); setPreview(null); updateUser({ avatarUrl: url, avatarKey: null }); }}
// //           isAr={isAr}
// //         />
// //       )}

// //       <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
// //         <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

// //         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
// //           <MobileTopBar title={isAr ? 'الملف الشخصي' : 'Profile'} />

// //           <main className="prof-main" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)' }}>
// //             {loading ? (
// //               <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 720, margin: '0 auto' }}>
// //                 {[88, 56, 56, 56, 120, 56].map((h, i) => (
// //                   <div key={i} style={{ height: h, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', marginBottom: 12, animation: 'profPulse 1.5s ease-in-out infinite' }} />
// //                 ))}
// //               </div>
// //             ) : (
// //               <>
// //                 {/* HEADER */}
// //                 <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: 'clamp(16px,3vw,28px) clamp(16px,3vw,28px) 0' }}>
// //                   <div style={{ maxWidth: 720, margin: '0 auto' }}>
// //                     <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
// //                       {/* Avatar */}
// //                       <div style={{ position: 'relative', flexShrink: 0 }}>
// //                         <div style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid var(--bg-secondary)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1px var(--border)' }}>
// //                           {avatarUp
// //                             ? <Loader2 size={28} color="var(--text-secondary)" style={{ animation: 'profSpin .8s linear infinite' }} />
// //                             : preview
// //                               ? <img src={preview.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                               : avatarSrc
// //                                 ? <img src={avatarSrc} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                                 : <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{initials}</span>
// //                           }
// //                         </div>
// //                         <button onClick={() => setShowModal(true)} style={{ position: 'absolute', bottom: 1, insetInlineEnd: 1, width: 28, height: 28, borderRadius: '50%', background: 'var(--text-primary)', border: '2.5px solid var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                           <Camera size={13} color="#444040" strokeWidth={3.2} />
// //                         </button>
// //                       </div>

// //                       {/* Name & headline */}
// //                       <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
// //                         <h1 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', fontWeight: 900, margin: '0 0 3px', color: 'var(--text-primary)', fontFamily: font }}>
// //                           {form.fullName || user?.fullName || (isAr ? 'اسمك' : 'Your Name')}
// //                         </h1>
// //                         <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 10px', fontFamily: font }}>
// //                           {form.headline || (isAr ? 'أضف عنوانك المهني' : 'Add your headline')}
// //                         </p>
                        

// //                         {/* ★ Auto-Apply toggle — Pro only */}
// //                         {['pro','elite'].includes(user?.planKey) ? (
// //                           <button onClick={() => set('autoApplyEnabled', !form.autoApplyEnabled)} style={{
// //                             display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, cursor: 'pointer',
// //                             border: `1.5px solid ${form.autoApplyEnabled ? 'rgba(139,92,246,.4)' : 'var(--border)'}`,
// //                             background: form.autoApplyEnabled ? 'rgba(139,92,246,.1)' : 'var(--bg-secondary)',
// //                             color: form.autoApplyEnabled ? '#8B5CF6' : 'var(--text-secondary)',
// //                             fontSize: 12, fontWeight: 700, fontFamily: font, transition: 'all .18s',
// //                           }}>
// //                             <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
// //                             {form.autoApplyEnabled ? (isAr ? '⚡ Auto-Apply نشط' : '⚡ Auto-Apply ON') : (isAr ? 'Auto-Apply' : 'Auto-Apply')}
// //                           </button>
// //                         ) : (
// //                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, fontFamily: font, opacity: 0.6, cursor: 'default' }}>
// //                             🔒 {isAr ? 'Auto-Apply (Pro)' : 'Auto-Apply (Pro)'}
// //                           </span>
// //                         )}
// //                       </div>

// //                       {/* Upload photo */}
// //                       <div style={{ paddingBottom: 4, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
// //                         <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleAvatarPick(e.target.files[0])} />
// //                         {preview ? (
// //                           <div style={{ display: 'flex', gap: 7 }}>
// //                             <button onClick={handleAvatarUpload} disabled={avatarUp} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
// //                               {avatarUp ? <Loader2 size={14} style={{ animation: 'profSpin .7s linear infinite' }} /> : <Check size={14} strokeWidth={2.5} />}
// //                               {isAr ? 'رفع الصورة' : 'Upload'}
// //                             </button>
// //                             <button onClick={() => setPreview(null)} style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font }}>
// //                               {isAr ? 'إلغاء' : 'Cancel'}
// //                             </button>
// //                           </div>
// //                         ) : (
// //                           <button onClick={() => avatarRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font, transition: 'all .18s' }}
// //                             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
// //                             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
// //                             <Pencil size={13} strokeWidth={1.8} />
// //                             {isAr ? 'رفع صورة' : 'Upload Photo'}
// //                           </button>
// //                         )}
// //                         <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: 0, textAlign: 'center', fontFamily: font }}>JPG, PNG, WebP · 5MB</p>
// //                       </div>
// //                     </div>

// //                     {/* Completion bar */}
// //                     <div style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
// //                       <div style={{ flex: 1 }}>
// //                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
// //                           <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, fontFamily: font }}>{isAr ? 'اكتمال الملف' : 'Profile completion'}</span>
// //                           <span style={{ fontSize: 12, fontWeight: 800, color: completionPct >= 80 ? '#22C55E' : completionPct >= 50 ? '#F59E0B' : 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{completionPct}%</span>
// //                         </div>
// //                         <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
// //                           <div style={{ height: '100%', borderRadius: 99, transition: 'width .6s cubic-bezier(.34,1.56,.64,1)', width: `${completionPct}%`, background: completionPct >= 80 ? '#22C55E' : completionPct >= 50 ? '#F59E0B' : 'var(--border)' }} />
// //                         </div>
// //                       </div>
// //                       {completionPct < 100 && (
// //                         <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: font }}>
// //                           {completionFields.filter(f => !f.done).length} {isAr ? 'خطوات' : 'left'}
// //                         </span>
// //                       )}
// //                     </div>

// //                     {/* Tabs */}
// //                     <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
// //                       {TABS.map(tab => {
// //                         const Icon = tab.icon;
// //                         return (
// //                           <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
// //                             display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px',
// //                             border: 'none', background: 'transparent', cursor: 'pointer',
// //                             fontFamily: font, fontSize: 13.5,
// //                             fontWeight: activeTab === tab.key ? 700 : 500,
// //                             color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
// //                             borderBottom: `2.5px solid ${activeTab === tab.key ? 'var(--text-primary)' : 'transparent'}`,
// //                             marginBottom: -1, transition: 'color .15s, border-color .15s', borderRadius: '8px 8px 0 0',
// //                           }}>
// //                             <Icon size={16} />
// //                             {isAr ? tab.ar : tab.en}
// //                           </button>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* TAB CONTENT */}
// //                 <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 720, margin: '0 auto', animation: 'profSlideIn .25s ease' }} key={activeTab}>

// //                   {/* PERSONAL */}
// //                   {activeTab === 'personal' && (
// //                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'المعلومات الأساسية' : 'Basic Information'}</span>
// //                         </div>
// //                         <div style={{ padding: '18px 18px 4px' }}>
// //                           <Field label={isAr ? 'الاسم الكامل' : 'Full Name'} name="fullName" value={form.fullName} onChange={set} placeholder={isAr ? 'محمد العمري' : 'Mohammed Al Omari'} />
// //                           <Field label={isAr ? 'العنوان المهني' : 'Professional Headline'} name="headline" value={form.headline} onChange={set} placeholder={isAr ? 'مطور واجهات أمامية · 5 سنوات خبرة' : 'Frontend Developer · 5 years experience'} />
// //                           <Field label={isAr ? 'نبذة شخصية' : 'Bio'} name="bio" as="textarea" rows={4} value={form.bio} onChange={set} placeholder={isAr ? 'أخبر أصحاب العمل عن نفسك...' : 'Tell employers about yourself...'} />
// //                         </div>
// //                       </div>

// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'بيانات التواصل' : 'Contact Details'}</span>
// //                         </div>
// //                         <div style={{ padding: '18px 18px 4px' }}>
// //                           <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
// //                             <PhoneInput label={isAr ? 'رقم الهاتف' : 'Phone Number'} value={form.phone} onChange={set} isAr={isAr} />
// //                             <SearchableSelect label={isAr ? 'الجنسية' : 'Nationality'} value={form.nationality} onChange={v => set('nationality', v)} options={NATIONALITIES} placeholder={isAr ? 'اختر الجنسية' : 'Select nationality'} isAr={isAr} />
// //                           </div>
// //                           <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
// //                             <SearchableSelect label={isAr ? 'الدولة' : 'Country'} value={form.locationCountry} onChange={v => { set('locationCountry', v); set('locationCity', ''); }} options={COUNTRIES} placeholder={isAr ? 'اختر الدولة' : 'Select country'} isAr={isAr} icon={MapPin} />
// //                             <SearchableSelect label={isAr ? 'المدينة' : 'City'} value={form.locationCity} onChange={v => set('locationCity', v)}
// //                               options={(() => { const c = COUNTRIES.find(x => x.en === form.locationCountry); return c ? (CITIES_BY_COUNTRY[c.code] || []) : Object.values(CITIES_BY_COUNTRY).flat(); })()}
// //                               placeholder={isAr ? 'اختر المدينة' : 'Select city'} isAr={isAr} icon={MapPin} />
// //                           </div>
// //                         </div>
// //                       </div>

// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'البيانات الشخصية' : 'Personal Details'}</span>
// //                         </div>
// //                         <div style={{ padding: '18px 18px 4px' }}>
// //                           <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
// //                             <SelectField label={isAr ? 'الجنس' : 'Gender'} value={form.gender} onChange={e => set('gender', e.target.value)}>
// //                               <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
// //                               <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
// //                               <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
// //                               <option value="prefer_not">{isAr ? 'أفضل عدم الذكر' : 'Prefer not to say'}</option>
// //                             </SelectField>
// //                             <Field label={isAr ? 'تاريخ الميلاد' : 'Date of Birth'} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set} />
// //                           </div>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}

// //                   {/* SOCIAL */}
// //                   {activeTab === 'social' && (
// //                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'الروابط الاجتماعية والمهنية' : 'Social & Professional Links'}</span>
// //                         </div>
// //                         <div style={{ padding: '18px 18px 4px' }}>
// //                           {[
// //                             { key: 'linkedinUrl', label: 'LinkedIn', icon: '🔗', placeholder: 'linkedin.com/in/username' },
// //                             { key: 'portfolioUrl', label: isAr ? 'الموقع الشخصي / Portfolio' : 'Portfolio / Website', icon: '🌐', placeholder: 'myportfolio.com' },
// //                           ].map(({ key, label, icon, placeholder }) => (
// //                             <div key={key} style={{ marginBottom: 14 }}>
// //                               <div style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s' }}
// //                                 onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
// //                                 onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
// //                                 <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
// //                                 <div style={{ display: 'flex', alignItems: 'center', padding: '2px 12px 9px', gap: 8 }}>
// //                                   <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
// //                                   <input type="url" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} dir="ltr"
// //                                     style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-en)' }} />
// //                                   {form[key] && (
// //                                     <a href={form[key].startsWith('http') ? form[key] : `https://${form[key]}`} target="_blank" rel="noopener noreferrer"
// //                                       style={{ color: 'var(--text-secondary)', fontSize: 11.5, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
// //                                       {isAr ? 'فتح' : 'Open'} ↗
// //                                     </a>
// //                                   )}
// //                                 </div>
// //                               </div>
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}

// //                   {/* CAREER */}
// //                   {activeTab === 'career' && (
// //                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'تفضيلات الوظيفة' : 'Job Preferences'}</span>
// //                         </div>
// //                         <div style={{ padding: '18px 18px 4px' }}>
// //                           <JobTitleCombobox label={isAr ? 'المسمى الوظيفي المرغوب' : 'Desired Job Title'} value={form.desiredJobTitle} onChange={v => set('desiredJobTitle', v)} isAr={isAr} />
// //                           <div style={{ marginBottom: 14 }}>
// //                             <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px', fontFamily: font }}>{isAr ? 'نطاق الراتب المتوقع (شهري)' : 'Expected Salary Range (monthly)'}</p>
// //                             <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
// //                               {[
// //                                 { key: 'desiredSalaryMin', label: isAr ? 'الحد الأدنى' : 'Minimum', placeholder: '3,000' },
// //                                 { key: 'desiredSalaryMax', label: isAr ? 'الحد الأقصى' : 'Maximum', placeholder: '10,000' },
// //                               ].map(({ key, label, placeholder }) => (
// //                                 <div key={key} style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
// //                                   onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
// //                                   onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
// //                                   <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
// //                                   <div style={{ display: 'flex', alignItems: 'center', padding: '2px 12px 9px', gap: 6 }}>
// //                                     <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: 'var(--font-en)' }}>$</span>
// //                                     <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} min="0"
// //                                       style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13.5, fontFamily: 'var(--font-en)', fontWeight: 600 }} />
// //                                   </div>
// //                                 </div>
// //                               ))}
// //                             </div>
// //                           </div>
// //                           <div style={{ marginBottom: 14 }}>
// //                             <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 9px', fontFamily: font }}>{isAr ? 'أنواع الوظائف المفضلة' : 'Preferred Job Types'}</p>
// //                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                               {JOB_TYPES.map(t => {
// //                                 const active = (form.desiredJobTypes || []).includes(t.key);
// //                                 return (
// //                                   <button key={t.key} onClick={() => toggleJobType(t.key)} style={{
// //                                     display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
// //                                     border: `1.5px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
// //                                     background: 'var(--bg-secondary)',
// //                                     color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
// //                                     fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: font, transition: 'all .18s',
// //                                   }}>
// //                                     {active && <Check size={12} strokeWidth={2.8} />}
// //                                     {isAr ? t.ar : t.en}
// //                                   </button>
// //                                 );
// //                               })}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       </div>

// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>
// //                             {isAr ? 'التقديم التلقائي (Auto-Apply)' : 'Auto-Apply Settings'}
// //                           </span>
// //                           <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>PRO</span>
// //                         </div>
// //                         <div style={{ padding: '18px' }}>
// //                           {['pro','elite'].includes(user?.planKey) ? (
// //                             <>
// //                               {/* Toggle */}
// //                               <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: form.autoApplyEnabled ? 'rgba(139,92,246,0.07)' : 'var(--bg-secondary)', border: `1px solid ${form.autoApplyEnabled ? 'rgba(139,92,246,0.25)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 14 }}
// //                                 onClick={() => set('autoApplyEnabled', !form.autoApplyEnabled)}>
// //                                 <div style={{ flex: 1 }}>
// //                                   <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', fontFamily: font }}>
// //                                     {isAr ? 'تفعيل التقديم التلقائي' : 'Enable AI Auto-Apply'}
// //                                   </p>
// //                                   <p style={{ fontSize: 12, color: form.autoApplyEnabled ? '#8B5CF6' : 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.5 }}>
// //                                     {form.autoApplyEnabled
// //                                       ? (isAr ? '⚡ نشط — AI يتقدم 3 مرات يومياً تلقائياً على أفضل الوظائف' : '⚡ Active — AI applies 3 times/day automatically to best matching jobs')
// //                                       : (isAr ? 'يتقدم AI نيابةً عنك 3 مرات يومياً على الوظائف المناسبة ≥65% تطابقاً' : 'AI applies on your behalf 3×/day to jobs matching ≥65%')}
// //                                   </p>
// //                                 </div>
// //                                 <div style={{ width: 46, height: 26, borderRadius: 13, background: form.autoApplyEnabled ? '#8B5CF6' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
// //                                   <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: form.autoApplyEnabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
// //                                 </div>
// //                               </div>

// //                               {/* Consent note */}
// //                               {form.autoApplyEnabled && (
// //                                 <div style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 12, color: '#8B5CF6', lineHeight: 1.6, fontFamily: font }}>
// //                                   ⚠️ {isAr
// //                                     ? 'بتفعيل هذه الميزة أنت توافق على أن TalexHub سيُرسل سيرتك الذاتية تلقائياً إلى الشركات المناسبة. يمكنك إيقافها في أي وقت.'
// //                                     : 'By enabling this, you agree that TalexHub will automatically send your CV to matching companies. You can disable anytime.'}
// //                                 </div>
// //                               )}
// //                             </>
// //                           ) : (
// //                             <div style={{ textAlign: 'center', padding: '20px 0' }}>
// //                               <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', fontFamily: font, lineHeight: 1.6 }}>
// //                                 {isAr ? 'دع الذكاء الاصطناعي يتقدم نيابةً عنك 3 مرات يومياً على أفضل الوظائف المتوافقة.' : 'Let AI apply on your behalf 3×/day to the best matching jobs.'}
// //                               </p>
// //                               <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: font }}>
// //                                 🚀 {isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
// //                               </a>
// //                             </div>
// //                           )}
// //                         </div>
// //                       </div>

// //                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
// //                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
// //                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'المواقع الجغرافية المرغوبة' : 'Preferred Work Locations'}</span>
// //                         </div>
// //                         <div style={{ padding: '18px 18px 4px' }}>
// //                           <LocationMultiPicker label={isAr ? 'اختر المواقع المرغوبة' : 'Choose desired locations'} value={form.desiredLocations} onChange={v => set('desiredLocations', v)} isAr={isAr} />
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )}

// //                   {/* SAVE */}
// //                   <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
// //                     <button onClick={handleSave} disabled={saving} style={{
// //                       width: '100%', padding: '14px', borderRadius: 12, border: 'none',
// //                       background: 'var(--text-primary)', color: 'var(--bg-primary)',
// //                       cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14.5, fontWeight: 800, fontFamily: font,
// //                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
// //                       opacity: saving ? .7 : 1, transition: 'opacity .2s',
// //                     }}>
// //                       {saving
// //                         ? <><Loader2 size={17} strokeWidth={2.5} style={{ animation: 'profSpin .7s linear infinite' }} /> {isAr ? 'جاري الحفظ...' : 'Saving...'}</>
// //                         : <><Save size={16} strokeWidth={2} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
// //                       }
// //                     </button>
// //                   </div>
// //                   <div style={{ height: 16 }} />
// //                 </div>
// //               </>
// //             )}
// //           </main>
// //         </div>
// //       </div>

// //       <MobileBottomNav />
// //     </>
// //   );
// // }

// 'use strict';
// import { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Camera, User, Link2, Briefcase,
//   Pencil, Check, Save, Loader2, X, Search, MapPin, ChevronDown,
//   AlertCircle, RefreshCw, Link, Trash2, Plus, ArrowDown
// } from 'lucide-react';
// import useLang from '../../i18n';
// import useAuthStore from '../../store/authStore';
// import useThemeStore from '../../store/themeStore';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// // ✅ كل البيانات من ملف منفصل
// import {
//   NATIONALITIES, COUNTRIES, CITIES_BY_COUNTRY,
//   PHONE_CODES, JOB_TITLES, ALL_LOCATIONS,
// } from '../../components/dashboard/locationData';

// /* ══════════════════════════════════════════════════════════
//    PHONE PARSE HELPER
// ══════════════════════════════════════════════════════════ */
// function parsePhone(full = '') {
//   if (!full) return { countryCode: 'JO', number: '' };
//   const sorted = [...PHONE_CODES].sort((a, b) => b.dial.length - a.dial.length);
//   for (const c of sorted) {
//     if (full.startsWith(c.dial)) {
//       return { countryCode: c.code, number: full.slice(c.dial.length).trim() };
//     }
//   }
//   return { countryCode: 'JO', number: full.replace(/^\+?\d{1,4}\s*/, '') };
// }

// /* ══════════════════════════════════════════════════════════
//    PHONE INPUT — ✅ FIXED: full list + selected on top
// ══════════════════════════════════════════════════════════ */

// function PhoneInput({ label, value, onChange, isAr }) {
//   const parsed = parsePhone(value);
//   const [countryCode, setCountryCode] = useState(parsed.countryCode || 'JO');
//   const [number,      setNumber]      = useState(parsed.number      || '');
//   const [open,        setOpen]        = useState(false);
//   const [query,       setQuery]       = useState('');
//   const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//   const wrapRef   = useRef(null);
//   const searchRef = useRef(null);
//   const inputRef  = useRef(null);

//   // Parse phone on value change
//   useEffect(() => {
//     const p = parsePhone(value);
//     setCountryCode(p.countryCode || 'JO');
//     setNumber(p.number || '');
//   }, [value]);

//   // Calculate dropdown position
//   const calculatePosition = useCallback(() => {
//     if (!wrapRef.current) return;
//     const rect = wrapRef.current.getBoundingClientRect();
//     const spaceBelow = window.innerHeight - rect.bottom;
//     const dropdownHeight = 320; // Approximate height
    
//     // If not enough space below, show above
//     let top;
//     if (spaceBelow > dropdownHeight) {
//       top = rect.bottom + 6;
//     } else {
//       top = rect.top - dropdownHeight - 6;
//     }
    
//     setDropdownPosition({
//       top: top,
//       left: rect.left,
//       width: rect.width,
//     });
//   }, []);

//   // Close when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
//         setOpen(false);
//         setQuery('');
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Focus search input when dropdown opens
//   useEffect(() => {
//     if (open) {
//       setQuery('');
//       calculatePosition();
//       setTimeout(() => searchRef.current?.focus(), 50);
      
//       // Recalculate on scroll/resize
//       window.addEventListener('scroll', calculatePosition, true);
//       window.addEventListener('resize', calculatePosition);
//       return () => {
//         window.removeEventListener('scroll', calculatePosition, true);
//         window.removeEventListener('resize', calculatePosition);
//       };
//     }
//   }, [open, calculatePosition]);

//   const emit = (code, num) => {
//     const c = PHONE_CODES.find(x => x.code === code) || PHONE_CODES[0];
//     onChange('phone', num.trim() ? `${c.dial} ${num.trim()}` : '');
//   };

//   const pickCountry = (c) => {
//     setCountryCode(c.code);
//     setOpen(false);
//     setQuery('');
//     emit(c.code, number);
//     setTimeout(() => inputRef.current?.focus(), 60);
//   };

//   const onNumberChange = (e) => {
//     const raw = e.target.value.replace(/[^\d\s\-().]/g, '');
//     setNumber(raw);
//     emit(countryCode, raw);
//   };

//   // Filter countries - selected first
//   const filtered = PHONE_CODES
//     .filter(c => {
//       if (!query.trim()) return true;
//       const q = query.toLowerCase();
//       return (
//         c.en.toLowerCase().includes(q) ||
//         c.ar.includes(query) ||
//         c.dial.includes(q) ||
//         c.code.toLowerCase().includes(q)
//       );
//     })
//     .sort((a, b) => {
//       if (a.code === countryCode) return -1;
//       if (b.code === countryCode) return 1;
//       return 0;
//     });

//   const selected = PHONE_CODES.find(c => c.code === countryCode) || PHONE_CODES[0];

//   return (
//     <div ref={wrapRef} style={{ marginBottom: 14, position: 'relative', zIndex: 1 }}>
//       {/* Field */}
//       <div style={{
//         background: 'var(--bg-secondary)',
//         border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
//         borderRadius: 10, transition: 'border-color .2s',
//       }}>
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>
//           {label}
//         </span>
//         <div style={{ display: 'flex', alignItems: 'center', padding: '3px 10px 8px', gap: 8 }}>
//           {/* Country trigger button */}
//           <button
//             type="button"
//             onClick={() => setOpen(p => !p)}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               padding: '5px 9px', borderRadius: 8, flexShrink: 0,
//               background: open ? 'var(--bg-secondary)' : 'var(--bg-primary)',
//               border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
//               cursor: 'pointer', transition: 'all .18s',
//             }}
//           >
//             <span style={{ fontSize: 19, lineHeight: 1 }}>{selected.flag}</span>
//             <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>
//               {selected.dial}
//             </span>
//             <ChevronDown size={11} color="var(--text-secondary)"
//               style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }} />
//           </button>

//           <div style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

//           <input
//             ref={inputRef}
//             type="tel"
//             value={number}
//             onChange={onNumberChange}
//             placeholder={isAr ? 'رقم الهاتف' : 'Phone number'}
//             dir="ltr"
//             style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13.5, fontFamily: 'var(--font-en)' }}
//           />

//           {number && (
//             <button 
//               type="button" 
//               onClick={() => { setNumber(''); onChange('phone', ''); }} 
//               style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2, flexShrink: 0 }}
//             >
//               <X size={13} />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Dropdown - rendered with portal to avoid clipping */}
//       {open && (
//         <div style={{
//           position: 'fixed',
//           top: dropdownPosition.top,
//           left: dropdownPosition.left,
//           width: dropdownPosition.width || 320,
//           maxWidth: 'min(360px, 90vw)',
//           zIndex: 9999999, // Very high z-index
//           background: 'var(--bg-primary)',
//           border: '1.5px solid var(--border)',
//           borderRadius: 13,
//           overflow: 'hidden',
//           boxShadow: '0 20px 50px rgba(0,0,0,.35)',
//           animation: 'phoneOpen .15s ease',
//         }}>
//           {/* Search */}
//           <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
//             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//             <input
//               ref={searchRef}
//               value={query}
//               onChange={e => setQuery(e.target.value)}
//               onKeyDown={e => {
//                 if (e.key === 'Escape') { setOpen(false); setQuery(''); }
//                 if (e.key === 'Enter' && filtered[0]) pickCountry(filtered[0]);
//               }}
//               placeholder={isAr ? 'ابحث عن دولة أو مفتاح...' : 'Search country or dial code...'}
//               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
//             />
//             {query && (
//               <button 
//                 type="button" 
//                 onClick={() => setQuery('')} 
//                 style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}
//               >
//                 <X size={12} />
//               </button>
//             )}
//           </div>

//           {/* Country list */}
//           <div style={{ maxHeight: 260, overflowY: 'auto' }}>
//             {filtered.length === 0 ? (
//               <div style={{ padding: '18px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>
//                 {isAr ? 'لا توجد نتائج' : 'No results'}
//               </div>
//             ) : filtered.map((c, i) => {
//               const isSel = c.code === countryCode;
//               return (
//                 <button
//                   key={c.code}
//                   type="button"
//                   onClick={() => pickCountry(c)}
//                   style={{
//                     width: '100%', padding: '10px 14px', border: 'none',
//                     background: isSel ? 'rgba(99,102,241,.12)' : 'transparent',
//                     cursor: 'pointer', fontFamily: 'inherit',
//                     display: 'flex', alignItems: 'center', gap: 10,
//                     borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
//                     transition: 'background .12s',
//                     textAlign: isAr ? 'right' : 'left',
//                   }}
//                   onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
//                   onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
//                 >
//                   <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
//                   <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSel ? 700 : 400 }}>
//                     {isAr ? c.ar : c.en}
//                   </span>
//                   <span style={{ fontSize: 13, fontWeight: 700, color: isSel ? '#6366f1' : 'var(--text-secondary)', fontFamily: 'var(--font-en)', flexShrink: 0 }}>
//                     {c.dial}
//                   </span>
//                   {isSel && <Check size={13} color="#6366f1" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Footer */}
//           <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
//               {filtered.length} {isAr ? 'دولة' : 'countries'}
//             </span>
//             <button
//               type="button"
//               onClick={() => { setOpen(false); setQuery(''); }}
//               style={{ padding: '5px 14px', borderRadius: 7, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}
//             >
//               {isAr ? 'تم' : 'Done'}
//             </button>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes phoneOpen {
//           from { opacity: 0; transform: translateY(-8px); }
//           to { opacity: 1; transform: none; }
//         }
//       `}</style>
//     </div>
//   );
// }
// /* ══════════════════════════════════════════════════════════
//    SEARCHABLE SELECT
// ══════════════════════════════════════════════════════════ */
// function SearchableSelect({ label, value, onChange, options, placeholder, isAr, icon: Icon, disabled = false }) {
//   const [open,   setOpen]   = useState(false);
//   const [query,  setQuery]  = useState('');
//   const [coords, setCoords] = useState({ top: 0, left: 0, width: 200 });
//   const wrapRef  = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   useEffect(() => {
//     if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 40); }
//   }, [open]);

//   const calcCoords = () => {
//     if (!wrapRef.current) return;
//     const r = wrapRef.current.getBoundingClientRect();
//     const spaceBelow = window.innerHeight - r.bottom;
//     const dropH = Math.min(options.length * 44 + 80, 300);
//     const top = spaceBelow > dropH ? r.bottom + 6 : r.top - dropH - 6;
//     setCoords({ top, left: r.left, width: r.width });
//   };

//   useEffect(() => {
//     if (!open) return;
//     calcCoords();
//     window.addEventListener('scroll', calcCoords, true);
//     window.addEventListener('resize', calcCoords);
//     return () => { window.removeEventListener('scroll', calcCoords, true); window.removeEventListener('resize', calcCoords); };
//   }, [open, options.length]);

//   const filtered = options.filter(o => {
//     const lbl = typeof o === 'string' ? o : `${o.en} ${o.ar || ''} ${o.flag || ''}`;
//     return lbl.toLowerCase().includes(query.toLowerCase());
//   });

//   const getLabel = (o) => typeof o === 'string' ? o : (isAr && o.ar ? `${o.flag || ''} ${o.ar}` : `${o.flag || ''} ${o.en}`);
//   const displayValue = value ? (() => {
//     const found = options.find(o => (typeof o === 'string' ? o : o.en) === value || (o.ar && o.ar === value));
//     return found ? getLabel(found) : value;
//   })() : '';

//   const select = (o) => { onChange(typeof o === 'string' ? o : o.en); setOpen(false); setQuery(''); };

//   const openDD = () => {
//     if (disabled) return;
//     calcCoords();
//     setOpen(p => !p);
//   };

//   return (
//     <div ref={wrapRef} style={{ marginBottom: 14 }}>
//       <button type="button" disabled={disabled} onClick={openDD} style={{
//         width: '100%', textAlign: isAr ? 'right' : 'left',
//         background: 'var(--bg-secondary)',
//         border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
//         borderRadius: 10, padding: 0,
//         cursor: disabled ? 'not-allowed' : 'pointer',
//         transition: 'border-color .2s', opacity: disabled ? .55 : 1, fontFamily: 'inherit',
//       }}>
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 9px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
//             {Icon && <Icon size={13} color={value ? 'var(--text-primary)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />}
//             <span style={{ fontSize: 13, color: value ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {displayValue || placeholder}
//             </span>
//           </div>
//           <ChevronDown size={14} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
//         </div>
//       </button>

//       {open && (
//         <div style={{
//           position: 'fixed', top: coords.top, left: coords.left, width: coords.width,
//           zIndex: 9999,
//           background: 'var(--bg-primary)', border: '1.5px solid var(--border)',
//           borderRadius: 12, overflow: 'hidden',
//           boxShadow: '0 16px 40px rgba(0,0,0,.28)',
//           animation: 'ssOpen .14s ease',
//         }}>
//           <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
//             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//             <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
//               onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
//               placeholder={isAr ? 'ابحث...' : 'Search...'}
//               dir={isAr ? 'rtl' : 'ltr'}
//               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
//             />
//             {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}><X size={12} /></button>}
//           </div>
//           <div style={{ maxHeight: 220, overflowY: 'auto' }}>
//             {filtered.length === 0
//               ? <div style={{ padding: '16px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد نتائج' : 'No results'}</div>
//               : filtered.map((o, i) => {
//                 const isSel = value === (typeof o === 'string' ? o : o.en) || (o.ar && value === o.ar);
//                 return (
//                   <button key={i} type="button" onClick={() => select(o)} style={{
//                     width: '100%', padding: '10px 14px', border: 'none',
//                     background: isSel ? 'var(--bg-secondary)' : 'transparent',
//                     color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
//                     textAlign: isAr ? 'right' : 'left',
//                     display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
//                     borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
//                     transition: 'background .12s',
//                   }}
//                     onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
//                     onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
//                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLabel(o)}</span>
//                     {isSel && <Check size={14} color="var(--text-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
//                   </button>
//                 );
//               })
//             }
//           </div>
//           {value && (
//             <div style={{ borderTop: '1px solid var(--border)', padding: '6px 12px' }}>
//               <button type="button" onClick={() => { onChange(''); setOpen(false); }} style={{
//                 width: '100%', padding: '7px 8px', border: 'none', background: 'transparent',
//                 cursor: 'pointer', fontSize: 12, color: '#EF4444', fontFamily: 'inherit',
//                 borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6,
//               }}>
//                 <X size={11} /> {isAr ? 'مسح' : 'Clear'}
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//       <style>{`@keyframes ssOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    JOB TITLE COMBOBOX
// ══════════════════════════════════════════════════════════ */
// function JobTitleCombobox({ label, value, onChange, isAr }) {
//   const [open,   setOpen]   = useState(false);
//   const [query,  setQuery]  = useState(value || '');
//   const [coords, setCoords] = useState({ top: 0, left: 0, width: 300 });
//   const wrapRef  = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => { setQuery(value || ''); }, [value]);

//   useEffect(() => {
//     const h = e => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) {
//         setOpen(false);
//         if (!query.trim()) onChange(''); else onChange(query.trim());
//       }
//     };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, [query]);

//   const calcCoords = () => {
//     if (!wrapRef.current) return;
//     const r = wrapRef.current.getBoundingClientRect();
//     const spaceBelow = window.innerHeight - r.bottom;
//     const dropH = 290;
//     const top = spaceBelow > dropH ? r.bottom + 6 : r.top - dropH - 6;
//     setCoords({ top, left: r.left, width: r.width });
//   };

//   useEffect(() => {
//     if (!open) return;
//     calcCoords();
//     window.addEventListener('scroll', calcCoords, true);
//     window.addEventListener('resize', calcCoords);
//     return () => { window.removeEventListener('scroll', calcCoords, true); window.removeEventListener('resize', calcCoords); };
//   }, [open]);

//   useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);

//   const filtered = query
//     ? JOB_TITLES.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 14)
//     : JOB_TITLES.slice(0, 14);

//   const select = (t) => { setQuery(t); onChange(t); setOpen(false); };

//   return (
//     <div ref={wrapRef} style={{ marginBottom: 14 }}>
//       <div style={{ background: 'var(--bg-secondary)', border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: 10, transition: 'border-color .2s' }}>
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
//         <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 9px', gap: 7 }}>
//           <Briefcase size={13} color={value ? 'var(--text-primary)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
//           <input
//             ref={inputRef}
//             value={query}
//             dir={isAr ? 'rtl' : 'ltr'}
//             placeholder={isAr ? 'اكتب أو ابحث عن مسمى وظيفي...' : 'Type or search a job title...'}
//             onChange={e => { setQuery(e.target.value); onChange(e.target.value); if (!open) { calcCoords(); setOpen(true); } }}
//             onFocus={() => { calcCoords(); setOpen(true); }}
//             onKeyDown={e => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && filtered[0]) select(filtered[0]); }}
//             style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
//           />
//           {query && <button type="button" onClick={() => { setQuery(''); onChange(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}><X size={12} /></button>}
//           <ChevronDown size={13} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
//         </div>
//       </div>

//       {open && (
//         <div style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,.28)', animation: 'ssOpen .14s ease' }}>
//           <div style={{ maxHeight: 240, overflowY: 'auto' }}>
//             {filtered.length === 0
//               ? <div style={{ padding: '14px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد نتائج · سيُحفظ ما كتبته' : 'No matches · your text will be saved'}</div>
//               : filtered.map((t, i) => {
//                 const isSel = value === t;
//                 return (
//                   <button key={i} type="button" onClick={() => select(t)} style={{
//                     width: '100%', padding: '10px 14px', border: 'none',
//                     background: isSel ? 'var(--bg-secondary)' : 'transparent',
//                     color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
//                     textAlign: isAr ? 'right' : 'left',
//                     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                     borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
//                     transition: 'background .12s',
//                   }}
//                     onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
//                     onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
//                     {t}
//                     {isSel && <Check size={14} color="var(--text-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
//                   </button>
//                 );
//               })}
//           </div>
//           <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
//             <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
//               {isAr ? '💡 يمكنك كتابة أي مسمى وظيفي غير موجود في القائمة' : '💡 You can type any custom title not in the list'}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    LOCATION MULTI-PICKER
// ══════════════════════════════════════════════════════════ */
// function LocationMultiPicker({ label, value = [], onChange, isAr }) {
//   const [open,   setOpen]   = useState(false);
//   const [query,  setQuery]  = useState('');
//   const [coords, setCoords] = useState({ top: 0, left: 0, width: 300 });
//   const wrapRef   = useRef(null);
//   const searchRef = useRef(null);

//   useEffect(() => {
//     const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   const calcCoords = () => {
//     if (!wrapRef.current) return;
//     const r = wrapRef.current.getBoundingClientRect();
//     const spaceBelow = window.innerHeight - r.bottom;
//     const top = spaceBelow > 340 ? r.bottom + 6 : r.top - 340 - 6;
//     setCoords({ top, left: r.left, width: r.width });
//   };

//   useEffect(() => {
//     if (!open) return;
//     calcCoords();
//     setTimeout(() => searchRef.current?.focus(), 40);
//     window.addEventListener('scroll', calcCoords, true);
//     window.addEventListener('resize', calcCoords);
//     return () => { window.removeEventListener('scroll', calcCoords, true); window.removeEventListener('resize', calcCoords); };
//   }, [open]);

//   const filtered = query.trim()
//     ? ALL_LOCATIONS.filter(l => {
//       const q = query.toLowerCase();
//       return l.en.toLowerCase().includes(q) || (l.ar && l.ar.includes(query));
//     }).slice(0, 20)
//     : ALL_LOCATIONS.slice(0, 20);

//   const isSelected = (loc) => value.includes(loc.key);
//   const toggle = (loc) => onChange(isSelected(loc) ? value.filter(v => v !== loc.key) : [...value, loc.key]);
//   const remove = (key) => onChange(value.filter(v => v !== key));

//   const getDisplay = (key) => {
//     const found = ALL_LOCATIONS.find(l => l.key === key);
//     if (!found) return { label: key, icon: '📍' };
//     return { label: isAr && found.ar ? found.ar : found.en, icon: found.icon };
//   };

//   const modes     = filtered.filter(l => l.type === 'mode');
//   const countries = filtered.filter(l => l.type === 'country');
//   const cities    = filtered.filter(l => l.type === 'city');

//   const renderGroup = (items, groupLabel) => {
//     if (!items.length) return null;
//     return (
//       <>
//         <div style={{ padding: '5px 14px 4px', fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
//           {groupLabel}
//         </div>
//         {items.map((loc) => {
//           const sel = isSelected(loc);
//           return (
//             <button key={loc.key} type="button" onClick={() => toggle(loc)} style={{
//               width: '100%', padding: '9px 14px', border: 'none',
//               background: sel ? 'var(--bg-secondary)' : 'transparent',
//               color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
//               textAlign: isAr ? 'right' : 'left',
//               display: 'flex', alignItems: 'center', gap: 9,
//               borderBottom: '1px solid var(--border)', transition: 'background .12s',
//             }}
//               onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
//               onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
//               <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{loc.icon}</span>
//               <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                 {isAr && loc.ar ? loc.ar : loc.en}
//               </span>
//               {sel
//                 ? <Check size={14} color="var(--text-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
//                 : <div style={{ width: 14, height: 14, borderRadius: 4, border: '1.5px solid var(--border)', flexShrink: 0 }} />
//               }
//             </button>
//           );
//         })}
//       </>
//     );
//   };

//   return (
//     <div ref={wrapRef} style={{ marginBottom: 14 }}>
//       <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px' }}>{label}</p>
//       {value.length > 0 && (
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
//           {value.map(key => {
//             const { label: lbl, icon } = getDisplay(key);
//             return (
//               <div key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600 }}>
//                 <span style={{ fontSize: 14 }}>{icon}</span>
//                 <span>{lbl}</span>
//                 <button type="button" onClick={() => remove(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0 0 0 2px', opacity: .6 }}>
//                   <X size={11} strokeWidth={2.5} />
//                 </button>
//               </div>
//             );
//           })}
//           <button type="button" onClick={() => onChange([])} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>
//             <X size={10} /> {isAr ? 'مسح الكل' : 'Clear all'}
//           </button>
//         </div>
//       )}
//       <button type="button" onClick={() => { calcCoords(); setOpen(p => !p); }} style={{
//         width: '100%', textAlign: isAr ? 'right' : 'left',
//         background: 'var(--bg-secondary)', border: `1.5px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`,
//         borderRadius: 10, padding: '9px 13px', cursor: 'pointer', fontFamily: 'inherit',
//         display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color .2s',
//       }}>
//         <MapPin size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//         <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>
//           {value.length ? (isAr ? `${value.length} موقع مختار` : `${value.length} location${value.length > 1 ? 's' : ''} selected`) : (isAr ? 'اختر المواقع المرغوبة...' : 'Choose desired locations...')}
//         </span>
//         <ChevronDown size={13} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
//       </button>

//       {open && (
//         <div style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 13, overflow: 'hidden', boxShadow: '0 16px 44px rgba(0,0,0,.28)', animation: 'ssOpen .14s ease' }}>
//           <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)' }}>
//             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//             <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
//               placeholder={isAr ? 'ابحث عن مدينة أو دولة...' : 'Search city or country...'}
//               dir={isAr ? 'rtl' : 'ltr'}
//               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
//             />
//             {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}><X size={12} /></button>}
//           </div>
//           <div style={{ maxHeight: 240, overflowY: 'auto' }}>
//             {!query && renderGroup(modes, isAr ? 'نوع العمل' : 'Work Mode')}
//             {!query && renderGroup(countries, isAr ? 'الدول' : 'Countries')}
//             {renderGroup(query ? filtered : cities, isAr ? (query ? 'النتائج' : 'المدن') : (query ? 'Results' : 'Cities'))}
//             {filtered.length === 0 && <div style={{ padding: '20px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد نتائج' : 'No results found'}</div>}
//           </div>
//           <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
//               {value.length > 0 ? (isAr ? `${value.length} مختار` : `${value.length} selected`) : (isAr ? 'اختر أكثر من موقع' : 'Pick multiple')}
//             </span>
//             <button type="button" onClick={() => setOpen(false)} style={{ padding: '5px 14px', borderRadius: 8, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit' }}>
//               {isAr ? 'تم' : 'Done'}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    SMALL HELPERS
// ══════════════════════════════════════════════════════════ */
// function Field({ label, name, type = 'text', as = 'input', rows = 3, placeholder = '', value, onChange }) {
//   return (
//     <div style={{ marginBottom: 14 }}>
//       <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s, background .2s' }}
//         onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
//         onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
//         {as === 'textarea' ? (
//           <textarea rows={rows} value={value || ''} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
//             style={{ display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
//         ) : (
//           <input type={type} value={value || ''} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
//             style={{ display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', boxSizing: 'border-box' }} />
//         )}
//       </div>
//     </div>
//   );
// }

// function SelectField({ label, value, onChange, children }) {
//   return (
//     <div style={{ marginBottom: 14 }}>
//       <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s' }}
//         onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//         onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
//         <select value={value} onChange={onChange} style={{ display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' }}>
//           {children}
//         </select>
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    AVATAR MODAL
// ══════════════════════════════════════════════════════════ */
// function AvatarModal({ onClose, onSelect, currentUrl, isAr }) {
//   const [presets, setPresets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [picking, setPicking] = useState(null);

//   useEffect(() => {
//     api.get('/users/presets/avatars')
//       .then(({ data }) => setPresets(data.data.avatars))
//       .catch(() => toast.error(isAr ? 'فشل تحميل الصور' : 'Failed to load avatars'))
//       .finally(() => setLoading(false));
//   }, []);

//   const handleSelect = async (preset) => {
//     setPicking(preset.id);
//     try {
//       await api.patch('/users/me/avatar/preset', { avatarUrl: preset.url });
//       onSelect(preset.url);
//       toast.success(isAr ? 'تم تحديث الصورة ✓' : 'Avatar updated ✓');
//       onClose();
//     } catch {
//       toast.error(isAr ? 'فشل تحديث الصورة' : 'Failed to update avatar');
//     } finally { setPicking(null); }
//   };

//   return (
//     <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
//       <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 480, padding: 24, position: 'relative', animation: 'profFadeUp 0.25s ease' }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//           <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{isAr ? 'اختر صورة شخصية' : 'Choose Avatar'}</h2>
//           <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <X size={14} color="var(--text-primary)" strokeWidth={2.5} />
//           </button>
//         </div>
//         {loading ? (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
//             {[1, 2, 3, 4].map(i => <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: 'var(--border)', animation: 'profPulse 1.5s ease-in-out infinite' }} />)}
//           </div>
//         ) : presets.length === 0 ? (
//           <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: '20px 0' }}>{isAr ? 'لا توجد صور متاحة' : 'No avatars available'}</p>
//         ) : (
//           <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(presets.length, 4)},1fr)`, gap: 12 }}>
//             {presets.map(preset => {
//               const isActive  = currentUrl === preset.url;
//               const isPicking = picking === preset.id;
//               return (
//                 <button key={preset.id} onClick={() => !picking && handleSelect(preset)} disabled={!!picking} style={{ padding: 4, borderRadius: 12, cursor: picking ? 'not-allowed' : 'pointer', border: `${isActive ? '2.5px' : '1.5px'} solid ${isActive ? 'var(--text-primary)' : 'var(--border)'}`, background: isActive ? 'var(--bg-secondary)' : 'transparent', opacity: picking && !isPicking ? 0.5 : 1, transition: 'all .18s', position: 'relative', fontFamily: 'inherit' }}>
//                   <div style={{ position: 'relative' }}>
//                     <img src={preset.url} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, objectFit: 'cover', display: 'block', opacity: isPicking ? 0.4 : 1 }} />
//                     {isPicking && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={22} color="var(--text-primary)" strokeWidth={2} style={{ animation: 'profSpin 0.8s linear infinite' }} /></div>}
//                   </div>
//                   {isActive && !isPicking && (
//                     <div style={{ position: 'absolute', top: 6, insetInlineEnd: 6, width: 20, height: 20, borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                       <Check size={11} color="var(--bg-primary)" strokeWidth={3} />
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════════ */
// const API_BASE   = (import.meta.env.VITE_API_URL ).replace('/api/v1', '');
// const toAbsolute = (url) => !url ? null : url.startsWith('http') ? url : `${API_BASE}${url}`;

// export default function ProfilePage() {
//   const { lang }     = useLang();
//   const { theme }    = useThemeStore();
//   const isAr         = lang === 'ar';
//   const { user, updateUser } = useAuthStore();
//   const avatarRef    = useRef(null);
//   const [collapsed, setCollapsed] = useState(false);

//   const [form, setForm] = useState({
//     fullName: '', phone: '', headline: '', bio: '',
//     locationCountry: '', locationCity: '', dateOfBirth: '', gender: '', nationality: '',
//     linkedinUrl: '', portfolioUrl: '',
//     desiredJobTitle: '', desiredSalaryMin: '', desiredSalaryMax: '',
//     openToWork: true, discoverable: true,
//     desiredJobTypes: [], desiredIndustries: [], desiredLocations: [],
//   });

//   const [loading,   setLoading]   = useState(true);
//   const [saving,    setSaving]    = useState(false);
//   const [avatarUp,  setAvatarUp]  = useState(false);
//   const [preview,   setPreview]   = useState(null);
//   const [avatarSrc, setAvatarSrc] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('personal');

//   // ★ Auto-Apply — own resource, own loading/saving state, lives outside `form`
//   const [autoApply, setAutoApply] = useState({ autoApplyEnabled: false });
//   const [autoApplyLoading, setAutoApplyLoading] = useState(true);
//   const [autoApplySaving, setAutoApplySaving] = useState(false);
//   const [autoApplyStats, setAutoApplyStats] = useState(null);

//   const fetchProfile = useCallback(async () => {
//     try {
//       const { data } = await api.get('/users/me');
//       const u = data.data.user;
//       setAvatarSrc(u.avatarUrl || null);
//       setForm({
//         fullName:          u.fullName          || '',
//         phone:             u.phone             || '',
//         headline:          u.headline          || '',
//         bio:               u.bio               || '',
//         locationCountry:   u.locationCountry   || '',
//         locationCity:      u.locationCity      || '',
//         dateOfBirth:       u.dateOfBirth?.split?.('T')[0] || '',
//         gender:            u.gender            || '',
//         nationality:       u.nationality       || '',
//         linkedinUrl:       u.linkedinUrl       || '',
//         portfolioUrl:      u.portfolioUrl      || '',
//         desiredJobTitle:   u.desiredJobTitle   || '',
//         desiredSalaryMin:  u.desiredSalaryMin  || '',
//         desiredSalaryMax:  u.desiredSalaryMax  || '',
//         openToWork:        u.openToWork        ?? true,
//         discoverable:      u.discoverable      ?? true,
//         desiredJobTypes:   u.desiredJobTypes   || [],
//         desiredIndustries: u.desiredIndustries || [],
//         desiredLocations:  u.desiredLocations  || [],
//       });
//     } catch {
//       toast.error(isAr ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile');
//     } finally { setLoading(false); }
//   }, [isAr]);

//   // ★ Auto-Apply settings — fetched independently from /auto-apply/settings
//   const fetchAutoApplySettings = useCallback(async () => {
//     try {
//       const { data } = await api.get('/auto-apply/settings');
//       if (data?.data) setAutoApply(p => ({ ...p, ...data.data }));
//     } catch {
//       // Non-fatal: leave default (disabled) and let the UI still render.
//     } finally {
//       setAutoApplyLoading(false);
//     }
//   }, []);

//   // ★ Auto-Apply stats — used to power the small usage summary in the Career tab
//   const fetchAutoApplyStats = useCallback(async () => {
//     try {
//       const { data } = await api.get('/auto-apply/stats');
//       if (data?.data) setAutoApplyStats(data.data);
//     } catch {
//       // Non-fatal — stats are supplementary, no toast needed.
//     }
//   }, []);

//   useEffect(() => { fetchProfile(); }, [fetchProfile]);
//   useEffect(() => {
//     fetchAutoApplySettings();
//     fetchAutoApplyStats();
//   }, [fetchAutoApplySettings, fetchAutoApplyStats]);

//   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

//   // ★ Toggle handler — saves immediately via PATCH /auto-apply/settings.
//   // Shared by both the header quick-toggle pill and the Career tab toggle.
//   const handleAutoApplyToggle = async () => {
//     if (!['pro', 'elite'].includes(user?.planKey)) return;
//     if (autoApplySaving) return;

//     const next = !autoApply.autoApplyEnabled;
//     setAutoApplySaving(true);
//     // Optimistic update so the toggle feels instant
//     setAutoApply(p => ({ ...p, autoApplyEnabled: next }));

//     try {
//       const { data } = await api.patch('/auto-apply/settings', { autoApplyEnabled: next });
//       const confirmed = data?.data?.autoApplyEnabled ?? next;
//       setAutoApply(p => ({ ...p, ...data?.data, autoApplyEnabled: confirmed }));
//       toast.success(
//         confirmed
//           ? (isAr ? 'تم تفعيل التقديم التلقائي ✓' : 'Auto-Apply enabled ✓')
//           : (isAr ? 'تم إيقاف التقديم التلقائي' : 'Auto-Apply disabled')
//       );
//     } catch (err) {
//       // Revert on failure
//       setAutoApply(p => ({ ...p, autoApplyEnabled: !next }));
//       toast.error(err.response?.data?.message || (isAr ? 'فشل تحديث إعدادات التقديم التلقائي' : 'Failed to update Auto-Apply settings'));
//     } finally {
//       setAutoApplySaving(false);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const { data } = await api.patch('/users/me', form);
//       updateUser(data.data.user);
//       toast.success(isAr ? 'تم حفظ الملف الشخصي ✓' : 'Profile saved ✓');
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
//     } finally { setSaving(false); }
//   };

//   const handleAvatarPick = (file) => {
//     if (!file) return;
//     if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) { toast.error(isAr ? 'JPEG/PNG/WebP فقط' : 'JPEG/PNG/WebP only'); return; }
//     if (file.size > 5 * 1024 * 1024) { toast.error(isAr ? 'الحد الأقصى 5 ميغا' : 'Max 5MB'); return; }
//     setPreview({ file, url: URL.createObjectURL(file) });
//   };

//   const handleAvatarUpload = async () => {
//     if (!preview) return;
//     setAvatarUp(true);
//     const fd = new FormData();
//     fd.append('avatar', preview.file);
//     try {
//       const { data } = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//       const finalUrl = data.data.avatarUrl;
//       setAvatarSrc(finalUrl);
//       setPreview(null);
//       updateUser({ avatarUrl: finalUrl, avatarKey: data.data.avatarKey || null });
//       toast.success(isAr ? 'تم رفع الصورة بنجاح ✓' : 'Photo uploaded successfully ✓', { duration: 4000, position: 'top-center' });
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل رفع الصورة' : 'Upload failed'), { duration: 4000, position: 'top-center' });
//     } finally { setAvatarUp(false); }
//   };

//   const handlePresetChosen = (url) => {
//     setAvatarSrc(url);
//     setPreview(null);
//     updateUser({ avatarUrl: url, avatarKey: null });
//   };

//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   const initials = (form.fullName || user?.fullName || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

//   const JOB_TYPES = [
//     { key: 'full_time',  ar: 'دوام كامل', en: 'Full-time'  },
//     { key: 'part_time',  ar: 'دوام جزئي', en: 'Part-time'  },
//     { key: 'freelance',  ar: 'مستقل',      en: 'Freelance'  },
//     { key: 'internship', ar: 'تدريب',      en: 'Internship' },
//     { key: 'remote',     ar: 'عن بُعد',    en: 'Remote'     },
//   ];
//   const toggleJobType = (k) => {
//     const arr = form.desiredJobTypes || [];
//     set('desiredJobTypes', arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);
//   };

//   const completionFields = [
//     { done: !!form.fullName },
//     { done: !!form.headline },
//     { done: !!form.bio },
//     { done: !!form.phone },
//     { done: !!form.locationCountry },
//     { done: !!form.linkedinUrl },
//     { done: !!form.desiredJobTitle },
//     { done: !!(avatarSrc || preview) },
//   ];
//   const completionPct = Math.round((completionFields.filter(f => f.done).length / completionFields.length) * 100);

//   const TABS = [
//     { key: 'personal', ar: 'الشخصية', en: 'Personal', icon: User },
//     { key: 'social',   ar: 'الروابط', en: 'Social',   icon: Link },
//     { key: 'career',   ar: 'المهنة',  en: 'Career',   icon: Briefcase },
//   ];

//   return (
//     <>
//       <style>{`
//         @keyframes profSpin    { to { transform: rotate(360deg); } }
//         @keyframes profPulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
//         @keyframes profSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
//         @keyframes profFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
//         * { box-sizing: border-box; } body { margin: 0; }
//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
//         @media(max-width:1024px){ .prof-main { padding-bottom: 80px !important; } }
//         @media(max-width:580px)  { .prof-g2 { grid-template-columns: 1fr !important; } }
//       `}</style>

//       {showModal && (
//         <AvatarModal
//           currentUrl={avatarSrc}
//           onClose={() => setShowModal(false)}
//           onSelect={url => { setAvatarSrc(url); setPreview(null); updateUser({ avatarUrl: url, avatarKey: null }); }}
//           isAr={isAr}
//         />
//       )}

//       <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
//         <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
//           <MobileTopBar title={isAr ? 'الملف الشخصي' : 'Profile'} />

//           <main className="prof-main" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)' }}>
//             {loading ? (
//               <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 720, margin: '0 auto' }}>
//                 {[88, 56, 56, 56, 120, 56].map((h, i) => (
//                   <div key={i} style={{ height: h, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', marginBottom: 12, animation: 'profPulse 1.5s ease-in-out infinite' }} />
//                 ))}
//               </div>
//             ) : (
//               <>
//                 {/* HEADER */}
//                 <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: 'clamp(16px,3vw,28px) clamp(16px,3vw,28px) 0' }}>
//                   <div style={{ maxWidth: 720, margin: '0 auto' }}>
//                     <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
//                       {/* Avatar */}
//                       <div style={{ position: 'relative', flexShrink: 0 }}>
//                         <div style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid var(--bg-secondary)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1px var(--border)' }}>
//                           {avatarUp
//                             ? <Loader2 size={28} color="var(--text-secondary)" style={{ animation: 'profSpin .8s linear infinite' }} />
//                             : preview
//                               ? <img src={preview.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                               : avatarSrc
//                                 ? <img src={avatarSrc} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                                 : <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{initials}</span>
//                           }
//                         </div>
//                         <button onClick={() => setShowModal(true)} style={{ position: 'absolute', bottom: 1, insetInlineEnd: 1, width: 28, height: 28, borderRadius: '50%', background: 'var(--text-primary)', border: '2.5px solid var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                           <Camera size={13} color="#444040" strokeWidth={3.2} />
//                         </button>
//                       </div>

//                       {/* Name & headline */}
//                       <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
//                         <h1 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', fontWeight: 900, margin: '0 0 3px', color: 'var(--text-primary)', fontFamily: font }}>
//                           {form.fullName || user?.fullName || (isAr ? 'اسمك' : 'Your Name')}
//                         </h1>
//                         <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 10px', fontFamily: font }}>
//                           {form.headline || (isAr ? 'أضف عنوانك المهني' : 'Add your headline')}
//                         </p>
                        

//                         {/* ★ Auto-Apply toggle — Pro only — backed by /auto-apply/settings */}
//                         {['pro','elite'].includes(user?.planKey) ? (
//                           <button
//                             onClick={handleAutoApplyToggle}
//                             disabled={autoApplyLoading || autoApplySaving}
//                             style={{
//                               display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99,
//                               cursor: (autoApplyLoading || autoApplySaving) ? 'not-allowed' : 'pointer',
//                               border: `1.5px solid ${autoApply.autoApplyEnabled ? 'rgba(139,92,246,.4)' : 'var(--border)'}`,
//                               background: autoApply.autoApplyEnabled ? 'rgba(139,92,246,.1)' : 'var(--bg-secondary)',
//                               color: autoApply.autoApplyEnabled ? '#8B5CF6' : 'var(--text-secondary)',
//                               fontSize: 12, fontWeight: 700, fontFamily: font, transition: 'all .18s',
//                               opacity: autoApplyLoading ? .6 : 1,
//                             }}
//                           >
//                             {autoApplySaving
//                               ? <Loader2 size={9} style={{ animation: 'profSpin .7s linear infinite' }} />
//                               : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
//                             }
//                             {autoApply.autoApplyEnabled ? (isAr ? '⚡ Auto-Apply نشط' : '⚡ Auto-Apply ON') : (isAr ? 'Auto-Apply' : 'Auto-Apply')}
//                           </button>
//                         ) : (
//                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, fontFamily: font, opacity: 0.6, cursor: 'default' }}>
//                             🔒 {isAr ? 'Auto-Apply (Pro)' : 'Auto-Apply (Pro)'}
//                           </span>
//                         )}
//                       </div>

//                       {/* Upload photo */}
//                       <div style={{ paddingBottom: 4, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
//                         <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleAvatarPick(e.target.files[0])} />
//                         {preview ? (
//                           <div style={{ display: 'flex', gap: 7 }}>
//                             <button onClick={handleAvatarUpload} disabled={avatarUp} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
//                               {avatarUp ? <Loader2 size={14} style={{ animation: 'profSpin .7s linear infinite' }} /> : <Check size={14} strokeWidth={2.5} />}
//                               {isAr ? 'رفع الصورة' : 'Upload'}
//                             </button>
//                             <button onClick={() => setPreview(null)} style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font }}>
//                               {isAr ? 'إلغاء' : 'Cancel'}
//                             </button>
//                           </div>
//                         ) : (
//                           <button onClick={() => avatarRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font, transition: 'all .18s' }}
//                             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//                             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//                             <Pencil size={13} strokeWidth={1.8} />
//                             {isAr ? 'رفع صورة' : 'Upload Photo'}
//                           </button>
//                         )}
//                         <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: 0, textAlign: 'center', fontFamily: font }}>JPG, PNG, WebP · 5MB</p>
//                       </div>
//                     </div>

//                     {/* Completion bar */}
//                     <div style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
//                       <div style={{ flex: 1 }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
//                           <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, fontFamily: font }}>{isAr ? 'اكتمال الملف' : 'Profile completion'}</span>
//                           <span style={{ fontSize: 12, fontWeight: 800, color: completionPct >= 80 ? '#22C55E' : completionPct >= 50 ? '#F59E0B' : 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{completionPct}%</span>
//                         </div>
//                         <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
//                           <div style={{ height: '100%', borderRadius: 99, transition: 'width .6s cubic-bezier(.34,1.56,.64,1)', width: `${completionPct}%`, background: completionPct >= 80 ? '#22C55E' : completionPct >= 50 ? '#F59E0B' : 'var(--border)' }} />
//                         </div>
//                       </div>
//                       {completionPct < 100 && (
//                         <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: font }}>
//                           {completionFields.filter(f => !f.done).length} {isAr ? 'خطوات' : 'left'}
//                         </span>
//                       )}
//                     </div>

//                     {/* Tabs */}
//                     <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
//                       {TABS.map(tab => {
//                         const Icon = tab.icon;
//                         return (
//                           <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
//                             display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px',
//                             border: 'none', background: 'transparent', cursor: 'pointer',
//                             fontFamily: font, fontSize: 13.5,
//                             fontWeight: activeTab === tab.key ? 700 : 500,
//                             color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
//                             borderBottom: `2.5px solid ${activeTab === tab.key ? 'var(--text-primary)' : 'transparent'}`,
//                             marginBottom: -1, transition: 'color .15s, border-color .15s', borderRadius: '8px 8px 0 0',
//                           }}>
//                             <Icon size={16} />
//                             {isAr ? tab.ar : tab.en}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 {/* TAB CONTENT */}
//                 <div style={{ padding: 'clamp(16px,3vw,28px)', maxWidth: 720, margin: '0 auto', animation: 'profSlideIn .25s ease' }} key={activeTab}>

//                   {/* PERSONAL */}
//                   {activeTab === 'personal' && (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'المعلومات الأساسية' : 'Basic Information'}</span>
//                         </div>
//                         <div style={{ padding: '18px 18px 4px' }}>
//                           <Field label={isAr ? 'الاسم الكامل' : 'Full Name'} name="fullName" value={form.fullName} onChange={set} placeholder={isAr ? 'محمد العمري' : 'Mohammed Al Omari'} />
//                           <Field label={isAr ? 'العنوان المهني' : 'Professional Headline'} name="headline" value={form.headline} onChange={set} placeholder={isAr ? 'مطور واجهات أمامية · 5 سنوات خبرة' : 'Frontend Developer · 5 years experience'} />
//                           <Field label={isAr ? 'نبذة شخصية' : 'Bio'} name="bio" as="textarea" rows={4} value={form.bio} onChange={set} placeholder={isAr ? 'أخبر أصحاب العمل عن نفسك...' : 'Tell employers about yourself...'} />
//                         </div>
//                       </div>

//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'بيانات التواصل' : 'Contact Details'}</span>
//                         </div>
//                         <div style={{ padding: '18px 18px 4px' }}>
//                           <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                             <PhoneInput label={isAr ? 'رقم الهاتف' : 'Phone Number'} value={form.phone} onChange={set} isAr={isAr} />
//                             <SearchableSelect label={isAr ? 'الجنسية' : 'Nationality'} value={form.nationality} onChange={v => set('nationality', v)} options={NATIONALITIES} placeholder={isAr ? 'اختر الجنسية' : 'Select nationality'} isAr={isAr} />
//                           </div>
//                           <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                             <SearchableSelect label={isAr ? 'الدولة' : 'Country'} value={form.locationCountry} onChange={v => { set('locationCountry', v); set('locationCity', ''); }} options={COUNTRIES} placeholder={isAr ? 'اختر الدولة' : 'Select country'} isAr={isAr} icon={MapPin} />
//                             <SearchableSelect label={isAr ? 'المدينة' : 'City'} value={form.locationCity} onChange={v => set('locationCity', v)}
//                               options={(() => { const c = COUNTRIES.find(x => x.en === form.locationCountry); return c ? (CITIES_BY_COUNTRY[c.code] || []) : Object.values(CITIES_BY_COUNTRY).flat(); })()}
//                               placeholder={isAr ? 'اختر المدينة' : 'Select city'} isAr={isAr} icon={MapPin} />
//                           </div>
//                         </div>
//                       </div>

//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'البيانات الشخصية' : 'Personal Details'}</span>
//                         </div>
//                         <div style={{ padding: '18px 18px 4px' }}>
//                           <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                             <SelectField label={isAr ? 'الجنس' : 'Gender'} value={form.gender} onChange={e => set('gender', e.target.value)}>
//                               <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
//                               <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
//                               <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
//                               <option value="prefer_not">{isAr ? 'أفضل عدم الذكر' : 'Prefer not to say'}</option>
//                             </SelectField>
//                             <Field label={isAr ? 'تاريخ الميلاد' : 'Date of Birth'} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set} />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* SOCIAL */}
//                   {activeTab === 'social' && (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'الروابط الاجتماعية والمهنية' : 'Social & Professional Links'}</span>
//                         </div>
//                         <div style={{ padding: '18px 18px 4px' }}>
//                           {[
//                             { key: 'linkedinUrl', label: 'LinkedIn', icon: '🔗', placeholder: 'linkedin.com/in/username' },
//                             { key: 'portfolioUrl', label: isAr ? 'الموقع الشخصي / Portfolio' : 'Portfolio / Website', icon: '🌐', placeholder: 'myportfolio.com' },
//                           ].map(({ key, label, icon, placeholder }) => (
//                             <div key={key} style={{ marginBottom: 14 }}>
//                               <div style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .2s' }}
//                                 onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//                                 onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
//                                 <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
//                                 <div style={{ display: 'flex', alignItems: 'center', padding: '2px 12px 9px', gap: 8 }}>
//                                   <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
//                                   <input type="url" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} dir="ltr"
//                                     style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-en)' }} />
//                                   {form[key] && (
//                                     <a href={form[key].startsWith('http') ? form[key] : `https://${form[key]}`} target="_blank" rel="noopener noreferrer"
//                                       style={{ color: 'var(--text-secondary)', fontSize: 11.5, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
//                                       {isAr ? 'فتح' : 'Open'} ↗
//                                     </a>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* CAREER */}
//                   {activeTab === 'career' && (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'تفضيلات الوظيفة' : 'Job Preferences'}</span>
//                         </div>
//                         <div style={{ padding: '18px 18px 4px' }}>
//                           <JobTitleCombobox label={isAr ? 'المسمى الوظيفي المرغوب' : 'Desired Job Title'} value={form.desiredJobTitle} onChange={v => set('desiredJobTitle', v)} isAr={isAr} />
//                           <div style={{ marginBottom: 14 }}>
//                             <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px', fontFamily: font }}>{isAr ? 'نطاق الراتب المتوقع (شهري)' : 'Expected Salary Range (monthly)'}</p>
//                             <div className="prof-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                               {[
//                                 { key: 'desiredSalaryMin', label: isAr ? 'الحد الأدنى' : 'Minimum', placeholder: '3,000' },
//                                 { key: 'desiredSalaryMax', label: isAr ? 'الحد الأقصى' : 'Maximum', placeholder: '10,000' },
//                               ].map(({ key, label, placeholder }) => (
//                                 <div key={key} style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
//                                   onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//                                   onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
//                                   <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>{label}</span>
//                                   <div style={{ display: 'flex', alignItems: 'center', padding: '2px 12px 9px', gap: 6 }}>
//                                     <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: 'var(--font-en)' }}>$</span>
//                                     <input type="number" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} min="0"
//                                       style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 13.5, fontFamily: 'var(--font-en)', fontWeight: 600 }} />
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                           <div style={{ marginBottom: 14 }}>
//                             <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 9px', fontFamily: font }}>{isAr ? 'أنواع الوظائف المفضلة' : 'Preferred Job Types'}</p>
//                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                               {JOB_TYPES.map(t => {
//                                 const active = (form.desiredJobTypes || []).includes(t.key);
//                                 return (
//                                   <button key={t.key} onClick={() => toggleJobType(t.key)} style={{
//                                     display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
//                                     border: `1.5px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
//                                     background: 'var(--bg-secondary)',
//                                     color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
//                                     fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: font, transition: 'all .18s',
//                                   }}>
//                                     {active && <Check size={12} strokeWidth={2.8} />}
//                                     {isAr ? t.ar : t.en}
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* ★ Auto-Apply settings card — backed by /auto-apply/settings + /auto-apply/stats */}
//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>
//                             {isAr ? 'التقديم التلقائي (Auto-Apply)' : 'Auto-Apply Settings'}
//                           </span>
//                           <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>PRO</span>
//                         </div>
//                         <div style={{ padding: '18px' }}>
//                           {['pro','elite'].includes(user?.planKey) ? (
//                             <>
//                               {autoApplyLoading ? (
//                                 <div style={{ height: 70, borderRadius: 12, background: 'var(--bg-secondary)', animation: 'profPulse 1.5s ease-in-out infinite' }} />
//                               ) : (
//                                 <>
//                                   {/* Toggle */}
//                                   <div style={{
//                                     display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12,
//                                     background: autoApply.autoApplyEnabled ? 'rgba(139,92,246,0.07)' : 'var(--bg-secondary)',
//                                     border: `1px solid ${autoApply.autoApplyEnabled ? 'rgba(139,92,246,0.25)' : 'var(--border)'}`,
//                                     cursor: autoApplySaving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginBottom: 14,
//                                     opacity: autoApplySaving ? .7 : 1,
//                                   }}
//                                     onClick={handleAutoApplyToggle}>
//                                     <div style={{ flex: 1 }}>
//                                       <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', fontFamily: font }}>
//                                         {isAr ? 'تفعيل التقديم التلقائي' : 'Enable AI Auto-Apply'}
//                                       </p>
//                                       <p style={{ fontSize: 12, color: autoApply.autoApplyEnabled ? '#8B5CF6' : 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.5 }}>
//                                         {autoApply.autoApplyEnabled
//                                           ? (isAr ? '⚡ نشط — AI يتقدم 3 مرات يومياً تلقائياً على أفضل الوظائف' : '⚡ Active — AI applies 3 times/day automatically to best matching jobs')
//                                           : (isAr ? 'يتقدم AI نيابةً عنك 3 مرات يومياً على الوظائف المناسبة ≥65% تطابقاً' : 'AI applies on your behalf 3×/day to jobs matching ≥65%')}
//                                       </p>
//                                     </div>
//                                     {autoApplySaving ? (
//                                       <Loader2 size={18} color="#8B5CF6" style={{ animation: 'profSpin .7s linear infinite', flexShrink: 0 }} />
//                                     ) : (
//                                       <div style={{ width: 46, height: 26, borderRadius: 13, background: autoApply.autoApplyEnabled ? '#8B5CF6' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
//                                         <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: autoApply.autoApplyEnabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
//                                       </div>
//                                     )}
//                                   </div>

//                                   {/* Consent note */}
//                                   {autoApply.autoApplyEnabled && (
//                                     <div style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 12, color: '#8B5CF6', lineHeight: 1.6, fontFamily: font, marginBottom: 14 }}>
//                                       ⚠️ {isAr
//                                         ? 'بتفعيل هذه الميزة أنت توافق على أن TalexHub سيُرسل سيرتك الذاتية تلقائياً إلى الشركات المناسبة. يمكنك إيقافها في أي وقت.'
//                                         : 'By enabling this, you agree that TalexHub will automatically send your CV to matching companies. You can disable anytime.'}
//                                     </div>
//                                   )}

//                                   {/* Stats summary */}
//                                   {autoApplyStats && (
//                                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
//                                       {[
//                                         { key: 'totalApplications', label: isAr ? 'إجمالي التقديمات' : 'Total Applied', value: autoApplyStats.totalApplications },
//                                         { key: 'todayApplications', label: isAr ? 'اليوم' : 'Today', value: autoApplyStats.todayApplications },
//                                         { key: 'avgMatchScore', label: isAr ? 'متوسط التطابق' : 'Avg Match', value: autoApplyStats.avgMatchScore != null ? `${autoApplyStats.avgMatchScore}%` : null },
//                                       ].filter(s => s.value !== undefined && s.value !== null).map(s => (
//                                         <div key={s.key} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: isAr ? 'right' : 'left' }}>
//                                           <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{s.value}</p>
//                                           <p style={{ margin: 0, fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: font }}>{s.label}</p>
//                                         </div>
//                                       ))}
//                                     </div>
//                                   )}
//                                 </>
//                               )}
//                             </>
//                           ) : (
//                             <div style={{ textAlign: 'center', padding: '20px 0' }}>
//                               <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', fontFamily: font, lineHeight: 1.6 }}>
//                                 {isAr ? 'دع الذكاء الاصطناعي يتقدم نيابةً عنك 3 مرات يومياً على أفضل الوظائف المتوافقة.' : 'Let AI apply on your behalf 3×/day to the best matching jobs.'}
//                               </p>
//                               <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: font }}>
//                                 🚀 {isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
//                               </a>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//                         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'المواقع الجغرافية المرغوبة' : 'Preferred Work Locations'}</span>
//                         </div>
//                         <div style={{ padding: '18px 18px 4px' }}>
//                           <LocationMultiPicker label={isAr ? 'اختر المواقع المرغوبة' : 'Choose desired locations'} value={form.desiredLocations} onChange={v => set('desiredLocations', v)} isAr={isAr} />
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* SAVE */}
//                   <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
//                     <button onClick={handleSave} disabled={saving} style={{
//                       width: '100%', padding: '14px', borderRadius: 12, border: 'none',
//                       background: 'var(--text-primary)', color: 'var(--bg-primary)',
//                       cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14.5, fontWeight: 800, fontFamily: font,
//                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//                       opacity: saving ? .7 : 1, transition: 'opacity .2s',
//                     }}>
//                       {saving
//                         ? <><Loader2 size={17} strokeWidth={2.5} style={{ animation: 'profSpin .7s linear infinite' }} /> {isAr ? 'جاري الحفظ...' : 'Saving...'}</>
//                         : <><Save size={16} strokeWidth={2} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
//                       }
//                     </button>
//                     <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', fontFamily: font }}>
//                       {isAr ? 'ملاحظة: يتم حفظ إعداد التقديم التلقائي فوراً عند التبديل ولا يحتاج لهذا الزر' : 'Note: Auto-Apply saves instantly when toggled and doesn\'t need this button'}
//                     </p>
//                   </div>
//                   <div style={{ height: 16 }} />
//                 </div>
//               </>
//             )}
//           </main>
//         </div>
//       </div>

//       <MobileBottomNav />
//     </>
//   );
// }

'use strict';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, User, Link, Briefcase,
  Pencil, Check, Save, Loader2, X, Search, MapPin, ChevronDown,
  Zap, Star, Lock,
} from 'lucide-react';
import useLang from '../../i18n';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';
import {
  NATIONALITIES, COUNTRIES, CITIES_BY_COUNTRY,
  PHONE_CODES, JOB_TITLES, ALL_LOCATIONS,
} from '../../components/dashboard/locationData';

/* ══════════════════════════════════════════════════════════
   PHONE HELPERS
══════════════════════════════════════════════════════════ */
function parsePhone(full = '') {
  if (!full) return { countryCode: 'JO', number: '' };
  const sorted = [...PHONE_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (full.startsWith(c.dial)) return { countryCode: c.code, number: full.slice(c.dial.length).trim() };
  }
  return { countryCode: 'JO', number: full.replace(/^\+?\d{1,4}\s*/, '') };
}

function PhoneInput({ label, value, onChange, isAr }) {
  const parsed = parsePhone(value);
  const [cc, setCc] = useState(parsed.countryCode || 'JO');
  const [num, setNum] = useState(parsed.number || '');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { const p = parsePhone(value); setCc(p.countryCode||'JO'); setNum(p.number||''); }, [value]);

  const calcPos = useCallback(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom > 320;
    setPos({ top: below ? r.bottom+6 : r.top-326, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPos();
    setTimeout(() => searchRef.current?.focus(), 50);
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => { window.removeEventListener('scroll', calcPos, true); window.removeEventListener('resize', calcPos); };
  }, [open, calcPos]);

  const emit = (code, n) => {
    const c = PHONE_CODES.find(x => x.code === code) || PHONE_CODES[0];
    onChange('phone', n.trim() ? `${c.dial} ${n.trim()}` : '');
  };
  const pick = c => { setCc(c.code); setOpen(false); setQuery(''); emit(c.code, num); setTimeout(() => inputRef.current?.focus(), 60); };
  const onNum = e => { const r = e.target.value.replace(/[^\d\s\-().]/g,''); setNum(r); emit(cc, r); };

  const filtered = PHONE_CODES.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.en.toLowerCase().includes(q) || c.ar.includes(query) || c.dial.includes(q) || c.code.toLowerCase().includes(q);
  }).sort((a,b) => a.code===cc?-1:b.code===cc?1:0);

  const sel = PHONE_CODES.find(c => c.code === cc) || PHONE_CODES[0];

  return (
    <div ref={wrapRef} style={{ marginBottom:14 }}>
      <div style={{ background:'var(--bg-secondary)', border:`1.5px solid ${open?'var(--text-primary)':'var(--border)'}`, borderRadius:10 }}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', padding:'3px 10px 8px', gap:8 }}>
          <button type="button" onClick={() => setOpen(p=>!p)} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:8, background:open?'var(--bg-secondary)':'var(--bg-primary)', border:`1.5px solid ${open?'var(--text-primary)':'var(--border)'}`, cursor:'pointer' }}>
            <span style={{ fontSize:19, lineHeight:1 }}>{sel.flag}</span>
            <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-en)', color:'var(--text-primary)' }}>{sel.dial}</span>
            <ChevronDown size={11} color="var(--text-secondary)" style={{ transform:open?'rotate(180deg)':'none', transition:'transform .18s' }} />
          </button>
          <div style={{ width:1, height:22, background:'var(--border)' }} />
          <input ref={inputRef} type="tel" value={num} onChange={onNum} placeholder={isAr?'رقم الهاتف':'Phone number'} dir="ltr"
            style={{ flex:1, border:'none', outline:'none', background:'transparent', color:'var(--text-primary)', fontSize:13.5, fontFamily:'var(--font-en)' }} />
          {num && <button type="button" onClick={() => { setNum(''); onChange('phone',''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex', padding:2 }}><X size={13}/></button>}
        </div>
      </div>
      {open && (
        <div style={{ position:'fixed', top:pos.top, left:pos.left, width:pos.width||320, maxWidth:'min(360px,90vw)', zIndex:9999999, background:'var(--bg-primary)', border:'1.5px solid var(--border)', borderRadius:13, overflow:'hidden', boxShadow:'0 20px 50px rgba(0,0,0,.35)' }}>
          <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, background:'var(--bg-secondary)' }}>
            <Search size={14} color="var(--text-secondary)" />
            <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Escape'){setOpen(false);setQuery('');} if(e.key==='Enter'&&filtered[0])pick(filtered[0]); }}
              placeholder={isAr?'ابحث عن دولة أو مفتاح...':'Search country or dial code...'}
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit' }} />
            {query && <button type="button" onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:2 }}><X size={12}/></button>}
          </div>
          <div style={{ maxHeight:260, overflowY:'auto' }}>
            {filtered.map((c,i) => {
              const isSel = c.code===cc;
              return (
                <button key={c.code} type="button" onClick={()=>pick(c)} style={{ width:'100%', padding:'10px 14px', border:'none', background:isSel?'rgba(99,102,241,.12)':'transparent', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10, borderBottom:i<filtered.length-1?'1px solid var(--border)':'none', textAlign:isAr?'right':'left' }}
                  onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background='var(--bg-secondary)';}}
                  onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='transparent';}}>
                  <span style={{ fontSize:20, lineHeight:1 }}>{c.flag}</span>
                  <span style={{ flex:1, fontSize:13, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:isSel?700:400 }}>{isAr?c.ar:c.en}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:isSel?'#6366f1':'var(--text-secondary)', fontFamily:'var(--font-en)' }}>{c.dial}</span>
                  {isSel && <Check size={13} color="#6366f1" strokeWidth={2.5}/>}
                </button>
              );
            })}
          </div>
          <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{filtered.length} {isAr?'دولة':'countries'}</span>
            <button type="button" onClick={()=>{setOpen(false);setQuery('');}} style={{ padding:'5px 14px', borderRadius:7, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
              {isAr?'تم':'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEARCHABLE SELECT
══════════════════════════════════════════════════════════ */
function SearchableSelect({ label, value, onChange, options, placeholder, isAr, icon: Icon, disabled=false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top:0, left:0, width:200 });
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 40); } }, [open]);

  const calc = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const dropH = Math.min(options.length*44+80, 300);
    const top = window.innerHeight-r.bottom > dropH ? r.bottom+6 : r.top-dropH-6;
    setCoords({ top, left:r.left, width:r.width });
  };

  useEffect(() => {
    if (!open) return;
    calc();
    window.addEventListener('scroll', calc, true);
    window.addEventListener('resize', calc);
    return () => { window.removeEventListener('scroll', calc, true); window.removeEventListener('resize', calc); };
  }, [open, options.length]);

  const filtered = options.filter(o => {
    const lbl = typeof o==='string' ? o : `${o.en} ${o.ar||''} ${o.flag||''}`;
    return lbl.toLowerCase().includes(query.toLowerCase());
  });

  const getLabel = o => typeof o==='string' ? o : (isAr&&o.ar ? `${o.flag||''} ${o.ar}` : `${o.flag||''} ${o.en}`);
  const displayValue = value ? (() => {
    const found = options.find(o => (typeof o==='string'?o:o.en)===value || (o.ar&&o.ar===value));
    return found ? getLabel(found) : value;
  })() : '';
  const select = o => { onChange(typeof o==='string'?o:o.en); setOpen(false); setQuery(''); };

  return (
    <div ref={wrapRef} style={{ marginBottom:14 }}>
      <button type="button" disabled={disabled} onClick={() => { if(!disabled){calc();setOpen(p=>!p);} }} style={{ width:'100%', textAlign:isAr?'right':'left', background:'var(--bg-secondary)', border:`1.5px solid ${open?'var(--text-primary)':'var(--border)'}`, borderRadius:10, padding:0, cursor:disabled?'not-allowed':'pointer', opacity:disabled?.55:1, fontFamily:'inherit' }}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 12px 9px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, minWidth:0 }}>
            {Icon && <Icon size={13} color={value?'var(--text-primary)':'var(--text-secondary)'} />}
            <span style={{ fontSize:13, color:value?'var(--text-primary)':'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayValue||placeholder}</span>
          </div>
          <ChevronDown size={14} color="var(--text-secondary)" style={{ flexShrink:0, transform:open?'rotate(180deg)':'none', transition:'transform .2s' }} />
        </div>
      </button>
      {open && (
        <div style={{ position:'fixed', top:coords.top, left:coords.left, width:coords.width, zIndex:9999, background:'var(--bg-primary)', border:'1.5px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'0 16px 40px rgba(0,0,0,.28)', animation:'ssOpen .14s ease' }}>
          <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, background:'var(--bg-secondary)' }}>
            <Search size={14} color="var(--text-secondary)" />
            <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}
              placeholder={isAr?'ابحث...':'Search...'} dir={isAr?'rtl':'ltr'}
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit' }} />
            {query && <button type="button" onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:2 }}><X size={12}/></button>}
          </div>
          <div style={{ maxHeight:220, overflowY:'auto' }}>
            {filtered.length===0
              ? <div style={{ padding:'16px', textAlign:'center', fontSize:12.5, color:'var(--text-secondary)' }}>{isAr?'لا توجد نتائج':'No results'}</div>
              : filtered.map((o,i) => {
                const isSel = value===(typeof o==='string'?o:o.en)||(o.ar&&value===o.ar);
                return (
                  <button key={i} type="button" onClick={()=>select(o)} style={{ width:'100%', padding:'10px 14px', border:'none', background:isSel?'var(--bg-secondary)':'transparent', color:'var(--text-primary)', cursor:'pointer', fontFamily:'inherit', fontSize:13, textAlign:isAr?'right':'left', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, borderBottom:i<filtered.length-1?'1px solid var(--border)':'none', transition:'background .12s' }}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background='var(--bg-secondary)';}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='transparent';}}>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{getLabel(o)}</span>
                    {isSel && <Check size={14} color="var(--text-primary)" strokeWidth={2.5}/>}
                  </button>
                );
              })}
          </div>
          {value && (
            <div style={{ borderTop:'1px solid var(--border)', padding:'6px 12px' }}>
              <button type="button" onClick={()=>{onChange('');setOpen(false);}} style={{ width:'100%', padding:'7px 8px', border:'none', background:'transparent', cursor:'pointer', fontSize:12, color:'#EF4444', fontFamily:'inherit', borderRadius:7, display:'flex', alignItems:'center', gap:6 }}>
                <X size={11}/> {isAr?'مسح':'Clear'}
              </button>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes ssOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   JOB TITLE COMBOBOX
══════════════════════════════════════════════════════════ */
function JobTitleCombobox({ label, value, onChange, isAr }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value||'');
  const [coords, setCoords] = useState({ top:0, left:0, width:300 });
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value||''); }, [value]);

  useEffect(() => {
    const h = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        if (!query.trim()) onChange(''); else onChange(query.trim());
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [query]);

  const calc = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const top = window.innerHeight-r.bottom > 290 ? r.bottom+6 : r.top-296;
    setCoords({ top, left:r.left, width:r.width });
  };

  useEffect(() => {
    if (!open) return;
    calc();
    window.addEventListener('scroll', calc, true);
    window.addEventListener('resize', calc);
    return () => { window.removeEventListener('scroll', calc, true); window.removeEventListener('resize', calc); };
  }, [open]);

  const filtered = query ? JOB_TITLES.filter(t=>t.toLowerCase().includes(query.toLowerCase())).slice(0,14) : JOB_TITLES.slice(0,14);
  const select = t => { setQuery(t); onChange(t); setOpen(false); };

  return (
    <div ref={wrapRef} style={{ marginBottom:14 }}>
      <div style={{ background:'var(--bg-secondary)', border:`1.5px solid ${open?'var(--text-primary)':'var(--border)'}`, borderRadius:10 }}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', padding:'0 12px 9px', gap:7 }}>
          <Briefcase size={13} color={value?'var(--text-primary)':'var(--text-secondary)'} />
          <input value={query} dir={isAr?'rtl':'ltr'} placeholder={isAr?'اكتب أو ابحث عن مسمى وظيفي...':'Type or search a job title...'}
            onChange={e=>{setQuery(e.target.value);onChange(e.target.value);if(!open){calc();setOpen(true);}}}
            onFocus={()=>{calc();setOpen(true);}}
            onKeyDown={e=>{if(e.key==='Escape')setOpen(false);if(e.key==='Enter'&&filtered[0])select(filtered[0]);}}
            style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit' }} />
          {query && <button type="button" onClick={()=>{setQuery('');onChange('');}} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:2 }}><X size={12}/></button>}
          <ChevronDown size={13} color="var(--text-secondary)" style={{ transform:open?'rotate(180deg)':'none', transition:'transform .2s' }} />
        </div>
      </div>
      {open && (
        <div style={{ position:'fixed', top:coords.top, left:coords.left, width:coords.width, zIndex:9999, background:'var(--bg-primary)', border:'1.5px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'0 16px 40px rgba(0,0,0,.28)', animation:'ssOpen .14s ease' }}>
          <div style={{ maxHeight:240, overflowY:'auto' }}>
            {filtered.length===0
              ? <div style={{ padding:'14px', textAlign:'center', fontSize:12.5, color:'var(--text-secondary)' }}>{isAr?'لا توجد نتائج · سيُحفظ ما كتبته':'No matches · your text will be saved'}</div>
              : filtered.map((t,i) => {
                const isSel = value===t;
                return (
                  <button key={i} type="button" onClick={()=>select(t)} style={{ width:'100%', padding:'10px 14px', border:'none', background:isSel?'var(--bg-secondary)':'transparent', color:'var(--text-primary)', cursor:'pointer', fontFamily:'inherit', fontSize:13, textAlign:isAr?'right':'left', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:i<filtered.length-1?'1px solid var(--border)':'none', transition:'background .12s' }}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background='var(--bg-secondary)';}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background='transparent';}}>
                    {t}
                    {isSel && <Check size={14} color="var(--text-primary)" strokeWidth={2.5}/>}
                  </button>
                );
              })}
          </div>
          <div style={{ padding:'8px 14px', borderTop:'1px solid var(--border)', background:'var(--bg-secondary)' }}>
            <p style={{ margin:0, fontSize:11, color:'var(--text-secondary)' }}>{isAr?'💡 يمكنك كتابة أي مسمى وظيفي':'💡 You can type any custom title'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LOCATION MULTI-PICKER
══════════════════════════════════════════════════════════ */
function LocationMultiPicker({ label, value=[], onChange, isAr }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top:0, left:0, width:300 });
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const calc = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const top = window.innerHeight-r.bottom > 340 ? r.bottom+6 : r.top-346;
    setCoords({ top, left:r.left, width:r.width });
  };

  useEffect(() => {
    if (!open) return;
    calc();
    setTimeout(()=>searchRef.current?.focus(),40);
    window.addEventListener('scroll', calc, true);
    window.addEventListener('resize', calc);
    return () => { window.removeEventListener('scroll', calc, true); window.removeEventListener('resize', calc); };
  }, [open]);

  const filtered = query.trim()
    ? ALL_LOCATIONS.filter(l => { const q=query.toLowerCase(); return l.en.toLowerCase().includes(q)||(l.ar&&l.ar.includes(query)); }).slice(0,20)
    : ALL_LOCATIONS.slice(0,20);

  const isSel = loc => value.includes(loc.key);
  const toggle = loc => onChange(isSel(loc) ? value.filter(v=>v!==loc.key) : [...value, loc.key]);
  const remove = key => onChange(value.filter(v=>v!==key));
  const getDisplay = key => {
    const f = ALL_LOCATIONS.find(l=>l.key===key);
    return f ? { label:isAr&&f.ar?f.ar:f.en, icon:f.icon } : { label:key, icon:'📍' };
  };

  const modes = filtered.filter(l=>l.type==='mode');
  const countries = filtered.filter(l=>l.type==='country');
  const cities = filtered.filter(l=>l.type==='city');

  const renderGroup = (items, groupLabel) => {
    if (!items.length) return null;
    return (
      <>
        <div style={{ padding:'5px 14px 4px', fontSize:10.5, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.07em', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>{groupLabel}</div>
        {items.map(loc => {
          const s = isSel(loc);
          return (
            <button key={loc.key} type="button" onClick={()=>toggle(loc)} style={{ width:'100%', padding:'9px 14px', border:'none', background:s?'var(--bg-secondary)':'transparent', color:'var(--text-primary)', cursor:'pointer', fontFamily:'inherit', fontSize:13, textAlign:isAr?'right':'left', display:'flex', alignItems:'center', gap:9, borderBottom:'1px solid var(--border)', transition:'background .12s' }}
              onMouseEnter={e=>{if(!s)e.currentTarget.style.background='var(--bg-secondary)';}}
              onMouseLeave={e=>{if(!s)e.currentTarget.style.background='transparent';}}>
              <span style={{ fontSize:16 }}>{loc.icon}</span>
              <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{isAr&&loc.ar?loc.ar:loc.en}</span>
              {s ? <Check size={14} color="var(--text-primary)" strokeWidth={2.5}/> : <div style={{ width:14, height:14, borderRadius:4, border:'1.5px solid var(--border)' }}/>}
            </button>
          );
        })}
      </>
    );
  };

  return (
    <div ref={wrapRef} style={{ marginBottom:14 }}>
      <p style={{ fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', margin:'0 0 8px' }}>{label}</p>
      {value.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
          {value.map(key => {
            const { label:lbl, icon } = getDisplay(key);
            return (
              <div key={key} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px 4px 8px', borderRadius:99, background:'var(--bg-secondary)', border:'1px solid var(--border)', fontSize:12.5, fontWeight:600 }}>
                <span style={{ fontSize:14 }}>{icon}</span><span>{lbl}</span>
                <button type="button" onClick={()=>remove(key)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center', padding:'0 0 0 2px', opacity:.6 }}><X size={11} strokeWidth={2.5}/></button>
              </div>
            );
          })}
          <button type="button" onClick={()=>onChange([])} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:99, background:'transparent', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:11.5, cursor:'pointer', fontFamily:'inherit' }}>
            <X size={10}/> {isAr?'مسح الكل':'Clear all'}
          </button>
        </div>
      )}
      <button type="button" onClick={()=>{calc();setOpen(p=>!p);}} style={{ width:'100%', textAlign:isAr?'right':'left', background:'var(--bg-secondary)', border:`1.5px solid ${open?'var(--text-primary)':'var(--border)'}`, borderRadius:10, padding:'9px 13px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
        <MapPin size={14} color="var(--text-secondary)"/>
        <span style={{ flex:1, fontSize:13, color:'var(--text-secondary)' }}>
          {value.length ? (isAr?`${value.length} موقع مختار`:`${value.length} location${value.length>1?'s':''} selected`) : (isAr?'اختر المواقع المرغوبة...':'Choose desired locations...')}
        </span>
        <ChevronDown size={13} color="var(--text-secondary)" style={{ transform:open?'rotate(180deg)':'none', transition:'transform .2s' }}/>
      </button>
      {open && (
        <div style={{ position:'fixed', top:coords.top, left:coords.left, width:coords.width, zIndex:9999, background:'var(--bg-primary)', border:'1.5px solid var(--border)', borderRadius:13, overflow:'hidden', boxShadow:'0 16px 44px rgba(0,0,0,.28)', animation:'ssOpen .14s ease' }}>
          <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, background:'var(--bg-secondary)' }}>
            <Search size={14} color="var(--text-secondary)"/>
            <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}
              placeholder={isAr?'ابحث عن مدينة أو دولة...':'Search city or country...'} dir={isAr?'rtl':'ltr'}
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit' }}/>
            {query && <button type="button" onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:2 }}><X size={12}/></button>}
          </div>
          <div style={{ maxHeight:240, overflowY:'auto' }}>
            {!query && renderGroup(modes, isAr?'نوع العمل':'Work Mode')}
            {!query && renderGroup(countries, isAr?'الدول':'Countries')}
            {renderGroup(query?filtered:cities, isAr?(query?'النتائج':'المدن'):(query?'Results':'Cities'))}
            {filtered.length===0 && <div style={{ padding:'20px', textAlign:'center', fontSize:12.5, color:'var(--text-secondary)' }}>{isAr?'لا توجد نتائج':'No results found'}</div>}
          </div>
          <div style={{ padding:'8px 14px', borderTop:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11.5, color:'var(--text-secondary)' }}>{value.length>0?(isAr?`${value.length} مختار`:`${value.length} selected`):(isAr?'اختر أكثر من موقع':'Pick multiple')}</span>
            <button type="button" onClick={()=>setOpen(false)} style={{ padding:'5px 14px', borderRadius:8, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:12.5, fontWeight:700, fontFamily:'inherit' }}>
              {isAr?'تم':'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FIELD + SELECT HELPERS
══════════════════════════════════════════════════════════ */
function Field({ label, name, type='text', as='input', rows=3, placeholder='', value, onChange }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', transition:'border-color .2s' }}
        onFocusCapture={e=>{e.currentTarget.style.borderColor='var(--text-primary)';}}
        onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';}}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
        {as==='textarea'
          ? <textarea rows={rows} value={value||''} onChange={e=>onChange(name,e.target.value)} placeholder={placeholder} style={{ display:'block', width:'100%', padding:'2px 14px 9px', background:'transparent', border:'none', outline:'none', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}/>
          : <input type={type} value={value||''} onChange={e=>onChange(name,e.target.value)} placeholder={placeholder} style={{ display:'block', width:'100%', padding:'2px 14px 9px', background:'transparent', border:'none', outline:'none', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit', boxSizing:'border-box' }}/>
        }
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', transition:'border-color .2s' }}
        onFocusCapture={e=>{e.currentTarget.style.borderColor='var(--text-primary)';}}
        onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';}}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
        <select value={value} onChange={onChange} style={{ display:'block', width:'100%', padding:'2px 14px 9px', background:'transparent', border:'none', outline:'none', fontSize:13, color:'var(--text-primary)', fontFamily:'inherit', cursor:'pointer', boxSizing:'border-box' }}>
          {children}
        </select>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AVATAR MODAL
══════════════════════════════════════════════════════════ */
function AvatarModal({ onClose, onSelect, currentUrl, isAr }) {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(null);

  useEffect(() => {
    api.get('/users/presets/avatars')
      .then(({ data }) => setPresets(data.data.avatars))
      .catch(() => toast.error(isAr?'فشل تحميل الصور':'Failed to load avatars'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async preset => {
    setPicking(preset.id);
    try {
      // ✅ sends avatarUrl — matches controller + updated validation
      await api.patch('/users/me/avatar/preset', { avatarUrl: preset.url });
      onSelect(preset.url);
      toast.success(isAr?'تم تحديث الصورة ✓':'Avatar updated ✓');
      onClose();
    } catch {
      toast.error(isAr?'فشل تحديث الصورة':'Failed to update avatar');
    } finally { setPicking(null); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:18, width:'100%', maxWidth:480, padding:24, animation:'profFadeUp 0.25s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontSize:15, fontWeight:800, margin:0 }}>{isAr?'اختر صورة شخصية':'Choose Avatar'}</h2>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'var(--bg-secondary)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} color="var(--text-primary)" strokeWidth={2.5}/>
          </button>
        </div>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ aspectRatio:'1', borderRadius:12, background:'var(--border)', animation:'profPulse 1.5s ease-in-out infinite' }}/>)}
          </div>
        ) : presets.length===0 ? (
          <p style={{ textAlign:'center', color:'var(--text-secondary)', fontSize:13, padding:'20px 0' }}>{isAr?'لا توجد صور متاحة':'No avatars available'}</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(presets.length,4)},1fr)`, gap:12 }}>
            {presets.map(preset => {
              const isActive = currentUrl===preset.url;
              const isPicking = picking===preset.id;
              return (
                <button key={preset.id} onClick={()=>!picking&&handleSelect(preset)} disabled={!!picking}
                  style={{ padding:4, borderRadius:12, cursor:picking?'not-allowed':'pointer', border:`${isActive?'2.5px':'1.5px'} solid ${isActive?'var(--text-primary)':'var(--border)'}`, background:isActive?'var(--bg-secondary)':'transparent', opacity:picking&&!isPicking?.5:1, transition:'all .18s', position:'relative', fontFamily:'inherit' }}>
                  <div style={{ position:'relative' }}>
                    <img src={preset.url} alt="" style={{ width:'100%', aspectRatio:'1', borderRadius:8, objectFit:'cover', display:'block', opacity:isPicking?.4:1 }}/>
                    {isPicking && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><Loader2 size={22} color="var(--text-primary)" style={{ animation:'profSpin 0.8s linear infinite' }}/></div>}
                  </div>
                  {isActive && !isPicking && (
                    <div style={{ position:'absolute', top:6, insetInlineEnd:6, width:20, height:20, borderRadius:'50%', background:'var(--text-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Check size={11} color="var(--bg-primary)" strokeWidth={3}/>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { lang }         = useLang();
  const { user, updateUser } = useAuthStore();
  const isAr             = lang==='ar';
  const font             = isAr?'var(--font-ar)':'var(--font-en)';
  const isPro            = ['pro','elite'].includes(user?.planKey);
  const avatarRef        = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  // ── Profile form (never contains autoApplyEnabled) ────────
  const [form, setForm] = useState({
    fullName:'', phone:'', headline:'', bio:'',
    locationCountry:'', locationCity:'', dateOfBirth:'', gender:'', nationality:'',
    linkedinUrl:'', portfolioUrl:'',
    desiredJobTitle:'', desiredSalaryMin:'', desiredSalaryMax:'',
    discoverable:true,
    desiredJobTypes:[], desiredIndustries:[], desiredLocations:[],
  });
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [avatarUp,  setAvatarUp]  = useState(false);
  const [preview,   setPreview]   = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // ── Auto-Apply — own state, own endpoints ─────────────────
  const [aa, setAa]         = useState({ autoApplyEnabled: user?.autoApplyEnabled ?? false });
  const [aaLoading, setAaLoading] = useState(true);
  const [aaSaving, setAaSaving]   = useState(false);
  const [aaStats, setAaStats]     = useState(null);

  // ── Fetch profile ─────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      const u = data.data.user;
      setAvatarSrc(u.avatarUrl||null);
      setForm({
        fullName:         u.fullName         ||'',
        phone:            u.phone            ||'',
        headline:         u.headline         ||'',
        bio:              u.bio              ||'',
        locationCountry:  u.locationCountry  ||'',
        locationCity:     u.locationCity     ||'',
        dateOfBirth:      u.dateOfBirth?.split?.('T')[0]||'',
        gender:           u.gender           ||'',
        nationality:      u.nationality      ||'',
        linkedinUrl:      u.linkedinUrl      ||'',
        portfolioUrl:     u.portfolioUrl     ||'',
        desiredJobTitle:  u.desiredJobTitle  ||'',
        desiredSalaryMin: u.desiredSalaryMin ||'',
        desiredSalaryMax: u.desiredSalaryMax ||'',
        discoverable:     u.discoverable     ??true,
        desiredJobTypes:  u.desiredJobTypes  ||[],
        desiredIndustries:u.desiredIndustries||[],
        desiredLocations: u.desiredLocations ||[],
      });
    } catch { toast.error(isAr?'فشل تحميل الملف الشخصي':'Failed to load profile'); }
    finally { setLoading(false); }
  }, [isAr]);

  // ── Fetch Auto-Apply settings + stats ────────────────────
  const fetchAA = useCallback(async () => {
    try {
      const { data } = await api.get('/auto-apply/settings');
      if (data?.data) { const d=data.data; setAa(p=>({...p,...d, autoApplyEnabled: d.autoApplyEnabled ?? d.enabled ?? false})); }
    } catch { /* non-fatal */ }
    finally { setAaLoading(false); }
  }, []);

  const fetchAAStats = useCallback(async () => {
    try {
      const { data } = await api.get('/auto-apply/stats');
      if (data?.data) setAaStats(data.data);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { fetchAA(); fetchAAStats(); }, [fetchAA, fetchAAStats]);

  const set = (k, v) => setForm(p=>({...p,[k]:v}));

  // ── Auto-Apply toggle — POST /auto-apply/settings ─────────
  const toggleAA = async () => {
    if (!isPro || aaSaving) return;
    const next = !aa.autoApplyEnabled;
    setAaSaving(true);
    setAa(p=>({...p, autoApplyEnabled:next})); // optimistic
    try {
      const { data } = await api.post('/auto-apply/settings', { enabled:next, autoApplyEnabled:next });
      const confirmed = data?.data?.autoApplyEnabled ?? data?.data?.enabled ?? next;
      setAa(p=>({...p,...data?.data, autoApplyEnabled:confirmed}));
      updateUser({ autoApplyEnabled:confirmed });
      toast.success(confirmed
        ? (isAr?'تم تفعيل التقديم التلقائي ✓':'Auto-Apply enabled ✓')
        : (isAr?'تم إيقاف التقديم التلقائي':'Auto-Apply disabled'));
    } catch (err) {
      setAa(p=>({...p, autoApplyEnabled:!next})); // revert
      toast.error(err.response?.data?.message||(isAr?'فشل تحديث إعدادات التقديم التلقائي':'Failed to update Auto-Apply'));
    } finally { setAaSaving(false); }
  };

  // ── Save profile — strips empty strings, never sends autoApplyEnabled ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k,v]) => {
        if (Array.isArray(v)) { payload[k]=v; return; }
        if (v===undefined||v===null) return;
        if (typeof v==='string'&&v.trim()==='') return;
        payload[k]=v;
      });
      if (Object.keys(payload).length===0) payload.discoverable = form.discoverable??true;
      const { data } = await api.patch('/users/me', payload);
      updateUser(data.data.user);
      toast.success(isAr?'تم حفظ الملف الشخصي ✓':'Profile saved ✓');
    } catch (err) {
      toast.error(err.response?.data?.message||(isAr?'فشل الحفظ':'Save failed'));
    } finally { setSaving(false); }
  };

  // ── Avatar upload ─────────────────────────────────────────
  const handleAvatarPick = file => {
    if (!file) return;
    if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) { toast.error(isAr?'JPEG/PNG/WebP فقط':'JPEG/PNG/WebP only'); return; }
    if (file.size>5*1024*1024) { toast.error(isAr?'الحد الأقصى 5MB':'Max 5MB'); return; }
    setPreview({ file, url:URL.createObjectURL(file) });
  };

  const handleAvatarUpload = async () => {
    if (!preview) return;
    setAvatarUp(true);
    const fd = new FormData();
    fd.append('avatar', preview.file);
    try {
      const { data } = await api.post('/users/me/avatar', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setAvatarSrc(data.data.avatarUrl);
      setPreview(null);
      updateUser({ avatarUrl:data.data.avatarUrl, avatarKey:data.data.avatarKey||null });
      toast.success(isAr?'تم رفع الصورة بنجاح ✓':'Photo uploaded ✓');
    } catch (err) {
      toast.error(err.response?.data?.message||(isAr?'فشل رفع الصورة':'Upload failed'));
    } finally { setAvatarUp(false); }
  };

  const font2 = font;
  const initials = (form.fullName||user?.fullName||'U').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()||'U';

  const JOB_TYPES = [
    { key:'full_time',  ar:'دوام كامل', en:'Full-time'  },
    { key:'part_time',  ar:'دوام جزئي', en:'Part-time'  },
    { key:'freelance',  ar:'مستقل',      en:'Freelance'  },
    { key:'internship', ar:'تدريب',      en:'Internship' },
    { key:'remote',     ar:'عن بُعد',    en:'Remote'     },
  ];
  const toggleJobType = k => {
    const arr = form.desiredJobTypes||[];
    set('desiredJobTypes', arr.includes(k)?arr.filter(x=>x!==k):[...arr,k]);
  };

  const completionFields = [
    {done:!!form.fullName},{done:!!form.headline},{done:!!form.bio},
    {done:!!form.phone},{done:!!form.locationCountry},{done:!!form.linkedinUrl},
    {done:!!form.desiredJobTitle},{done:!!(avatarSrc||preview)},
  ];
  const completionPct = Math.round((completionFields.filter(f=>f.done).length/completionFields.length)*100);

  // Real limits from stats (no hardcoded numbers)
  const dailyLimit     = aaStats?.dailyLimit     ?? null;
  const matchThreshold = aaStats?.matchThreshold ?? null;

  const TABS = [
    { key:'personal', ar:'الشخصية', en:'Personal', icon:User },
    { key:'social',   ar:'الروابط', en:'Social',   icon:Link },
    { key:'career',   ar:'المهنة',  en:'Career',   icon:Briefcase },
  ];

  return (
    <>
      <style>{`
        @keyframes profSpin    { to{transform:rotate(360deg);} }
        @keyframes profPulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes profSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes profFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        *{box-sizing:border-box;} body{margin:0;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px;}
        @media(max-width:1024px){.prof-main{padding-bottom:80px!important}}
        @media(max-width:580px){.prof-g2{grid-template-columns:1fr!important}}
      `}</style>

      {showModal && (
        <AvatarModal currentUrl={avatarSrc} onClose={()=>setShowModal(false)}
          onSelect={url=>{setAvatarSrc(url);setPreview(null);updateUser({avatarUrl:url,avatarKey:null});}}
          isAr={isAr}/>
      )}

      <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)', color:'var(--text-primary)', fontFamily:font, direction:isAr?'rtl':'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
          <MobileTopBar title={isAr?'الملف الشخصي':'Profile'}/>
          <main className="prof-main" style={{ flex:1, overflowY:'auto', background:'var(--bg-secondary)' }}>
            {loading ? (
              <div style={{ padding:'clamp(16px,3vw,28px)', maxWidth:720, margin:'0 auto' }}>
                {[88,56,56,56,120,56].map((h,i)=>(
                  <div key={i} style={{ height:h, borderRadius:12, background:'var(--bg-primary)', border:'1px solid var(--border)', marginBottom:12, animation:'profPulse 1.5s ease-in-out infinite' }}/>
                ))}
              </div>
            ) : (
              <>
                {/* ── HEADER ── */}
                <div style={{ background:'var(--bg-primary)', borderBottom:'1px solid var(--border)', padding:'clamp(16px,3vw,28px) clamp(16px,3vw,28px) 0' }}>
                  <div style={{ maxWidth:720, margin:'0 auto' }}>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:20, flexWrap:'wrap', marginBottom:20 }}>

                      {/* Avatar */}
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:96, height:96, borderRadius:'50%', border:'3px solid var(--bg-secondary)', overflow:'hidden', background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 1px var(--border)' }}>
                          {avatarUp
                            ? <Loader2 size={28} color="var(--text-secondary)" style={{ animation:'profSpin .8s linear infinite' }}/>
                            : preview
                              ? <img src={preview.url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                              : avatarSrc
                                ? <img src={avatarSrc} alt="" onError={e=>{e.currentTarget.style.display='none';}} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                                : <span style={{ fontSize:34, fontWeight:900, fontFamily:'var(--font-en)' }}>{initials}</span>
                          }
                        </div>
                        <button onClick={()=>setShowModal(true)} style={{ position:'absolute', bottom:1, insetInlineEnd:1, width:28, height:28, borderRadius:'50%', background:'var(--text-primary)', border:'2.5px solid var(--bg-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Camera size={13} color="#444040" strokeWidth={3.2}/>
                        </button>
                      </div>

                      {/* Name + Auto-Apply pill */}
                      <div style={{ flex:1, minWidth:200, paddingBottom:4 }}>
                        <h1 style={{ fontSize:'clamp(1.1rem,2.5vw,1.4rem)', fontWeight:900, margin:'0 0 3px', fontFamily:font }}>
                          {form.fullName||user?.fullName||(isAr?'اسمك':'Your Name')}
                        </h1>
                        <p style={{ fontSize:13.5, color:'var(--text-secondary)', margin:'0 0 10px', fontFamily:font }}>
                          {form.headline||(isAr?'أضف عنوانك المهني':'Add your headline')}
                        </p>

                        {/* ✅ Auto-Apply quick toggle */}
                        {isPro ? (
                          <button onClick={toggleAA} disabled={aaLoading||aaSaving}
                            style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:99, cursor:(aaLoading||aaSaving)?'not-allowed':'pointer', border:`1.5px solid ${aa.autoApplyEnabled?'rgba(139,92,246,.4)':'var(--border)'}`, background:aa.autoApplyEnabled?'rgba(139,92,246,.1)':'var(--bg-secondary)', color:aa.autoApplyEnabled?'#8B5CF6':'var(--text-secondary)', fontSize:12, fontWeight:700, fontFamily:font, opacity:aaLoading?.6:1 }}>
                            {aaSaving ? <Loader2 size={9} style={{ animation:'profSpin .7s linear infinite' }}/> : <Zap size={11}/>}
                            {aa.autoApplyEnabled ? (isAr?'⚡ Auto-Apply نشط':'⚡ Auto-Apply ON') : (isAr?'Auto-Apply متوقف':'Auto-Apply off')}
                          </button>
                        ) : (
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:99, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-secondary)', fontSize:12, fontWeight:600, fontFamily:font, opacity:.6 }}>
                            <Lock size={11}/> {isAr?'Auto-Apply (Pro)':'Auto-Apply (Pro)'}
                          </span>
                        )}
                      </div>

                      {/* Upload photo */}
                      <div style={{ paddingBottom:4, display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                        <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={e=>handleAvatarPick(e.target.files[0])}/>
                        {preview ? (
                          <div style={{ display:'flex', gap:7 }}>
                            <button onClick={handleAvatarUpload} disabled={avatarUp} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:font }}>
                              {avatarUp ? <Loader2 size={14} style={{ animation:'profSpin .7s linear infinite' }}/> : <Check size={14} strokeWidth={2.5}/>}
                              {isAr?'رفع الصورة':'Upload'}
                            </button>
                            <button onClick={()=>setPreview(null)} style={{ padding:'8px 12px', borderRadius:9, border:'1.5px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, fontFamily:font }}>
                              {isAr?'إلغاء':'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button onClick={()=>avatarRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, border:'1.5px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:font, transition:'all .18s' }}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--text-primary)';e.currentTarget.style.color='var(--text-primary)';}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';}}>
                            <Pencil size={13} strokeWidth={1.8}/>
                            {isAr?'رفع صورة':'Upload Photo'}
                          </button>
                        )}
                        <p style={{ fontSize:10.5, color:'var(--text-secondary)', margin:0, textAlign:'center', fontFamily:font }}>JPG, PNG, WebP · 5MB</p>
                      </div>
                    </div>

                    {/* Completion bar */}
                    <div style={{ padding:'14px 0 0', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, fontFamily:font }}>{isAr?'اكتمال الملف':'Profile completion'}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:completionPct>=80?'#22C55E':completionPct>=50?'#F59E0B':'var(--text-secondary)', fontFamily:'var(--font-en)' }}>{completionPct}%</span>
                        </div>
                        <div style={{ height:4, background:'var(--bg-secondary)', borderRadius:99, overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:99, transition:'width .6s cubic-bezier(.34,1.56,.64,1)', width:`${completionPct}%`, background:completionPct>=80?'#22C55E':completionPct>=50?'#F59E0B':'var(--border)' }}/>
                        </div>
                      </div>
                      {completionPct<100 && (
                        <span style={{ fontSize:11.5, color:'var(--text-secondary)', flexShrink:0, fontFamily:font }}>
                          {completionFields.filter(f=>!f.done).length} {isAr?'خطوات':'left'}
                        </span>
                      )}
                    </div>

                    {/* Tabs */}
                    <div style={{ display:'flex', marginTop:16 }}>
                      {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{ display:'flex', alignItems:'center', gap:7, padding:'11px 20px', border:'none', background:'transparent', cursor:'pointer', fontFamily:font, fontSize:13.5, fontWeight:activeTab===tab.key?700:500, color:activeTab===tab.key?'var(--text-primary)':'var(--text-secondary)', borderBottom:`2.5px solid ${activeTab===tab.key?'var(--text-primary)':'transparent'}`, marginBottom:-1 }}>
                            <Icon size={16}/> {isAr?tab.ar:tab.en}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── TAB CONTENT ── */}
                <div style={{ padding:'clamp(16px,3vw,28px)', maxWidth:720, margin:'0 auto', animation:'profSlideIn .25s ease' }} key={activeTab}>

                  {/* PERSONAL */}
                  {activeTab==='personal' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'المعلومات الأساسية':'Basic Information'}</span>
                        </div>
                        <div style={{ padding:'18px 18px 4px' }}>
                          <Field label={isAr?'الاسم الكامل':'Full Name'} name="fullName" value={form.fullName} onChange={set} placeholder={isAr?'محمد العمري':'Mohammed Al Omari'}/>
                          <Field label={isAr?'العنوان المهني':'Professional Headline'} name="headline" value={form.headline} onChange={set} placeholder={isAr?'مطور واجهات أمامية · 5 سنوات خبرة':'Frontend Developer · 5 years'}/>
                          <Field label={isAr?'نبذة شخصية':'Bio'} name="bio" as="textarea" rows={4} value={form.bio} onChange={set} placeholder={isAr?'أخبر أصحاب العمل عن نفسك...':'Tell employers about yourself...'}/>
                        </div>
                      </div>

                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'بيانات التواصل':'Contact Details'}</span>
                        </div>
                        <div style={{ padding:'18px 18px 4px' }}>
                          <div className="prof-g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <PhoneInput label={isAr?'رقم الهاتف':'Phone Number'} value={form.phone} onChange={set} isAr={isAr}/>
                            <SearchableSelect label={isAr?'الجنسية':'Nationality'} value={form.nationality} onChange={v=>set('nationality',v)} options={NATIONALITIES} placeholder={isAr?'اختر الجنسية':'Select nationality'} isAr={isAr}/>
                          </div>
                          <div className="prof-g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <SearchableSelect label={isAr?'الدولة':'Country'} value={form.locationCountry} onChange={v=>{set('locationCountry',v);set('locationCity','');}} options={COUNTRIES} placeholder={isAr?'اختر الدولة':'Select country'} isAr={isAr} icon={MapPin}/>
                            <SearchableSelect label={isAr?'المدينة':'City'} value={form.locationCity} onChange={v=>set('locationCity',v)}
                              options={(() => { const c=COUNTRIES.find(x=>x.en===form.locationCountry); return c?(CITIES_BY_COUNTRY[c.code]||[]):Object.values(CITIES_BY_COUNTRY).flat(); })()}
                              placeholder={isAr?'اختر المدينة':'Select city'} isAr={isAr} icon={MapPin}/>
                          </div>
                        </div>
                      </div>

                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'البيانات الشخصية':'Personal Details'}</span>
                        </div>
                        <div style={{ padding:'18px 18px 4px' }}>
                          <div className="prof-g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <SelectField label={isAr?'الجنس':'Gender'} value={form.gender} onChange={e=>set('gender',e.target.value)}>
                              <option value="">{isAr?'— اختر —':'— Select —'}</option>
                              <option value="male">{isAr?'ذكر':'Male'}</option>
                              <option value="female">{isAr?'أنثى':'Female'}</option>
                              <option value="prefer_not">{isAr?'أفضل عدم الذكر':'Prefer not to say'}</option>
                            </SelectField>
                            <Field label={isAr?'تاريخ الميلاد':'Date of Birth'} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SOCIAL */}
                  {activeTab==='social' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'الروابط الاجتماعية والمهنية':'Social & Professional Links'}</span>
                        </div>
                        <div style={{ padding:'18px 18px 4px' }}>
                          {[
                            { key:'linkedinUrl', label:'LinkedIn', icon:'🔗', placeholder:'linkedin.com/in/username' },
                            { key:'portfolioUrl', label:isAr?'الموقع الشخصي / Portfolio':'Portfolio / Website', icon:'🌐', placeholder:'myportfolio.com' },
                          ].map(({key,label,icon,placeholder}) => (
                            <div key={key} style={{ marginBottom:14 }}>
                              <div style={{ background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:10, overflow:'hidden', transition:'border-color .2s' }}
                                onFocusCapture={e=>{e.currentTarget.style.borderColor='var(--text-primary)';}}
                                onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';}}>
                                <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
                                <div style={{ display:'flex', alignItems:'center', padding:'2px 12px 9px', gap:8 }}>
                                  <span style={{ fontSize:15 }}>{icon}</span>
                                  <input type="url" value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder} dir="ltr"
                                    style={{ flex:1, border:'none', outline:'none', background:'transparent', color:'var(--text-primary)', fontSize:13, fontFamily:'var(--font-en)' }}/>
                                  {form[key] && (
                                    <a href={form[key].startsWith('http')?form[key]:`https://${form[key]}`} target="_blank" rel="noopener noreferrer"
                                      style={{ color:'var(--text-secondary)', fontSize:11.5, fontWeight:600, textDecoration:'none' }}>
                                      {isAr?'فتح':'Open'} ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAREER */}
                  {activeTab==='career' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {/* Job Preferences */}
                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'تفضيلات الوظيفة':'Job Preferences'}</span>
                        </div>
                        <div style={{ padding:'18px 18px 4px' }}>
                          <JobTitleCombobox label={isAr?'المسمى الوظيفي المرغوب':'Desired Job Title'} value={form.desiredJobTitle} onChange={v=>set('desiredJobTitle',v)} isAr={isAr}/>
                          <div style={{ marginBottom:14 }}>
                            <p style={{ fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', margin:'0 0 8px', fontFamily:font }}>{isAr?'نطاق الراتب المتوقع (شهري)':'Expected Salary Range (monthly)'}</p>
                            <div className="prof-g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              {[
                                { key:'desiredSalaryMin', label:isAr?'الحد الأدنى':'Minimum', placeholder:'3,000' },
                                { key:'desiredSalaryMax', label:isAr?'الحد الأقصى':'Maximum', placeholder:'10,000' },
                              ].map(({key,label,placeholder}) => (
                                <div key={key} style={{ background:'var(--bg-secondary)', border:'1.5px solid var(--border)', borderRadius:10, overflow:'hidden' }}
                                  onFocusCapture={e=>{e.currentTarget.style.borderColor='var(--text-primary)';}}
                                  onBlurCapture={e=>{e.currentTarget.style.borderColor='var(--border)';}}>
                                  <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'8px 14px 2px' }}>{label}</span>
                                  <div style={{ display:'flex', alignItems:'center', padding:'2px 12px 9px', gap:6 }}>
                                    <span style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'var(--font-en)' }}>$</span>
                                    <input type="number" value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder} min="0"
                                      style={{ flex:1, border:'none', outline:'none', background:'transparent', color:'var(--text-primary)', fontSize:13.5, fontFamily:'var(--font-en)', fontWeight:600 }}/>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ marginBottom:14 }}>
                            <p style={{ fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', margin:'0 0 9px', fontFamily:font }}>{isAr?'أنواع الوظائف المفضلة':'Preferred Job Types'}</p>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                              {JOB_TYPES.map(t => {
                                const active = (form.desiredJobTypes||[]).includes(t.key);
                                return (
                                  <button key={t.key} onClick={()=>toggleJobType(t.key)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:99, cursor:'pointer', border:`1.5px solid ${active?'var(--text-primary)':'var(--border)'}`, background:'var(--bg-secondary)', color:active?'var(--text-primary)':'var(--text-secondary)', fontSize:13, fontWeight:active?700:500, fontFamily:font }}>
                                    {active && <Check size={12} strokeWidth={2.8}/>}
                                    {isAr?t.ar:t.en}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ AUTO-APPLY CARD */}
                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'التقديم التلقائي (Auto-Apply)':'Auto-Apply Settings'}</span>
                          <span style={{ fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:99, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', color:'#F59E0B' }}>PRO</span>
                        </div>
                        <div style={{ padding:'18px' }}>
                          {isPro ? (
                            <>
                              {aaLoading ? (
                                <div style={{ height:70, borderRadius:12, background:'var(--bg-secondary)', animation:'profPulse 1.5s ease-in-out infinite' }}/>
                              ) : (
                                <>
                                  {/* Toggle */}
                                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:12, background:aa.autoApplyEnabled?'rgba(139,92,246,0.07)':'var(--bg-secondary)', border:`1px solid ${aa.autoApplyEnabled?'rgba(139,92,246,0.25)':'var(--border)'}`, cursor:aaSaving?'not-allowed':'pointer', transition:'all 0.2s', marginBottom:14, opacity:aaSaving?.7:1 }}
                                    onClick={toggleAA}>
                                    <div style={{ flex:1 }}>
                                      <p style={{ fontSize:13.5, fontWeight:700, margin:'0 0 3px', fontFamily:font }}>{isAr?'تفعيل التقديم التلقائي':'Enable AI Auto-Apply'}</p>
                                      <p style={{ fontSize:12, color:aa.autoApplyEnabled?'#8B5CF6':'var(--text-secondary)', margin:0, fontFamily:font, lineHeight:1.5 }}>
                                        {aa.autoApplyEnabled
                                          ? (dailyLimit
                                              ? (isAr?`⚡ نشط — AI يتقدم حتى ${dailyLimit} مرة يومياً`:`⚡ Active — AI applies up to ${dailyLimit}×/day`)
                                              : (isAr?'⚡ نشط — AI يتقدم تلقائياً':'⚡ Active — AI applies automatically'))
                                          : (matchThreshold
                                              ? (isAr?`يتقدم AI نيابةً عنك على الوظائف ≥${matchThreshold}% تطابقاً`:`AI applies to jobs matching ≥${matchThreshold}%`)
                                              : (isAr?'يتقدم AI نيابةً عنك تلقائياً على الوظائف المناسبة':'AI applies on your behalf to matching jobs'))}
                                      </p>
                                    </div>
                                    {aaSaving
                                      ? <Loader2 size={18} color="#8B5CF6" style={{ animation:'profSpin .7s linear infinite', flexShrink:0 }}/>
                                      : <div style={{ width:46, height:26, borderRadius:13, background:aa.autoApplyEnabled?'#8B5CF6':'var(--border)', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                                          <div style={{ width:20, height:20, borderRadius:'50%', background:'white', position:'absolute', top:3, left:aa.autoApplyEnabled?23:3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                                        </div>
                                    }
                                  </div>

                                  {/* Consent */}
                                  {aa.autoApplyEnabled && (
                                    <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', fontSize:12, color:'#8B5CF6', lineHeight:1.6, fontFamily:font, marginBottom:14 }}>
                                      ⚠️ {isAr
                                        ? 'بتفعيل هذه الميزة أنت توافق على أن TalexHub سيُرسل سيرتك الذاتية تلقائياً إلى الشركات المناسبة. يمكنك إيقافها في أي وقت.'
                                        : 'By enabling this, you agree that TalexHub will automatically send your CV to matching companies. You can disable anytime.'}
                                    </div>
                                  )}

                                  {/* Stats */}
                                  {aaStats && (
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                                      {[
                                        { key:'totalApplications', label:isAr?'إجمالي التقديمات':'Total Applied',   value:aaStats.totalApplications },
                                        { key:'usedToday',         label:isAr?'اليوم':'Today',                       value:aaStats.usedToday ?? aaStats.todayApplications },
                                        { key:'avgMatchScore',     label:isAr?'متوسط التطابق':'Avg Match',           value:aaStats.avgMatchScore!=null?`${aaStats.avgMatchScore}%`:null },
                                      ].filter(s=>s.value!==undefined&&s.value!==null).map(s => (
                                        <div key={s.key} style={{ padding:'10px 12px', borderRadius:10, background:'var(--bg-secondary)', border:'1px solid var(--border)', textAlign:isAr?'right':'left' }}>
                                          <p style={{ margin:'0 0 2px', fontSize:16, fontWeight:800, fontFamily:'var(--font-en)' }}>{s.value}</p>
                                          <p style={{ margin:0, fontSize:10.5, color:'var(--text-secondary)', fontFamily:font }}>{s.label}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <div style={{ textAlign:'center', padding:'20px 0' }}>
                              <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'0 0 12px', fontFamily:font, lineHeight:1.6 }}>
                                {isAr?'دع الذكاء الاصطناعي يتقدم نيابةً عنك يومياً على أفضل الوظائف المتوافقة.':'Let AI apply on your behalf daily to the best matching jobs.'}
                              </p>
                              <a href="/pricing" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:10, background:'var(--text-primary)', color:'var(--bg-primary)', textDecoration:'none', fontSize:13, fontWeight:700, fontFamily:font }}>
                                🚀 {isAr?'ترقية إلى Pro':'Upgrade to Pro'}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preferred Locations */}
                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:font }}>{isAr?'المواقع الجغرافية المرغوبة':'Preferred Work Locations'}</span>
                        </div>
                        <div style={{ padding:'18px 18px 4px' }}>
                          <LocationMultiPicker label={isAr?'اختر المواقع المرغوبة':'Choose desired locations'} value={form.desiredLocations} onChange={v=>set('desiredLocations',v)} isAr={isAr}/>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SAVE */}
                  <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                    <button onClick={handleSave} disabled={saving} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', background:'var(--text-primary)', color:'var(--bg-primary)', cursor:saving?'not-allowed':'pointer', fontSize:14.5, fontWeight:800, fontFamily:font, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:saving?.7:1 }}>
                      {saving
                        ? <><Loader2 size={17} strokeWidth={2.5} style={{ animation:'profSpin .7s linear infinite' }}/> {isAr?'جاري الحفظ...':'Saving...'}</>
                        : <><Save size={16} strokeWidth={2}/> {isAr?'حفظ التغييرات':'Save Changes'}</>
                      }
                    </button>
                    <p style={{ marginTop:8, fontSize:11, color:'var(--text-secondary)', textAlign:'center', fontFamily:font }}>
                      {isAr?'ملاحظة: Auto-Apply يُحفظ فوراً عند التبديل ولا يحتاج هذا الزر':'Note: Auto-Apply saves instantly when toggled'}
                    </p>
                  </div>
                  <div style={{ height:16 }}/>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      <MobileBottomNav/>
    </>
  );
}