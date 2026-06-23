// // // // 'use strict';
// // // // // frontend/src/pages/Company/CompanySidebar.jsx
// // // // // ════════════════════════════════════════════════════════════
// // // // // Full company sidebar:
// // // // //   Desktop: collapsible, logo, company pill, nav groups, logout
// // // // //   Mobile:  top bar + bottom nav (5 main items)
// // // // // ════════════════════════════════════════════════════════════

// // // // import { useState, useEffect, useRef } from 'react';
// // // // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // // // import {
// // // //   LayoutDashboard, Briefcase, Users, Bell, UserCircle,
// // // //   LogOut, ChevronLeft, ChevronRight, Plus, BarChart2,
// // // //   Layers, Settings, Users2, ChevronDown, ChevronUp,
// // // // } from 'lucide-react';
// // // // import useAuthStore  from '../../store/authStore';
// // // // import useLangStore  from '../../i18n';
// // // // import api           from '../../services/api';
// // // // import LogoGold      from '../../assets/images/LogoGold.png';

// // // // // ════════════════════════════════════════════════════════════
// // // // //  NAV CONFIG — grouped
// // // // // ════════════════════════════════════════════════════════════
// // // // const NAV_GROUPS = [
// // // //   {
// // // //     label: { ar: 'الرئيسي', en: 'MAIN' },
// // // //     items: [
// // // //       { to: '/company/dashboard',  icon: LayoutDashboard, ar: 'الرئيسية',   en: 'Overview'      },
// // // //       { to: '/company/jobs',       icon: Briefcase,       ar: 'الوظائف',    en: 'Jobs'          },
// // // //       { to: '/company/applicants', icon: Users,           ar: 'المتقدمون',  en: 'Applicants'    },
// // // //       { to: '/company/pipeline',   icon: Layers,          ar: 'Pipeline',   en: 'Pipeline'      },
// // // //     ],
// // // //   },
// // // //   {
// // // //     label: { ar: 'التقارير', en: 'INSIGHTS' },
// // // //     items: [
// // // //       { to: '/company/analytics',    icon: BarChart2, ar: 'التحليلات', en: 'Analytics' },
// // // //     ],
// // // //   },
// // // //   {
// // // //     label: { ar: 'الفريق', en: 'TEAM' },
// // // //     items: [
// // // //       { to: '/company/members',      icon: Users2,      ar: 'فريق العمل', en: 'Team Members' },
// // // //       { to: '/company/notifications',icon: Bell,        ar: 'الإشعارات', en: 'Notifications', badge: true },
// // // //     ],
// // // //   },
// // // //   {
// // // //     label: { ar: 'الإعدادات', en: 'SETTINGS' },
// // // //     items: [
// // // //       { to: '/company/profile',  icon: UserCircle, ar: 'ملف الشركة', en: 'Company Profile' },
// // // //       { to: '/company/settings', icon: Settings,   ar: 'الإعدادات',  en: 'Settings'        },
// // // //     ],
// // // //   },
// // // // ];

// // // // // Mobile bottom nav — 5 most important
// // // // const MOBILE_NAV = [
// // // //   { to: '/company/dashboard',     icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Home'        },
// // // //   { to: '/company/jobs',          icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs'        },
// // // //   { to: '/company/applicants',    icon: Users,           ar: 'المتقدمون', en: 'Applicants'  },
// // // //   { to: '/company/notifications', icon: Bell,            ar: 'الإشعارات', en: 'Alerts', badge: true },
// // // //   { to: '/company/profile',       icon: UserCircle,      ar: 'الملف',     en: 'Profile'     },
// // // // ];

// // // // // ════════════════════════════════════════════════════════════
// // // // //  HELPERS
// // // // // ════════════════════════════════════════════════════════════
// // // // function Avatar({ name, url, size = 34 }) {
// // // //   const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
// // // //   if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }} />;
// // // //   return (
// // // //     <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0, userSelect: 'none' }}>
// // // //       {initials}
// // // //     </div>
// // // //   );
// // // // }

// // // // function NavItem({ item, isAr, collapsed, pathname, unread = 0 }) {
// // // //   const Icon = item.icon;
// // // //   const isExact = item.to === '/company/dashboard';
// // // //   const active  = isExact ? pathname === item.to : pathname.startsWith(item.to);
// // // //   const badge   = item.badge ? unread : 0;
// // // //   const font    = isAr ? 'var(--font-ar)' : 'var(--font-en)';

// // // //   return (
// // // //     <Link to={item.to} title={collapsed ? (isAr ? item.ar : item.en) : undefined} style={{
// // // //       display: 'flex', alignItems: 'center',
// // // //       gap: collapsed ? 0 : 10,
// // // //       padding: collapsed ? '10px 0' : '8px 11px',
// // // //       justifyContent: collapsed ? 'center' : 'flex-start',
// // // //       borderRadius: 10, textDecoration: 'none',
// // // //       background: active ? 'var(--bg-secondary)' : 'transparent',
// // // //       border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
// // // //       color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
// // // //       fontSize: 13, fontWeight: active ? 700 : 500,
// // // //       transition: 'all 0.15s', marginBottom: 1,
// // // //       position: 'relative', fontFamily: font,
// // // //     }}
// // // //       onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg-secondary)'; e.currentTarget.style.color='var(--text-primary)'; }}}
// // // //       onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}}>
// // // //       <div style={{ position: 'relative', flexShrink: 0 }}>
// // // //         <Icon size={17} strokeWidth={active ? 2.2 : 1.7} />
// // // //         {badge > 0 && (
// // // //           <div style={{ position: 'absolute', top: -5, insetInlineEnd: -5, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>
// // // //             {badge > 9 ? '9+' : badge}
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //       {!collapsed && (
// // // //         <>
// // // //           <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// // // //             {isAr ? item.ar : item.en}
// // // //           </span>
// // // //           {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', flexShrink: 0 }} />}
// // // //         </>
// // // //       )}
// // // //       {/* Active left bar */}
// // // //       {active && !collapsed && <div style={{ position: 'absolute', insetInlineStart: 0, top: '25%', bottom: '25%', width: 3, borderRadius: 99, background: 'var(--text-primary)' }} />}
// // // //     </Link>
// // // //   );
// // // // }

// // // // // ════════════════════════════════════════════════════════════
// // // // //  DESKTOP SIDEBAR
// // // // // ════════════════════════════════════════════════════════════
// // // // export default function CompanySidebar({ collapsed, setCollapsed }) {
// // // //   const { lang }        = useLangStore();
// // // //   const { user, logout } = useAuthStore();
// // // //   const location        = useLocation();
// // // //   const navigate        = useNavigate();
// // // //   const isAr = lang === 'ar';
// // // //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

// // // //   const [unread,  setUnread]  = useState(0);
// // // //   const [company, setCompany] = useState(null);

// // // //   useEffect(() => {
// // // //     api.get('/companies/me').then(({ data }) => setCompany(data.data?.company || data.data || null)).catch(() => {});
// // // //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// // // //       const list = data.data?.notifications || data.data || [];
// // // //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : (data.data?.unread || 0));
// // // //     }).catch(() => {});
// // // //   }, []);

// // // //   const handleLogout = async () => {
// // // //     try { await api.post('/auth/logout'); } catch {}
// // // //     logout();
// // // //     navigate('/login');
// // // //   };

// // // //   const W = collapsed ? 64 : 228;

// // // //   return (
// // // //     <aside style={{
// // // //       width: W, minWidth: W, height: '100vh', position: 'sticky', top: 0,
// // // //       background: 'var(--bg-primary)', borderInlineEnd: '1px solid var(--border)',
// // // //       display: 'flex', flexDirection: 'column', overflow: 'hidden',
// // // //       transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s',
// // // //       fontFamily: font, zIndex: 50,
// // // //       // Hide on mobile
// // // //     }} className="co-sidebar">
// // // //       <style>{`
// // // //         @media(max-width:1023px){ .co-sidebar{display:none!important} }
// // // //         ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
// // // //       `}</style>

// // // //       {/* ── Logo row ── */}
// // // //       <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
// // // //         {!collapsed && (
// // // //           <Link to="/company/dashboard" style={{ textDecoration: 'none' }}>
// // // //             <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
// // // //           </Link>
// // // //         )}
// // // //         <button onClick={() => setCollapsed(!collapsed)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
// // // //           onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
// // // //           onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
// // // //           {isAr
// // // //             ? (collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />)
// // // //             : (collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />)
// // // //           }
// // // //         </button>
// // // //       </div>

// // // //       {/* ── Company pill ── */}
// // // //       {!collapsed ? (
// // // //         <div style={{ margin: '10px 8px 2px', padding: '10px 11px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}>
// // // //           <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
// // // //             <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
// // // //               {company?.logoUrl
// // // //                 ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// // // //                 : <Briefcase size={15} color="var(--text-secondary)" />
// // // //               }
// // // //             </div>
// // // //             <div style={{ minWidth: 0, flex: 1 }}>
// // // //               <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// // // //                 {company?.name || user?.fullName || '—'}
// // // //               </p>
// // // //               <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
// // // //                 {isAr ? 'مسؤول الشركة' : 'Company Admin'}
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //           {/* Post Job quick button */}
// // // //           <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: font, transition: 'all .15s' }}
// // // //             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
// // // //             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
// // // //             <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة' : 'Post a Job'}
// // // //           </Link>
// // // //         </div>
// // // //       ) : (
// // // //         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '10px 0 2px', flexShrink: 0 }}>
// // // //           <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
// // // //             {company?.logoUrl ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Briefcase size={15} color="var(--text-secondary)" />}
// // // //           </div>
// // // //           <Link to="/company/jobs/new" title={isAr ? 'نشر وظيفة' : 'Post a Job'} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all .15s' }}
// // // //             onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currentTarget.style.color='var(--text-primary)'; }}
// // // //             onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
// // // //             <Plus size={13} strokeWidth={2.5} />
// // // //           </Link>
// // // //         </div>
// // // //       )}

// // // //       {/* ── Nav groups ── */}
// // // //       <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
// // // //         {NAV_GROUPS.map((group, gi) => (
// // // //           <div key={gi} style={{ marginBottom: 4 }}>
// // // //             {/* Group label */}
// // // //             {!collapsed && (
// // // //               <p style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', opacity: .5, textTransform: 'uppercase', letterSpacing: '0.08em', margin: gi === 0 ? '6px 11px 4px' : '10px 11px 4px', fontFamily: 'var(--font-en)' }}>
// // // //                 {isAr ? group.label.ar : group.label.en}
// // // //               </p>
// // // //             )}
// // // //             {!collapsed && gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 8px 8px', opacity: .5 }} />}
// // // //             {group.items.map(item => (
// // // //               <NavItem key={item.to} item={item} isAr={isAr} collapsed={collapsed} pathname={location.pathname} unread={unread} />
// // // //             ))}
// // // //           </div>
// // // //         ))}
// // // //       </nav>

// // // //       {/* ── Logout ── */}
// // // //       <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
// // // //         <button onClick={handleLogout} title={collapsed ? (isAr ? 'تسجيل الخروج' : 'Logout') : undefined}
// // // //           style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '10px 0' : '8px 11px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, fontWeight: 500, transition: 'all .15s' }}
// // // //           onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444'; }}
// // // //           onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
// // // //           <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
// // // //           {!collapsed && (isAr ? 'تسجيل الخروج' : 'Logout')}
// // // //         </button>
// // // //       </div>
// // // //     </aside>
// // // //   );
// // // // }

// // // // // ════════════════════════════════════════════════════════════
// // // // //  MOBILE TOP BAR
// // // // // ════════════════════════════════════════════════════════════
// // // // export function CompanyTopBar({ title }) {
// // // //   const { lang } = useLangStore();
// // // //   const isAr = lang === 'ar';
// // // //   const [unread, setUnread] = useState(0);

// // // //   useEffect(() => {
// // // //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// // // //       const list = data.data?.notifications || data.data || [];
// // // //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
// // // //     }).catch(() => {});
// // // //   }, []);

// // // //   return (
// // // //     <div className="co-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', flexShrink: 0 }}>
// // // //       <style>{`@media(max-width:1023px){.co-topbar{display:flex!important}}`}</style>
// // // //       <Link to="/company/dashboard" style={{ textDecoration: 'none' }}>
// // // //         <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
// // // //       </Link>
// // // //       <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>{title}</p>
// // // //       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// // // //         <Link to="/company/jobs/new" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
// // // //           <Plus size={16} />
// // // //         </Link>
// // // //         <Link to="/company/notifications" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
// // // //           <Bell size={16} />
// // // //           {unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{unread > 9 ? '9+' : unread}</div>}
// // // //         </Link>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // // ════════════════════════════════════════════════════════════
// // // // //  MOBILE BOTTOM NAV
// // // // // ════════════════════════════════════════════════════════════
// // // // export function CompanyBottomNav() {
// // // //   const { lang } = useLangStore();
// // // //   const location = useLocation();
// // // //   const isAr = lang === 'ar';
// // // //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
// // // //   const [unread, setUnread] = useState(0);

// // // //   useEffect(() => {
// // // //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// // // //       const list = data.data?.notifications || data.data || [];
// // // //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
// // // //     }).catch(() => {});
// // // //   }, []);

// // // //   return (
// // // //     <nav className="co-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '6px 4px calc(6px + env(safe-area-inset-bottom))', fontFamily: font }}>
// // // //       <style>{`@media(max-width:1023px){.co-bottom-nav{display:flex!important}}`}</style>
// // // //       {MOBILE_NAV.map(item => {
// // // //         const Icon    = item.icon;
// // // //         const isExact = item.to === '/company/dashboard';
// // // //         const active  = isExact ? location.pathname === item.to : location.pathname.startsWith(item.to);
// // // //         const badge   = item.badge ? unread : 0;
// // // //         return (
// // // //           <Link key={item.to} to={item.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', padding: '5px 2px', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 9.5, fontWeight: active ? 700 : 500, fontFamily: font, position: 'relative' }}>
// // // //             <div style={{ position: 'relative' }}>
// // // //               <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
// // // //               {badge > 0 && <div style={{ position: 'absolute', top: -5, right: -5, minWidth: 14, height: 14, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{badge > 9 ? '9+' : badge}</div>}
// // // //             </div>
// // // //             <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{isAr ? item.ar : item.en}</span>
// // // //             {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, borderRadius: 99, background: 'var(--text-primary)' }} />}
// // // //           </Link>
// // // //         );
// // // //       })}
// // // //     </nav>
// // // //   );
// // // // }


// // // 'use strict';
// // // // frontend/src/pages/Company/CompanySidebar.jsx
// // // // ════════════════════════════════════════════════════════════
// // // // Full company sidebar:
// // // //   Desktop: collapsible, logo, company pill, nav groups, logout
// // // //   Mobile:  top bar + bottom nav (5 main items)
// // // // ════════════════════════════════════════════════════════════

// // // import { useState, useEffect, useRef } from 'react';
// // // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // // import {
// // //   LayoutDashboard, Briefcase, Users, Bell, UserCircle,
// // //   LogOut, ChevronLeft, ChevronRight, Plus, BarChart2,
// // //   Layers, Settings, ChevronDown, ChevronUp,
// // // } from 'lucide-react';
// // // import useAuthStore  from '../../store/authStore';
// // // import useLangStore  from '../../i18n';
// // // import api           from '../../services/api';
// // // import { useCompany } from './CompanyLayout';
// // // import LogoGold      from '../../assets/images/LogoGold.png';

// // // // ════════════════════════════════════════════════════════════
// // // //  NAV CONFIG — grouped
// // // // ════════════════════════════════════════════════════════════
// // // const NAV_GROUPS = [
// // //   {
// // //     label: { ar: 'الرئيسي', en: 'MAIN' },
// // //     items: [
// // //       { to: '/company/dashboard',  icon: LayoutDashboard, ar: 'الرئيسية',   en: 'Overview'      },
// // //       { to: '/company/jobs',       icon: Briefcase,       ar: 'الوظائف',    en: 'Jobs'          },
// // //       { to: '/company/applicants', icon: Users,           ar: 'المتقدمون',  en: 'Applicants'    },
// // //       { to: '/company/pipeline',   icon: Layers,          ar: 'Pipeline',   en: 'Pipeline'      },
// // //     ],
// // //   },
// // //   {
// // //     label: { ar: 'التقارير', en: 'INSIGHTS' },
// // //     items: [
// // //       { to: '/company/analytics',    icon: BarChart2, ar: 'التحليلات', en: 'Analytics' },
// // //     ],
// // //   },
// // //   {
// // //     label: { ar: 'أخرى', en: 'OTHER' },
// // //     items: [
// // //       { to: '/company/notifications',icon: Bell, ar: 'الإشعارات', en: 'Notifications', badge: true },
// // //     ],
// // //   },
// // //   {
// // //     label: { ar: 'الإعدادات', en: 'SETTINGS' },
// // //     items: [
// // //       { to: '/company/profile',  icon: UserCircle, ar: 'ملف الشركة', en: 'Company Profile' },
// // //       { to: '/company/settings', icon: Settings,   ar: 'الإعدادات',  en: 'Settings'        },
// // //     ],
// // //   },
// // // ];

// // // // Mobile bottom nav — 5 most important
// // // const MOBILE_NAV = [
// // //   { to: '/company/dashboard',     icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Home'        },
// // //   { to: '/company/jobs',          icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs'        },
// // //   { to: '/company/applicants',    icon: Users,           ar: 'المتقدمون', en: 'Applicants'  },
// // //   { to: '/company/notifications', icon: Bell,            ar: 'الإشعارات', en: 'Alerts', badge: true },
// // //   { to: '/company/profile',       icon: UserCircle,      ar: 'الملف',     en: 'Profile'     },
// // // ];

// // // // ════════════════════════════════════════════════════════════
// // // //  HELPERS
// // // // ════════════════════════════════════════════════════════════
// // // function Avatar({ name, url, size = 34 }) {
// // //   const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
// // //   if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }} />;
// // //   return (
// // //     <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0, userSelect: 'none' }}>
// // //       {initials}
// // //     </div>
// // //   );
// // // }

// // // function NavItem({ item, isAr, collapsed, pathname, unread = 0 }) {
// // //   const Icon = item.icon;
// // //   const isExact = item.to === '/company/dashboard';
// // //   const active  = isExact ? pathname === item.to : pathname.startsWith(item.to);
// // //   const badge   = item.badge ? unread : 0;
// // //   const font    = isAr ? 'var(--font-ar)' : 'var(--font-en)';

// // //   return (
// // //     <Link to={item.to} title={collapsed ? (isAr ? item.ar : item.en) : undefined} style={{
// // //       display: 'flex', alignItems: 'center',
// // //       gap: collapsed ? 0 : 10,
// // //       padding: collapsed ? '10px 0' : '8px 11px',
// // //       justifyContent: collapsed ? 'center' : 'flex-start',
// // //       borderRadius: 10, textDecoration: 'none',
// // //       background: active ? 'var(--bg-secondary)' : 'transparent',
// // //       border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
// // //       color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
// // //       fontSize: 13, fontWeight: active ? 700 : 500,
// // //       transition: 'all 0.15s', marginBottom: 1,
// // //       position: 'relative', fontFamily: font,
// // //     }}
// // //       onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg-secondary)'; e.currentTarget.style.color='var(--text-primary)'; }}}
// // //       onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}}>
// // //       <div style={{ position: 'relative', flexShrink: 0 }}>
// // //         <Icon size={17} strokeWidth={active ? 2.2 : 1.7} />
// // //         {badge > 0 && (
// // //           <div style={{ position: 'absolute', top: -5, insetInlineEnd: -5, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>
// // //             {badge > 9 ? '9+' : badge}
// // //           </div>
// // //         )}
// // //       </div>
// // //       {!collapsed && (
// // //         <>
// // //           <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// // //             {isAr ? item.ar : item.en}
// // //           </span>
// // //           {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', flexShrink: 0 }} />}
// // //         </>
// // //       )}
// // //       {/* Active left bar */}
// // //       {active && !collapsed && <div style={{ position: 'absolute', insetInlineStart: 0, top: '25%', bottom: '25%', width: 3, borderRadius: 99, background: 'var(--text-primary)' }} />}
// // //     </Link>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // //  DESKTOP SIDEBAR
// // // // ════════════════════════════════════════════════════════════
// // // export default function CompanySidebar({ collapsed, setCollapsed }) {
// // //   const { lang }        = useLangStore();
// // //   const { user, logout } = useAuthStore();
// // //   const location        = useLocation();
// // //   const navigate        = useNavigate();
// // //   const isAr = lang === 'ar';
// // //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

// // //   const [unread, setUnread] = useState(0);
// // //   const { company }         = useCompany(); // من CompanyLayout context

// // //   useEffect(() => {
// // //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// // //       const list = data.data?.notifications || data.data || [];
// // //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : (data.data?.unread || 0));
// // //     }).catch(() => {});
// // //   }, []);

// // //   const handleLogout = async () => {
// // //     try { await api.post('/auth/logout'); } catch {}
// // //     logout();
// // //     navigate('/login');
// // //   };

// // //   const W = collapsed ? 64 : 228;

// // //   return (
// // //     <aside style={{
// // //       width: W, minWidth: W, height: '100vh', position: 'sticky', top: 0,
// // //       background: 'var(--bg-primary)', borderInlineEnd: '1px solid var(--border)',
// // //       display: 'flex', flexDirection: 'column', overflow: 'hidden',
// // //       transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s',
// // //       fontFamily: font, zIndex: 50,
// // //       // Hide on mobile
// // //     }} className="co-sidebar">
// // //       <style>{`
// // //         @media(max-width:1023px){ .co-sidebar{display:none!important} }
// // //         ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
// // //       `}</style>

// // //       {/* ── Logo row ── */}
// // //       <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
// // //         {!collapsed && (
// // //           <Link to="/company/dashboard" style={{ textDecoration: 'none' }}>
// // //             <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
// // //           </Link>
// // //         )}
// // //         <button onClick={() => setCollapsed(!collapsed)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
// // //           onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
// // //           onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
// // //           {isAr
// // //             ? (collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />)
// // //             : (collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />)
// // //           }
// // //         </button>
// // //       </div>

// // //       {/* ── Company pill ── */}
// // //       {!collapsed ? (
// // //         <div style={{ margin: '10px 8px 2px', padding: '10px 11px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}>
// // //           <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
// // //             <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
// // //               {company?.logoUrl
// // //                 ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// // //                 : <Briefcase size={15} color="var(--text-secondary)" />
// // //               }
// // //             </div>
// // //             <div style={{ minWidth: 0, flex: 1 }}>
// // //               <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// // //                 {company?.name || user?.fullName || '—'}
// // //               </p>
// // //               <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
// // //                 {isAr ? 'مسؤول الشركة' : 'Company Admin'}
// // //               </p>
// // //             </div>
// // //           </div>
// // //           {/* Post Job quick button */}
// // //           {company?.status === 'active' ? (
// // //             <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: font, transition: 'all .15s' }}
// // //               onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
// // //               onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
// // //               <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة' : 'Post a Job'}
// // //             </Link>
// // //           ) : (
// // //             <div title={isAr ? 'يتطلب موافقة الإدارة' : 'Requires admin approval'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '7px', borderRadius: 8, border: '1px dashed var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, fontFamily: font, cursor: 'not-allowed', opacity: 0.6 }}>
// // //               <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة 🔒' : 'Post a Job 🔒'}
// // //             </div>
// // //           )}
// // //         </div>
// // //       ) : (
// // //         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '10px 0 2px', flexShrink: 0 }}>
// // //           <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
// // //             {company?.logoUrl ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Briefcase size={15} color="var(--text-secondary)" />}
// // //           </div>
// // //           {company?.status === 'active' ? (
// // //             <Link to="/company/jobs/new" title={isAr ? 'نشر وظيفة' : 'Post a Job'} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all .15s' }}
// // //               onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currenturrent.style.color='var(--text-primary)'; }}
// // //               onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
// // //               <Plus size={13} strokeWidth={2.5} />
// // //             </Link>
// // //           ) : (
// // //             <div title={isAr ? 'يتطلب موافقة' : 'Requires approval'} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'not-allowed', opacity: 0.5 }}>
// // //               <Plus size={13} strokeWidth={2.5} />
// // //             </div>
// // //           )}
// // //         </div>
// // //       )}

// // //       {/* ── Nav groups ── */}
// // //       <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
// // //         {NAV_GROUPS.map((group, gi) => (
// // //           <div key={gi} style={{ marginBottom: 4 }}>
// // //             {/* Group label */}
// // //             {!collapsed && (
// // //               <p style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', opacity: .5, textTransform: 'uppercase', letterSpacing: '0.08em', margin: gi === 0 ? '6px 11px 4px' : '10px 11px 4px', fontFamily: 'var(--font-en)' }}>
// // //                 {isAr ? group.label.ar : group.label.en}
// // //               </p>
// // //             )}
// // //             {!collapsed && gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 8px 8px', opacity: .5 }} />}
// // //             {group.items.map(item => (
// // //               <NavItem key={item.to} item={item} isAr={isAr} collapsed={collapsed} pathname={location.pathname} unread={unread} />
// // //             ))}
// // //           </div>
// // //         ))}
// // //       </nav>

// // //       {/* ── Logout ── */}
// // //       <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
// // //         <button onClick={handleLogout} title={collapsed ? (isAr ? 'تسجيل الخروج' : 'Logout') : undefined}
// // //           style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '10px 0' : '8px 11px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, fontWeight: 500, transition: 'all .15s' }}
// // //           onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444'; }}
// // //           onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
// // //           <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
// // //           {!collapsed && (isAr ? 'تسجيل الخروج' : 'Logout')}
// // //         </button>
// // //       </div>
// // //     </aside>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // //  MOBILE TOP BAR
// // // // ════════════════════════════════════════════════════════════
// // // export function CompanyTopBar({ title }) {
// // //   const { lang } = useLangStore();
// // //   const isAr = lang === 'ar';
// // //   const [unread, setUnread] = useState(0);

// // //   useEffect(() => {
// // //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// // //       const list = data.data?.notifications || data.data || [];
// // //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
// // //     }).catch(() => {});
// // //   }, []);

// // //   return (
// // //     <div className="co-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', flexShrink: 0 }}>
// // //       <style>{`@media(max-width:1023px){.co-topbar{display:flex!important}}`}</style>
// // //       <Link to="/company/dashboard" style={{ textDecoration: 'none' }}>
// // //         <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
// // //       </Link>
// // //       <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>{title}</p>
// // //       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// // //         <Link to="/company/jobs/new" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
// // //           <Plus size={16} />
// // //         </Link>
// // //         <Link to="/company/notifications" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
// // //           <Bell size={16} />
// // //           {unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{unread > 9 ? '9+' : unread}</div>}
// // //         </Link>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // //  MOBILE BOTTOM NAV
// // // // ════════════════════════════════════════════════════════════
// // // export function CompanyBottomNav() {
// // //   const { lang } = useLangStore();
// // //   const location = useLocation();
// // //   const isAr = lang === 'ar';
// // //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
// // //   const [unread, setUnread] = useState(0);

// // //   useEffect(() => {
// // //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// // //       const list = data.data?.notifications || data.data || [];
// // //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
// // //     }).catch(() => {});
// // //   }, []);

// // //   return (
// // //     <nav className="co-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '6px 4px calc(6px + env(safe-area-inset-bottom))', fontFamily: font }}>
// // //       <style>{`@media(max-width:1023px){.co-bottom-nav{display:flex!important}}`}</style>
// // //       {MOBILE_NAV.map(item => {
// // //         const Icon    = item.icon;
// // //         const isExact = item.to === '/company/dashboard';
// // //         const active  = isExact ? location.pathname === item.to : location.pathname.startsWith(item.to);
// // //         const badge   = item.badge ? unread : 0;
// // //         return (
// // //           <Link key={item.to} to={item.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', padding: '5px 2px', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 9.5, fontWeight: active ? 700 : 500, fontFamily: font, position: 'relative' }}>
// // //             <div style={{ position: 'relative' }}>
// // //               <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
// // //               {badge > 0 && <div style={{ position: 'absolute', top: -5, right: -5, minWidth: 14, height: 14, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{badge > 9 ? '9+' : badge}</div>}
// // //             </div>
// // //             <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{isAr ? item.ar : item.en}</span>
// // //             {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, borderRadius: 99, background: 'var(--text-primary)' }} />}
// // //           </Link>
// // //         );
// // //       })}
// // //     </nav>
// // //   );
// // // }

// // 'use strict';
// // // frontend/src/pages/Company/CompanySidebar.jsx
// // // ════════════════════════════════════════════════════════════
// // // Full company sidebar:
// // //   Desktop: collapsible, logo, company pill, nav groups, logout
// // //   Mobile:  top bar + bottom nav (5 main items)
// // // ════════════════════════════════════════════════════════════

// // import { useState, useEffect, useRef } from 'react';
// // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // import {
// //   LayoutDashboard, Briefcase, Users, Bell, UserCircle,
// //   LogOut, ChevronLeft, ChevronRight, Plus, BarChart2,
// //   Layers, Settings, ChevronDown, ChevronUp,
// // } from 'lucide-react';
// // import useAuthStore  from '../../store/authStore';
// // import useLangStore  from '../../i18n';
// // import api           from '../../services/api';
// // import { useCompany } from './CompanyLayout';
// // import LogoGold      from '../../assets/images/LogoGold.png';

// // // ════════════════════════════════════════════════════════════
// // //  NAV CONFIG — grouped
// // // ════════════════════════════════════════════════════════════
// // // ── يبني مجموعات النافبار حسب حالة الشركة ──
// // // active → كل التابات تفتح
// // // غير active → فقط Profile + Settings + Notifications
// // const getNavGroups = (isActive) => {
// //   if (isActive) {
// //     return [
// //       {
// //         label: { ar: 'الرئيسي', en: 'MAIN' },
// //         items: [
// //           { to: '/company/dashboard',  icon: LayoutDashboard, ar: 'الرئيسية',   en: 'Overview'      },
// //           { to: '/company/jobs',       icon: Briefcase,       ar: 'الوظائف',    en: 'Jobs'          },
// //           { to: '/company/applicants', icon: Users,           ar: 'المتقدمون',  en: 'Applicants'    },
// //           { to: '/company/pipeline',   icon: Layers,          ar: 'Pipeline',   en: 'Pipeline'      },
// //         ],
// //       },
// //       {
// //         label: { ar: 'التقارير', en: 'INSIGHTS' },
// //         items: [
// //           { to: '/company/analytics', icon: BarChart2, ar: 'التحليلات', en: 'Analytics' },
// //         ],
// //       },
// //       {
// //         label: { ar: 'أخرى', en: 'OTHER' },
// //         items: [
// //           { to: '/company/notifications', icon: Bell, ar: 'الإشعارات', en: 'Notifications', badge: true },
// //         ],
// //       },
// //       {
// //         label: { ar: 'الإعدادات', en: 'SETTINGS' },
// //         items: [
// //           { to: '/company/profile',  icon: UserCircle, ar: 'ملف الشركة', en: 'Company Profile' },
// //           { to: '/company/settings', icon: Settings,   ar: 'الإعدادات',  en: 'Settings'        },
// //         ],
// //       },
// //     ];
// //   }
// //   // غير مفعّل — فقط Profile + Settings
// //   return [
// //     {
// //       label: { ar: 'الحساب', en: 'ACCOUNT' },
// //       items: [
// //         { to: '/company/profile',       icon: UserCircle, ar: 'ملف الشركة', en: 'Company Profile' },
// //         { to: '/company/notifications', icon: Bell,       ar: 'الإشعارات',  en: 'Notifications', badge: true },
// //         { to: '/company/settings',      icon: Settings,   ar: 'الإعدادات',  en: 'Settings'        },
// //       ],
// //     },
// //   ];
// // };

// // // Mobile bottom nav — يتغير حسب الحالة
// // const getMobileNav = (isActive) => {
// //   if (isActive) {
// //     return [
// //       { to: '/company/dashboard',     icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Home'        },
// //       { to: '/company/jobs',          icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs'        },
// //       { to: '/company/applicants',    icon: Users,           ar: 'المتقدمون', en: 'Applicants'  },
// //       { to: '/company/notifications', icon: Bell,            ar: 'الإشعارات', en: 'Alerts', badge: true },
// //       { to: '/company/profile',       icon: UserCircle,      ar: 'الملف',     en: 'Profile'     },
// //     ];
// //   }
// //   return [
// //     { to: '/company/profile',       icon: UserCircle, ar: 'الملف',     en: 'Profile'     },
// //     { to: '/company/notifications', icon: Bell,        ar: 'الإشعارات', en: 'Alerts', badge: true },
// //     { to: '/company/settings',      icon: Settings,    ar: 'الإعدادات', en: 'Settings'    },
// //   ];
// // };

// // // ════════════════════════════════════════════════════════════
// // //  HELPERS
// // // ════════════════════════════════════════════════════════════
// // function Avatar({ name, url, size = 34 }) {
// //   const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
// //   if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }} />;
// //   return (
// //     <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 800, color: 'var(--text-primary)', flexShrink: 0, userSelect: 'none' }}>
// //       {initials}
// //     </div>
// //   );
// // }

// // function NavItem({ item, isAr, collapsed, pathname, unread = 0 }) {
// //   const Icon = item.icon;
// //   const isExact = item.to === '/company/dashboard';
// //   const active  = isExact ? pathname === item.to : pathname.startsWith(item.to);
// //   const badge   = item.badge ? unread : 0;
// //   const font    = isAr ? 'var(--font-ar)' : 'var(--font-en)';

// //   return (
// //     <Link to={item.to} title={collapsed ? (isAr ? item.ar : item.en) : undefined} style={{
// //       display: 'flex', alignItems: 'center',
// //       gap: collapsed ? 0 : 10,
// //       padding: collapsed ? '10px 0' : '8px 11px',
// //       justifyContent: collapsed ? 'center' : 'flex-start',
// //       borderRadius: 10, textDecoration: 'none',
// //       background: active ? 'var(--bg-secondary)' : 'transparent',
// //       border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
// //       color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
// //       fontSize: 13, fontWeight: active ? 700 : 500,
// //       transition: 'all 0.15s', marginBottom: 1,
// //       position: 'relative', fontFamily: font,
// //     }}
// //       onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg-secondary)'; e.currentTarget.style.color='var(--text-primary)'; }}}
// //       onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}}>
// //       <div style={{ position: 'relative', flexShrink: 0 }}>
// //         <Icon size={17} strokeWidth={active ? 2.2 : 1.7} />
// //         {badge > 0 && (
// //           <div style={{ position: 'absolute', top: -5, insetInlineEnd: -5, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>
// //             {badge > 9 ? '9+' : badge}
// //           </div>
// //         )}
// //       </div>
// //       {!collapsed && (
// //         <>
// //           <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //             {isAr ? item.ar : item.en}
// //           </span>
// //           {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', flexShrink: 0 }} />}
// //         </>
// //       )}
// //       {/* Active left bar */}
// //       {active && !collapsed && <div style={{ position: 'absolute', insetInlineStart: 0, top: '25%', bottom: '25%', width: 3, borderRadius: 99, background: 'var(--text-primary)' }} />}
// //     </Link>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // //  DESKTOP SIDEBAR
// // // ════════════════════════════════════════════════════════════
// // export default function CompanySidebar({ collapsed, setCollapsed }) {
// //   const { lang }        = useLangStore();
// //   const { user, logout } = useAuthStore();
// //   const location        = useLocation();
// //   const navigate        = useNavigate();
// //   const isAr = lang === 'ar';
// //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

// //   const [unread, setUnread] = useState(0);
// //   const { company }         = useCompany(); // من CompanyLayout context

// //   useEffect(() => {
// //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// //       const list = data.data?.notifications || data.data || [];
// //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : (data.data?.unread || 0));
// //     }).catch(() => {});
// //   }, []);

// //   const handleLogout = async () => {
// //     try { await api.post('/auth/logout'); } catch {}
// //     logout();
// //     navigate('/login');
// //   };

// //   const W = collapsed ? 64 : 228;

// //   return (
// //     <aside style={{
// //       width: W, minWidth: W, height: '100vh', position: 'sticky', top: 0,
// //       background: 'var(--bg-primary)', borderInlineEnd: '1px solid var(--border)',
// //       display: 'flex', flexDirection: 'column', overflow: 'hidden',
// //       transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s',
// //       fontFamily: font, zIndex: 50,
// //       // Hide on mobile
// //     }} className="co-sidebar">
// //       <style>{`
// //         @media(max-width:1023px){ .co-sidebar{display:none!important} }
// //         ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
// //       `}</style>

// //       {/* ── Logo row ── */}
// //       <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
// //         {!collapsed && (
// //           <Link to="/company/dashboard" style={{ textDecoration: 'none' }}>
// //             <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
// //           </Link>
// //         )}
// //         <button onClick={() => setCollapsed(!collapsed)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
// //           onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
// //           onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
// //           {isAr
// //             ? (collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />)
// //             : (collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />)
// //           }
// //         </button>
// //       </div>

// //       {/* ── Company pill ── */}
// //       {!collapsed ? (
// //         <div style={{ margin: '10px 8px 2px', padding: '10px 11px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
// //             <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
// //               {company?.logoUrl
// //                 ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                 : <Briefcase size={15} color="var(--text-secondary)" />
// //               }
// //             </div>
// //             <div style={{ minWidth: 0, flex: 1 }}>
// //               <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                 {company?.name || user?.fullName || '—'}
// //               </p>
// //               <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
// //                 {isAr ? 'مسؤول الشركة' : 'Company Admin'}
// //               </p>
// //             </div>
// //           </div>
// //           {/* Post Job quick button */}
// //           {company?.status === 'active' ? (
// //             <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: font, transition: 'all .15s' }}
// //               onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
// //               onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
// //               <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة' : 'Post a Job'}
// //             </Link>
// //           ) : (
// //             <div title={isAr ? 'يتطلب موافقة الإدارة' : 'Requires admin approval'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '7px', borderRadius: 8, border: '1px dashed var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, fontFamily: font, cursor: 'not-allowed', opacity: 0.6 }}>
// //               <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة 🔒' : 'Post a Job 🔒'}
// //             </div>
// //           )}
// //         </div>
// //       ) : (
// //         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '10px 0 2px', flexShrink: 0 }}>
// //           <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
// //             {company?.logoUrl ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Briefcase size={15} color="var(--text-secondary)" />}
// //           </div>
// //           {company?.status === 'active' ? (
// //             <Link to="/company/jobs/new" title={isAr ? 'نشر وظيفة' : 'Post a Job'} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all .15s' }}
// //               onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currenturrent.style.color='var(--text-primary)'; }}
// //               onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
// //               <Plus size={13} strokeWidth={2.5} />
// //             </Link>
// //           ) : (
// //             <div title={isAr ? 'يتطلب موافقة' : 'Requires approval'} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'not-allowed', opacity: 0.5 }}>
// //               <Plus size={13} strokeWidth={2.5} />
// //             </div>
// //           )}
// //         </div>
// //       )}

// //       {/* ── Nav groups ── */}
// //       <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
// //         {getNavGroups(company?.status === 'active').map((group, gi) => (
// //           <div key={gi} style={{ marginBottom: 4 }}>
// //             {/* Group label */}
// //             {!collapsed && (
// //               <p style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', opacity: .5, textTransform: 'uppercase', letterSpacing: '0.08em', margin: gi === 0 ? '6px 11px 4px' : '10px 11px 4px', fontFamily: 'var(--font-en)' }}>
// //                 {isAr ? group.label.ar : group.label.en}
// //               </p>
// //             )}
// //             {!collapsed && gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 8px 8px', opacity: .5 }} />}
// //             {group.items.map(item => (
// //               <NavItem key={item.to} item={item} isAr={isAr} collapsed={collapsed} pathname={location.pathname} unread={unread} />
// //             ))}
// //           </div>
// //         ))}
// //       </nav>

// //       {/* ── Logout ── */}
// //       <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
// //         <button onClick={handleLogout} title={collapsed ? (isAr ? 'تسجيل الخروج' : 'Logout') : undefined}
// //           style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '10px 0' : '8px 11px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, fontWeight: 500, transition: 'all .15s' }}
// //           onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444'; }}
// //           onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
// //           <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
// //           {!collapsed && (isAr ? 'تسجيل الخروج' : 'Logout')}
// //         </button>
// //       </div>
// //     </aside>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // //  MOBILE TOP BAR
// // // ════════════════════════════════════════════════════════════
// // export function CompanyTopBar({ title }) {
// //   const { lang } = useLangStore();
// //   const isAr = lang === 'ar';
// //   const [unread, setUnread] = useState(0);

// //   useEffect(() => {
// //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// //       const list = data.data?.notifications || data.data || [];
// //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
// //     }).catch(() => {});
// //   }, []);

// //   return (
// //     <div className="co-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', flexShrink: 0 }}>
// //       <style>{`@media(max-width:1023px){.co-topbar{display:flex!important}}`}</style>
// //       <Link to="/company/dashboard" style={{ textDecoration: 'none' }}>
// //         <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
// //       </Link>
// //       <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>{title}</p>
// //       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //         <Link to="/company/jobs/new" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
// //           <Plus size={16} />
// //         </Link>
// //         <Link to="/company/notifications" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
// //           <Bell size={16} />
// //           {unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{unread > 9 ? '9+' : unread}</div>}
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // //  MOBILE BOTTOM NAV
// // // ════════════════════════════════════════════════════════════
// // export function CompanyBottomNav() {
// //   const { lang } = useLangStore();
// //   const location = useLocation();
// //   const isAr = lang === 'ar';
// //   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
// //   const [unread, setUnread] = useState(0);
// //   const { company } = useCompany();

// //   useEffect(() => {
// //     api.get('/users/me/notifications?limit=1').then(({ data }) => {
// //       const list = data.data?.notifications || data.data || [];
// //       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
// //     }).catch(() => {});
// //   }, []);

// //   return (
// //     <nav className="co-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '6px 4px calc(6px + env(safe-area-inset-bottom))', fontFamily: font }}>
// //       <style>{`@media(max-width:1023px){.co-bottom-nav{display:flex!important}}`}</style>
// //       {getMobileNav(company?.status === 'active').map(item => {
// //         const Icon    = item.icon;
// //         const isExact = item.to === '/company/dashboard';
// //         const active  = isExact ? location.pathname === item.to : location.pathname.startsWith(item.to);
// //         const badge   = item.badge ? unread : 0;
// //         return (
// //           <Link key={item.to} to={item.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', padding: '5px 2px', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 9.5, fontWeight: active ? 700 : 500, fontFamily: font, position: 'relative' }}>
// //             <div style={{ position: 'relative' }}>
// //               <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
// //               {badge > 0 && <div style={{ position: 'absolute', top: -5, right: -5, minWidth: 14, height: 14, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{badge > 9 ? '9+' : badge}</div>}
// //             </div>
// //             <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{isAr ? item.ar : item.en}</span>
// //             {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, borderRadius: 99, background: 'var(--text-primary)' }} />}
// //           </Link>
// //         );
// //       })}
// //     </nav>
// //   );
// // }

// 'use strict';
// // frontend/src/pages/Company/CompanySidebar.jsx
// // ════════════════════════════════════════════════════════════
// // كل التابات تظهر دائماً.
// // لو الشركة غير active → التابات المحمية تكون مقفلة بصرياً (Lock)
// // مع tooltip عند hover "بانتظار موافقة الإدارة"
// // Profile أول تاب — لا يوجد صندوق Post a Job
// // مجموعات قابلة للطي (collapsible) كتصميم الأدمن
// // ════════════════════════════════════════════════════════════

// import { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Briefcase, Users, Bell, UserCircle,
//   LogOut, ChevronLeft, ChevronRight, BarChart2,
//   Layers, Settings, Lock,
// } from 'lucide-react';
// import useAuthStore  from '../../store/authStore';
// import useLangStore  from '../../i18n';
// import api           from '../../services/api';
// import { useCompany } from './CompanyLayout';
// import LogoGold      from '../../assets/images/LogoGold.png';

// // ════════════════════════════════════════════════════════════
// //  NAV CONFIG — Profile أولاً، المحمية تُعلَّم locked: true
// // ════════════════════════════════════════════════════════════
// const NAV_GROUPS = [
//   {
//     key: 'account',
//     label: { ar: 'الحساب', en: 'ACCOUNT' },
//     items: [
//       { to: '/company/profile',       icon: UserCircle, ar: 'ملف الشركة', en: 'Company Profile' },
//       { to: '/company/notifications', icon: Bell,        ar: 'الإشعارات',  en: 'Notifications', badge: true , locked: true },
//     ],
//   },
//   {
//     key: 'main',
//     label: { ar: 'الرئيسي', en: 'MAIN' },
//     items: [
//       { to: '/company/dashboard',  icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Overview',   locked: true },
//       { to: '/company/jobs',       icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs',       locked: true },
//       { to: '/company/applicants', icon: Users,           ar: 'المتقدمون', en: 'Applicants', locked: true },
//       { to: '/company/pipeline',   icon: Layers,          ar: 'Pipeline',  en: 'Pipeline',   locked: true },
//     ],
//   },
//   {
//     key: 'insights',
//     label: { ar: 'التقارير', en: 'INSIGHTS' },
//     items: [
//       { to: '/company/analytics', icon: BarChart2, ar: 'التحليلات', en: 'Analytics', locked: true },
//     ],
//   },
//   {
//     key: 'settings',
//     label: { ar: 'الإعدادات', en: 'SETTINGS' },
//     items: [
//       { to: '/company/settings', icon: Settings, ar: 'الإعدادات', en: 'Settings' },
//     ],
//   },
// ];

// const MOBILE_NAV = [
//   { to: '/company/profile',       icon: UserCircle,      ar: 'الملف',     en: 'Profile'   },
//   { to: '/company/dashboard',     icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Home',      locked: true },
//   { to: '/company/jobs',          icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs',      locked: true },
//   { to: '/company/applicants',    icon: Users,           ar: 'المتقدمون', en: 'Applicants',locked: true },
//   { to: '/company/notifications', icon: Bell,            ar: 'الإشعارات', en: 'Alerts', badge: true },
// ];

// const LOCK_MSG = {
//   ar: '🔒 بانتظار موافقة الإدارة',
//   en: '🔒 Pending admin approval',
// };

// // ════════════════════════════════════════════════════════════
// //  NAV ITEM — يدعم حالة القفل
// // ════════════════════════════════════════════════════════════
// function NavItem({ item, isAr, collapsed, pathname, unread, isActive }) {
//   const Icon      = item.icon;
//   const isExact   = item.to === '/company/dashboard';
//   const active    = isExact ? pathname === item.to : pathname.startsWith(item.to);
//   const badge     = item.badge ? unread : 0;
//   const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   const isLocked  = item.locked && !isActive;
//   const [hover, setHover] = useState(false);

//   // خلفية الزر: active له خلفية ثابتة، غير active له خلفية فقط عند hover (لو غير مقفول)
//   const bg = active && !isLocked
//     ? 'var(--bg-secondary)'
//     : (!isLocked && hover ? 'var(--bg-secondary)' : 'transparent');

//   const content = (
//     <div
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       style={{
//         display: 'flex', alignItems: 'center',
//         gap: collapsed ? 0 : 10,
//         padding: collapsed ? '10px 0' : '8px 11px',
//         justifyContent: collapsed ? 'center' : 'flex-start',
//         borderRadius: 10,
//         background: bg,
//         border: `1px solid ${active && !isLocked ? 'var(--border)' : 'transparent'}`,
//         color: isLocked ? 'var(--text-secondary)' : (active || hover ? 'var(--text-primary)' : 'var(--text-secondary)'),
//         fontSize: 13, fontWeight: active && !isLocked ? 700 : 500,
//         transition: 'all 0.15s', marginBottom: 1,
//         position: 'relative', fontFamily: font,
//         opacity: isLocked ? 0.5 : 1,
//         cursor: isLocked ? 'not-allowed' : 'pointer',
//       }}
//     >
//       <div style={{ position: 'relative', flexShrink: 0 }}>
//         <Icon size={17} strokeWidth={active && !isLocked ? 2.2 : 1.7} />
//         {badge > 0 && !isLocked && (
//           <div style={{ position: 'absolute', top: -5, insetInlineEnd: -5, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>
//             {badge > 9 ? '9+' : badge}
//           </div>
//         )}
//         {isLocked && (
//           <div style={{ position: 'absolute', top: -4, insetInlineEnd: -4, width: 12, height: 12, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
//             <Lock size={7} strokeWidth={2.5} />
//           </div>
//         )}
//       </div>
//       {!collapsed && (
//         <>
//           <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//             {isAr ? item.ar : item.en}
//           </span>
//           {active && !isLocked && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', flexShrink: 0 }} />}
//         </>
//       )}
//       {active && !isLocked && !collapsed && (
//         <div style={{ position: 'absolute', insetInlineStart: 0, top: '25%', bottom: '25%', width: 3, borderRadius: 99, background: 'var(--text-primary)' }} />
//       )}

//       {/* Tooltip لو مقفول */}
//       {isLocked && hover && (
//         <div style={{
//           position: 'absolute',
//           insetInlineStart: collapsed ? '110%' : 0,
//           top: collapsed ? '50%' : '110%',
//           transform: collapsed ? 'translateY(-50%)' : 'none',
//           background: '#524b4b', color: '#fff',
//           fontSize: 11.5, fontWeight: 600, padding: '6px 10px',
//           borderRadius: 8, whiteSpace: 'nowrap', zIndex: 200,
//           boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//           fontFamily: font, pointerEvents: 'none',
//           zIndex:'20px',
          
//         }}>
//           {isAr ? LOCK_MSG.ar : LOCK_MSG.en}
//         </div>
//       )}
//     </div>
//   );

//   if (isLocked) {
//     return <div title={isAr ? LOCK_MSG.ar : LOCK_MSG.en}>{content}</div>;
//   }

//   return (
//     <Link to={item.to} title={collapsed ? (isAr ? item.ar : item.en) : undefined} style={{ textDecoration: 'none', display: 'block' }}>
//       {content}
//     </Link>
//   );
// }

// // ════════════════════════════════════════════════════════════
// //  COLLAPSIBLE GROUP HEADER
// // ════════════════════════════════════════════════════════════
// function GroupHeader({ label, collapsed }) {
//   if (collapsed) return null;
//   return (
//     <p style={{
//       fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.5,
//       textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-en)',
//       margin: '6px 11px 4px', padding: 0,
//     }}>
//       {label}
//     </p>
//   );
// }

// // ════════════════════════════════════════════════════════════
// //  DESKTOP SIDEBAR
// // ════════════════════════════════════════════════════════════
// export default function CompanySidebar({ collapsed, setCollapsed }) {
//   const { lang }          = useLangStore();
//   const { user, logout }  = useAuthStore();
//   const location          = useLocation();
//   const navigate          = useNavigate();
//   const isAr = lang === 'ar';
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

//   const [unread, setUnread] = useState(0);
//   const { company }         = useCompany();
//   const isActive = company?.status === 'active';

//   useEffect(() => {
//     api.get('/users/me/notifications?limit=1').then(({ data }) => {
//       const list = data.data?.notifications || data.data || [];
//       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : (data.data?.unread || 0));
//     }).catch(() => {});
//   }, []);

//   const handleLogout = async () => {
//     try { await api.post('/auth/logout'); } catch {}
//     logout();
//     navigate('/login');
//   };

//   const W = collapsed ? 64 : 228;

//   return (
//     <aside style={{
//       width: W, minWidth: W, height: '100vh', position: 'sticky', top: 0,
//       background: 'var(--bg-primary)', borderInlineEnd: '1px solid var(--border)',
//       display: 'flex', flexDirection: 'column', overflow: 'hidden',
//       transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s',
//       fontFamily: font, zIndex: 50,
//     }} className="co-sidebar">
//       <style>{`
//         @media(max-width:1023px){ .co-sidebar{display:none!important} }
//         ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
//       `}</style>

//       {/* ── Logo row ── */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
//         {!collapsed && (
//           <Link to="/company/profile" style={{ textDecoration: 'none' }}>
//             <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
//           </Link>
//         )}
//         <button onClick={() => setCollapsed(!collapsed)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
//           onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
//           onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
//           {isAr
//             ? (collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />)
//             : (collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />)
//           }
//         </button>
//       </div>

//       {/* ── Company / user pill (بدون زر Post a Job) ── */}
//       <div style={{
//         margin: collapsed ? '10px auto' : '10px 8px 2px',
//         padding: collapsed ? 0 : '10px 11px',
//         borderRadius: 11,
//         background: collapsed ? 'transparent' : 'var(--bg-secondary)',
//         border: collapsed ? 'none' : '1px solid var(--border)',
//         flexShrink: 0,
//         display: 'flex', alignItems: 'center', gap: 9,
//         justifyContent: collapsed ? 'center' : 'flex-start',
//       }}>
//         <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
//           {company?.logoUrl
//             ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//             : <Briefcase size={15} color="var(--text-secondary)" />
//           }
//         </div>
//         {!collapsed && (
//           <div style={{ minWidth: 0, flex: 1 }}>
//             <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {company?.name || user?.fullName || '—'}
//             </p>
//             <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
//               {isAr ? 'مسؤول الشركة' : 'Company Admin'}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* ── Nav groups — قابلة للطي ── */}
//       <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
//         {NAV_GROUPS.map((group, gi) => (
//           <div key={group.key} style={{ marginBottom: 4 }}>
//             <GroupHeader
//               label={isAr ? group.label.ar : group.label.en}
//               collapsed={collapsed}
//             />
//             {!collapsed && gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 8px 6px', opacity: 0.5 }} />}
//             {group.items.map(item => (
//               <NavItem
//                 key={item.to} item={item} isAr={isAr} collapsed={collapsed}
//                 pathname={location.pathname} unread={unread} isActive={isActive}
//               />
//             ))}
//           </div>
//         ))}
//       </nav>

//       {/* ── Logout ── */}
//       <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
//         <button onClick={handleLogout} title={collapsed ? (isAr ? 'تسجيل الخروج' : 'Logout') : undefined}
//           style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '10px 0' : '8px 11px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, fontWeight: 500, transition: 'all .15s' }}
//           onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444'; }}
//           onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
//           <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
//           {!collapsed && (isAr ? 'تسجيل الخروج' : 'Logout')}
//         </button>
//       </div>
//     </aside>
//   );
// }

// // ════════════════════════════════════════════════════════════
// //  MOBILE TOP BAR
// // ════════════════════════════════════════════════════════════
// export function CompanyTopBar({ title }) {
//   const { lang } = useLangStore();
//   const isAr = lang === 'ar';
//   const [unread, setUnread] = useState(0);

//   useEffect(() => {
//     api.get('/users/me/notifications?limit=1').then(({ data }) => {
//       const list = data.data?.notifications || data.data || [];
//       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
//     }).catch(() => {});
//   }, []);

//   return (
//     <div className="co-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', flexShrink: 0 }}>
//       <style>{`@media(max-width:1023px){.co-topbar{display:flex!important}}`}</style>
//       <Link to="/company/profile" style={{ textDecoration: 'none' }}>
//         <img src={LogoGold} alt="TalexHub" style={{ height: 26, objectFit: 'contain' }} />
//       </Link>
//       <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>{title}</p>
//       <Link to="/company/notifications" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
//         <Bell size={16} />
//         {unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{unread > 9 ? '9+' : unread}</div>}
//       </Link>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// //  MOBILE BOTTOM NAV
// // ════════════════════════════════════════════════════════════
// export function CompanyBottomNav() {
//   const { lang } = useLangStore();
//   const location = useLocation();
//   const isAr = lang === 'ar';
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   const [unread, setUnread] = useState(0);
//   const { company } = useCompany();
//   const isActive = company?.status === 'active';

//   useEffect(() => {
//     api.get('/users/me/notifications?limit=1').then(({ data }) => {
//       const list = data.data?.notifications || data.data || [];
//       setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
//     }).catch(() => {});
//   }, []);

//   return (
//     <nav className="co-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '6px 4px calc(6px + env(safe-area-inset-bottom))', fontFamily: font }}>
//       <style>{`@media(max-width:1023px){.co-bottom-nav{display:flex!important}}`}</style>
//       {MOBILE_NAV.map(item => {
//         const Icon     = item.icon;
//         const isExact  = item.to === '/company/dashboard';
//         const active   = isExact ? location.pathname === item.to : location.pathname.startsWith(item.to);
//         const badge    = item.badge ? unread : 0;
//         const isLocked = item.locked && !isActive;

//         const inner = (
//           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 2px', color: isLocked ? 'var(--text-secondary)' : (active ? 'var(--text-primary)' : 'var(--text-secondary)'), fontSize: 9.5, fontWeight: active && !isLocked ? 700 : 500, fontFamily: font, position: 'relative', opacity: isLocked ? 0.45 : 1 }}>
//             <div style={{ position: 'relative' }}>
//               <Icon size={20} strokeWidth={active && !isLocked ? 2.2 : 1.6} />
//               {badge > 0 && !isLocked && <div style={{ position: 'absolute', top: -5, right: -5, minWidth: 14, height: 14, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{badge > 9 ? '9+' : badge}</div>}
//               {isLocked && <div style={{ position: 'absolute', top: -4, right: -4, width: 11, height: 11, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}><Lock size={6} strokeWidth={2.5} /></div>}
//             </div>
//             <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{isAr ? item.ar : item.en}</span>
//             {active && !isLocked && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, borderRadius: 99, background: 'var(--text-primary)' }} />}
//           </div>
//         );

//         return isLocked
//           ? <div key={item.to} title={isAr ? LOCK_MSG.ar : LOCK_MSG.en}>{inner}</div>
//           : <Link key={item.to} to={item.to} style={{ textDecoration: 'none', flex: 1 }}>{inner}</Link>;
//       })}
//     </nav>
//   );
// }

'use strict';
// frontend/src/pages/Company/CompanySidebar.jsx
// ════════════════════════════════════════════════════════════
// كل التابات تظهر دائماً.
// لو الشركة غير active → التابات المحمية تكون مقفلة بصرياً (Lock)
// مع tooltip عند hover "بانتظار موافقة الإدارة"
// Profile أول تاب — لا يوجد صندوق Post a Job
// مجموعات قابلة للطي (collapsible) كتصميم الأدمن
// ════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, Bell, UserCircle,
  LogOut, ChevronLeft, ChevronRight, BarChart2,
  Layers, Settings, Lock,
} from 'lucide-react';
import useAuthStore  from '../../store/authStore';
import useLangStore  from '../../i18n';
import api           from '../../services/api';
import { useCompany } from './CompanyLayout';
import LogoGold      from '../../assets/images/LogoGold.png';
import LogoIcon      from '../../assets/images/LogoIcon.png';

// ════════════════════════════════════════════════════════════
//  NAV CONFIG — Profile أولاً، المحمية تُعلَّم locked: true
// ════════════════════════════════════════════════════════════
const NAV_GROUPS = [
  {
    key: 'account',
    label: { ar: 'الحساب', en: 'ACCOUNT' },
    items: [
      { to: '/company/notifications', icon: Bell, ar: 'الإشعارات', en: 'Notifications', badge: true,locked: true },
    ],
  },
  {
    key: 'main',
    label: { ar: 'الرئيسي', en: 'MAIN' },
    items: [
      { to: '/company/dashboard',  icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Overview',   locked: true },
      { to: '/company/jobs',       icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs',       locked: true },
      { to: '/company/applicants', icon: Users,           ar: 'المتقدمون', en: 'Applicants', locked: true },
      { to: '/company/pipeline',   icon: Layers,          ar: 'Pipeline',  en: 'Pipeline',   locked: true },
    ],
  },
  {
    key: 'insights',
    label: { ar: 'التقارير', en: 'INSIGHTS' },
    items: [
      { to: '/company/analytics', icon: BarChart2, ar: 'التحليلات', en: 'Analytics', locked: true },
    ],
  },
  {
    key: 'settings',
    label: { ar: 'الإعدادات', en: 'SETTINGS' },
    items: [
      { to: '/company/settings', icon: Settings, ar: 'الإعدادات', en: 'Settings' },
    ],
  },
];

const MOBILE_NAV = [
  // { to: '/company/profile',       icon: UserCircle,      ar: 'الملف',     en: 'Profile'   },
  { to: '/company/dashboard',     icon: LayoutDashboard, ar: 'الرئيسية',  en: 'Home',      locked: true },
  { to: '/company/jobs',          icon: Briefcase,       ar: 'الوظائف',   en: 'Jobs',      locked: true },
  { to: '/company/applicants',    icon: Users,           ar: 'المتقدمون', en: 'Applicants',locked: true },
  { to: '/company/notifications', icon: Bell,            ar: 'الإشعارات', en: 'Alerts', badge: true },
];

const LOCK_MSG = {
  ar: '🔒 بانتظار موافقة الإدارة',
  en: '🔒 Pending admin approval',
};

// ════════════════════════════════════════════════════════════
//  NAV ITEM — يدعم حالة القفل
// ════════════════════════════════════════════════════════════
function NavItem({ item, isAr, collapsed, pathname, unread, isActive }) {
  const Icon      = item.icon;
  const isExact   = item.to === '/company/dashboard';
  const active    = isExact ? pathname === item.to : pathname.startsWith(item.to);
  const badge     = item.badge ? unread : 0;
  const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const isLocked  = item.locked && !isActive;
  const [hover, setHover] = useState(false);

  // خلفية الزر: active له خلفية ثابتة، غير active له خلفية فقط عند hover (لو غير مقفول)
  const bg = active && !isLocked
    ? 'var(--bg-secondary)'
    : (!isLocked && hover ? 'var(--bg-secondary)' : 'transparent');

  const content = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '10px 0' : '8px 11px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10,
        background: bg,
        border: `1px solid ${active && !isLocked ? 'var(--border)' : 'transparent'}`,
        color: isLocked ? 'var(--text-secondary)' : (active || hover ? 'var(--text-primary)' : 'var(--text-secondary)'),
        fontSize: 13, fontWeight: active && !isLocked ? 700 : 500,
        transition: 'all 0.15s', marginBottom: 1,
        position: 'relative', fontFamily: font,
        opacity: isLocked ? 0.5 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Icon size={17} strokeWidth={active && !isLocked ? 2.2 : 1.7} />
        {badge > 0 && !isLocked && (
          <div style={{ position: 'absolute', top: -5, insetInlineEnd: -5, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>
            {badge > 9 ? '9+' : badge}
          </div>
        )}
        {isLocked && (
          <div style={{ position: 'absolute', top: -4, insetInlineEnd: -4, width: 12, height: 12, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <Lock size={7} strokeWidth={2.5} />
          </div>
        )}
      </div>
      {!collapsed && (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAr ? item.ar : item.en}
          </span>
          {active && !isLocked && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', flexShrink: 0 }} />}
        </>
      )}
      {active && !isLocked && !collapsed && (
        <div style={{ position: 'absolute', insetInlineStart: 0, top: '25%', bottom: '25%', width: 3, borderRadius: 99, background: 'var(--text-primary)' }} />
      )}

      {/* Tooltip لو مقفول */}
      {isLocked && hover && (
        <div style={{
          position: 'absolute',
          insetInlineStart: collapsed ? '110%' : 0,
          top: collapsed ? '50%' : '110%',
          transform: collapsed ? 'translateY(-50%)' : 'none',
          background: '#1A1A1E', color: '#fff',
          fontSize: 11.5, fontWeight: 600, padding: '6px 10px',
          borderRadius: 8, whiteSpace: 'nowrap', zIndex: 200,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: font, pointerEvents: 'none',
        }}>
          {isAr ? LOCK_MSG.ar : LOCK_MSG.en}
        </div>
      )}
    </div>
  );

  if (isLocked) {
    return <div title={isAr ? LOCK_MSG.ar : LOCK_MSG.en}>{content}</div>;
  }

  return (
    <Link to={item.to} title={collapsed ? (isAr ? item.ar : item.en) : undefined} style={{ textDecoration: 'none', display: 'block' }}>
      {content}
    </Link>
  );
}

// ════════════════════════════════════════════════════════════
//  COLLAPSIBLE GROUP HEADER
// ════════════════════════════════════════════════════════════
function GroupHeader({ label, collapsed }) {
  if (collapsed) return null;
  return (
    <p style={{
      fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.5,
      textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-en)',
      margin: '6px 11px 4px', padding: 0,
    }}>
      {label}
    </p>
  );
}

// ════════════════════════════════════════════════════════════
//  DESKTOP SIDEBAR
// ════════════════════════════════════════════════════════════
export default function CompanySidebar({ collapsed, setCollapsed }) {
  const { lang }          = useLangStore();
  const { user, logout }  = useAuthStore();
  const location          = useLocation();
  const navigate          = useNavigate();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

  const [unread, setUnread] = useState(0);
  const { company }         = useCompany();
  const isActive = company?.status === 'active';

  useEffect(() => {
    api.get('/users/me/notifications?limit=1').then(({ data }) => {
      const list = data.data?.notifications || data.data || [];
      setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : (data.data?.unread || 0));
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    navigate('/login');
  };

  const W = collapsed ? 64 : 228;

  return (
    <aside style={{
      width: W, minWidth: W, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--bg-primary)', borderInlineEnd: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s',
      fontFamily: font, zIndex: 50,
    }} className="co-sidebar">
      <style>{`
        @media(max-width:1023px){ .co-sidebar{display:none!important} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
      `}</style>

      {/* ── Logo row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        

        <Link to="/" style={{ textDecoration: 'none' }}>
  <img 
    src={!collapsed ? LogoGold : LogoIcon} 
    alt="TalexHub" 
    style={{ height: !collapsed ? 48 : 48, objectFit: 'contain' }} 
  />
</Link>
        <button onClick={() => setCollapsed(!collapsed)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
          {isAr
            ? (collapsed ? <ChevronLeft size={13} /> : <ChevronRight size={13} />)
            : (collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />)
          }
        </button>
      </div>

      {/* ── Company pill — زر قابل للنقر يوديك لملف الشركة ── */}
      <Link to="/company/profile" style={{
        margin: collapsed ? '10px auto' : '10px 8px 2px',
        padding: collapsed ? 0 : '10px 11px',
        borderRadius: 11,
        background: collapsed ? 'transparent' : 'var(--bg-secondary)',
        border: collapsed ? 'none' : '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 9,
        justifyContent: collapsed ? 'center' : 'flex-start',
        textDecoration: 'none', cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
      }}
        onMouseEnter={e => { if (!collapsed) { e.currentTarget.style.borderColor = 'var(--text-primary)'; } }}
        onMouseLeave={e => { if (!collapsed) { e.currentTarget.style.borderColor = 'var(--border)'; } }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {company?.logoUrl
            ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Briefcase size={15} color="var(--text-secondary)" />
          }
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {company?.name || user?.fullName || '—'}
            </p>
            <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {isAr ? 'مسؤول الشركة' : 'Company Admin'}
            </p>
          </div>
        )}
      </Link>

      {/* ── Nav groups — قابلة للطي ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.key} style={{ marginBottom: 4 }}>
            <GroupHeader
              label={isAr ? group.label.ar : group.label.en}
              collapsed={collapsed}
            />
            {!collapsed && gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 8px 6px', opacity: 0.5 }} />}
            {group.items.map(item => (
              <NavItem
                key={item.to} item={item} isAr={isAr} collapsed={collapsed}
                pathname={location.pathname} unread={unread} isActive={isActive}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div style={{ padding: '8px 8px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={handleLogout} title={collapsed ? (isAr ? 'تسجيل الخروج' : 'Logout') : undefined}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, padding: collapsed ? '10px 0' : '8px 11px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, fontWeight: 500, transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-secondary)'; }}>
          <LogOut size={17} strokeWidth={1.7} style={{ flexShrink: 0 }} />
          {!collapsed && (isAr ? 'تسجيل الخروج' : 'Logout')}
        </button>
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════
//  MOBILE TOP BAR
// ════════════════════════════════════════════════════════════
export function CompanyTopBar({ title }) {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/users/me/notifications?limit=1').then(({ data }) => {
      const list = data.data?.notifications || data.data || [];
      setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
    }).catch(() => {});
  }, []);

  return (
    <div className="co-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', flexShrink: 0 }}>
      <style>{`@media(max-width:1023px){.co-topbar{display:flex!important}}`}</style>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <img src={LogoGold} alt="TalexHub" style={{ height: 38, objectFit: 'contain' }} />
      </Link>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>{title}</p>
      
      <Link to="/company/profile" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
       < UserCircle size={16} />
      </Link>
      <Link to="/company/notifications" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-secondary)' }}>
        <Bell size={16} />
        {unread > 0 && <div style={{ position: 'absolute', top: -4, right: -4, minWidth: 15, height: 15, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{unread > 9 ? '9+' : unread}</div>}
      </Link>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MOBILE BOTTOM NAV
// ════════════════════════════════════════════════════════════
export function CompanyBottomNav() {
  const { lang } = useLangStore();
  const location = useLocation();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [unread, setUnread] = useState(0);
  const { company } = useCompany();
  const isActive = company?.status === 'active';

  useEffect(() => {
    api.get('/users/me/notifications?limit=1').then(({ data }) => {
      const list = data.data?.notifications || data.data || [];
      setUnread(Array.isArray(list) ? list.filter(n => !n.isRead).length : 0);
    }).catch(() => {});
  }, []);

  return (
    <nav className="co-bottom-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '6px 4px calc(6px + env(safe-area-inset-bottom))', fontFamily: font }}>
      <style>{`@media(max-width:1023px){.co-bottom-nav{display:flex!important}}`}</style>
      {MOBILE_NAV.map(item => {
        const Icon     = item.icon;
        const isExact  = item.to === '/company/dashboard';
        const active   = isExact ? location.pathname === item.to : location.pathname.startsWith(item.to);
        const badge    = item.badge ? unread : 0;
        const isLocked = item.locked && !isActive;

        const inner = (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 2px', color: isLocked ? 'var(--text-secondary)' : (active ? 'var(--text-primary)' : 'var(--text-secondary)'), fontSize: 9.5, fontWeight: active && !isLocked ? 700 : 500, fontFamily: font, position: 'relative', opacity: isLocked ? 0.45 : 1 }}>
            <div style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={active && !isLocked ? 2.2 : 1.6} />
              {badge > 0 && !isLocked && <div style={{ position: 'absolute', top: -5, right: -5, minWidth: 14, height: 14, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: 'var(--font-en)', border: '1.5px solid var(--bg-primary)' }}>{badge > 9 ? '9+' : badge}</div>}
              {isLocked && <div style={{ position: 'absolute', top: -4, right: -4, width: 11, height: 11, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}><Lock size={6} strokeWidth={2.5} /></div>}
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{isAr ? item.ar : item.en}</span>
            {active && !isLocked && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, borderRadius: 99, background: 'var(--text-primary)' }} />}
          </div>
        );

        return isLocked
          ? <div key={item.to} title={isAr ? LOCK_MSG.ar : LOCK_MSG.en}>{inner}</div>
          : <Link key={item.to} to={item.to} style={{ textDecoration: 'none', flex: 1 }}>{inner}</Link>;
      })}
    </nav>
  );
}