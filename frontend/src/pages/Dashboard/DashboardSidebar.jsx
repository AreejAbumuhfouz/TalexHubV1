

'use strict';

import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, Mic, BookOpen,
  Users, Wallet, Settings, LogOut, ChevronLeft, ChevronRight,
  UserCircle, TrendingUp, Bell, Home, User, X, Check,
  Briefcase as BriefcaseIcon, CheckCheck, DollarSign,
  Star, Crown, Zap,CheckCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import LogoGold from '../../assets/images/LogoGold.png';
import LogoBlack from '../../assets/images/BlackLogo.png';
import LogoIcon from '../../assets/images/LogoIcon.png';
import { createPortal } from 'react-dom';
import useThemeStore from '../../store/themeStore';
/* ── nav items ─────────────────────────────────────────── */
const NAV = [
  { to: '/dashboard',      icon: LayoutDashboard, ar: 'الرئيسية',      en: 'Dashboard'    },
  { to: '/dashboard/cvs',  icon: FileText,        ar: 'سيرتي الذاتية', en: 'My CVs'       },
  { to: '/dashboard/jobs', icon: Briefcase,       ar: 'الوظائف',        en: 'Jobs'         },
  { to: '/interview',      icon: Mic,             ar: 'التدريب',         en: 'AI Interview' },
  { to: '/courses',        icon: BookOpen,        ar: 'الدورات',         en: 'Courses'      },
  { to: '/community',      icon: Users,           ar: 'المجتمع',         en: 'Community'    },
  { to: '/rooms',          icon: Mic,             ar: 'الغرف الصوتية',   en: 'Rooms'        },
  { to: '/career-path',    icon: TrendingUp,      ar: 'مساري المهني',    en: 'Career Path'  },
  { to: '/pricing',    icon: DollarSign,      ar: 'الأسعار',    en: 'Pricing'  },
  { to: '/wallet',         icon: Wallet,          ar: 'المحفظة',         en: 'Wallet'       },
];

const BOTTOM_NAV = [
  { to: '/dashboard/settings', icon: Settings, ar: 'الإعدادات', en: 'Settings' },
];

const MOBILE_NAV = [
  { to: '/community',      icon: LayoutDashboard, ar: 'الرئيسية', en: 'Home'      },
  { to: '/dashboard/jobs', icon: Briefcase,       ar: 'الوظائف',  en: 'Jobs'      },
  { to: '/interview',      icon: Mic,             ar: 'التدريب',   en: 'Interview' },
  { to: '/rooms',          icon: Users,           ar: 'الغرف',    en: 'Rooms'     },
  { to: '/career-path',    icon: TrendingUp,      ar: 'مساري المهني',    en: 'Career Path'  },
];

/* ── avatar ─────────────────────────────────────────────── */
function Avatar({ name, url, size = 32 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  if (url) return (
    <img src={url} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--text-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: 'var(--bg-primary)',
    }}>{initials}</div>
  );
}

function NotificationsContent({ notifications, loading, unread, markAllRead, timeAgo, isAr, onClose, isPanel = false }) {
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  
  return (
    <>
      {/* Header */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: isPanel ? '20px 20px 16px' : '12px 14px', 
        borderBottom: '1px solid var(--border)', 
        background: isPanel ? 'var(--bg-primary)' : 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: isPanel ? 18 : 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>
          {isAr ? 'الإشعارات' : 'Notifications'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {unread > 0 && (
            <button 
              onClick={markAllRead} 
              style={{ 
                fontSize: isPanel ? 12 : 11, 
                color: 'var(--text-secondary)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontFamily: font, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4,
                padding: '6px 10px',
                borderRadius: 8,
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <CheckCheck size={isPanel ? 14 : 12} /> {isAr ? 'قراءة الكل' : 'Mark all read'}
            </button>
          )}
          {isPanel && (
            <button 
              onClick={onClose}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            >
              <X size={16} color="var(--text-secondary)" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        padding: isPanel ? '8px 0' : '0',
      }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, fontFamily: font }}>
            <div style={{ 
              width: 32, height: 32, 
              border: '2px solid var(--border)', 
              borderTopColor: 'var(--text-primary)', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Bell size={isPanel ? 48 : 28} color="var(--text-secondary)" style={{ opacity: .2, margin: '0 auto 12px' }} />
            <p style={{ fontSize: isPanel ? 14 : 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
              {isAr ? 'لا توجد إشعارات' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          notifications.slice(0, isPanel ? 50 : 8).map((n, i) => {
            // Parse notification body to extract job title and company
            // const body = isAr ? (n.bodyAr || n.body) : n.body;
            const body = isAr ? (n.bodyAr || n.body || '') : (n.body || n.bodyAr || '');

            // const title = isAr ? (n.titleAr || n.title) : n.title;
            const title = isAr ? (n.titleAr || n.title || 'إشعار') : (n.title || n.titleAr || 'Notification');
            
            // Determine notification type for icon and color
            let icon = null;
            let iconColor = '#6366f1';
            let bgColor = 'rgba(99,102,241,0.08)';
            
            if (title.includes('تقديم') || title.includes('applied')) {
              icon = <BriefcaseIcon size={isPanel ? 18 : 14} />;
              iconColor = '#22C55E';
              bgColor = 'rgba(34,197,94,0.08)';
            } else if (title.includes('قبول') || title.includes('accepted')) {
              icon = <CheckCircle size={isPanel ? 18 : 14} />;
              iconColor = '#22C55E';
              bgColor = 'rgba(34,197,94,0.08)';
            } else if (title.includes('رفض') || title.includes('rejected')) {
              icon = <X size={isPanel ? 18 : 14} />;
              iconColor = '#EF4444';
              bgColor = 'rgba(239,68,68,0.08)';
            } else if (title.includes('interview') || title.includes('مقابلة')) {
              icon = <Mic size={isPanel ? 18 : 14} />;
              iconColor = '#F59E0B';
              bgColor = 'rgba(245,158,11,0.08)';
            } else {
              icon = <Bell size={isPanel ? 18 : 14} />;
              iconColor = '#6366f1';
              bgColor = 'rgba(99,102,241,0.08)';
            }
            
            return (
              <div 
                key={n.id || i} 
                style={{
                  padding: isPanel ? '16px 20px' : '12px 16px',
                  borderBottom: i < (isPanel ? notifications.length : Math.min(notifications.length, 8)) - 1 ? '1px solid var(--border)' : 'none',
                  background: !n.isRead ? bgColor : 'transparent',
                  display: 'flex', 
                  gap: 14, 
                  alignItems: 'flex-start',
                  transition: 'all .2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = !n.isRead ? bgColor : 'var(--bg-secondary)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = !n.isRead ? bgColor : 'transparent';
                }}
              >
                {/* Unread indicator dot */}
                {!n.isRead && (
                  <div style={{ 
                    position: 'absolute',
                    top: isPanel ? 20 : 16,
                    [isAr ? 'right' : 'left']: isPanel ? 20 : 16,
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: iconColor,
                  }} />
                )}
                
                {/* Icon circle */}
                <div style={{
                  width: isPanel ? 40 : 36,
                  height: isPanel ? 40 : 36,
                  borderRadius: '50%',
                  background: !n.isRead ? bgColor : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all .2s',
                }}>
                  <span style={{ color: iconColor }}>{icon}</span>
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                    <p style={{ 
                      fontSize: isPanel ? 14 : 13, 
                      fontWeight: n.isRead ? 500 : 700, 
                      color: 'var(--text-primary)', 
                      margin: 0, 
                      fontFamily: font, 
                      lineHeight: 1.4,
                      flex: 1,
                    }}>
                      {title}
                    </p>
                    <span style={{ 
                      fontSize: 11, 
                      color: 'var(--text-secondary)', 
                      flexShrink: 0, 
                      fontFamily: 'var(--font-en)',
                      whiteSpace: 'nowrap',
                    }}>
                      {timeAgo(n.sentAt || n.createdAt)}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: isPanel ? 13 : 12, 
                    color: 'var(--text-secondary)', 
                    margin: 0, 
                    fontFamily: font, 
                    lineHeight: 1.5,
                    opacity: n.isRead ? 0.8 : 1,
                  }}>
                    {body}
                  </p>
                  
                  {/* Action button (optional) */}
                  {n.actionUrl && (
                    <button 
                      onClick={() => window.location.href = n.actionUrl}
                      style={{
                        marginTop: 10,
                        padding: '5px 12px',
                        borderRadius: 6,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontFamily: font,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isAr ? 'عرض التفاصيل' : 'View details'}
                      <ChevronRight size={10} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function NotificationPanel({ isAr, collapsed }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(window.innerWidth > 1024);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Check screen size for panel vs dropdown
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrDesktop(window.innerWidth > 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update dropdown position when open
  useEffect(() => {
    if (open && buttonRef.current && !isTabletOrDesktop) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
  }, [open, isTabletOrDesktop]);

  // fetch notifications
  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me/notifications');
      const notifs = data.data?.notifications || [];
      setNotifications(notifs);
      setUnread(notifs.filter(n => !n.isRead).length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e) => {
      // Check if click is on the notification panel or button
      const panel = document.getElementById('notification-panel');
      const button = buttonRef.current;
      
      if (panel && !panel.contains(e.target) && button && !button.contains(e.target)) {
        setOpen(false);
      }
    };
    
    // Use setTimeout to avoid immediate close on open
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all').catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isAr ? 'الآن' : 'just now';
    if (mins < 60) return isAr ? `${mins}د` : `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return isAr ? `${hrs}س` : `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return isAr ? `${days}ي` : `${days}d`;
  };

  // ──────────────────────────────────────────────────────────
  // COLLAPSED MODE - using Portal
  // ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <>
        <div ref={buttonRef} style={{ position: 'relative', padding: '4px 8px' }}>
          <button
            onClick={() => { setOpen(p => !p); if (!open) fetchNotifs(); }}
            title={isAr ? 'الإشعارات' : 'Notifications'}
            style={{
              width: '100%', height: 38, borderRadius: 10,
              background: open ? 'var(--bg-secondary)' : 'transparent',
              border: `1.5px solid ${open ? 'var(--border)' : 'transparent'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all .2s',
            }}
            onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={16} strokeWidth={1.8} color="var(--text-secondary)" />
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: '#EF4444', border: '1.5px solid var(--bg-primary)',
              }} />
            )}
          </button>
        </div>

        {/* Portal for dropdown */}
        {open && createPortal(
          <div 
            id="notification-panel"
            style={{
              position: 'fixed',
              top: 120,
              left: 72,
              zIndex: 9999999,
              width: 360,
              maxHeight: 500,
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--border)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,.3)',
              animation: 'notifOpen .18s ease',
            }}
          >
            <NotificationsContent 
              notifications={notifications} 
              loading={loading} 
              unread={unread} 
              markAllRead={markAllRead} 
              timeAgo={timeAgo} 
              isAr={isAr} 
              onClose={() => setOpen(false)} 
              isPanel={false}
            />
          </div>,
          document.body
        )}
      </>
    );
  }

  // ──────────────────────────────────────────────────────────
  // TABLET & DESKTOP - RIGHT PANEL using Portal
  // ──────────────────────────────────────────────────────────
  if (isTabletOrDesktop && !collapsed) {
    return (
      <>
        {/* Trigger button */}
        <div ref={buttonRef} style={{ margin: '4px 10px', position: 'relative' }}>
          <button
            onClick={() => { setOpen(p => !p); if (!open) fetchNotifs(); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 11px', borderRadius: 10, cursor: 'pointer',
              background: open ? 'var(--bg-secondary)' : 'transparent',
              border: `1.5px solid ${open ? 'var(--border)' : 'transparent'}`,
              color: 'var(--text-secondary)', transition: 'all .2s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
            onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Bell size={16} strokeWidth={1.8} />
              {unread > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 99,
                  background: '#EF4444', border: '1.5px solid var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-en)',
                  padding: '0 3px',
                }}>{unread > 9 ? '9+' : unread}</div>
              )}
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textAlign: isAr ? 'right' : 'left', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
              {isAr ? 'الإشعارات' : 'Notifications'}
            </span>
            {unread > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, background: '#EF4444', color: '#fff', borderRadius: 99, padding: '1px 7px', fontFamily: 'var(--font-en)' }}>
                {unread}
              </span>
            )}
          </button>
        </div>

        {/* Portal for Right Panel */}
        {open && createPortal(
          <>
            {/* Backdrop overlay */}
            <div 
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9999998,
                backdropFilter: 'blur(3px)',
                animation: 'fadeIn .2s ease',
              }}
            />
            
            {/* Panel slide from right */}
            <div 
              id="notification-panel"
              style={{
                position: 'fixed',
                top: 0, right: 0,
                width: 'min(420px, 85vw)',
                height: '100vh',
                background: 'var(--bg-primary)',
                borderLeft: '1px solid var(--border)',
                boxShadow: '-8px 0 32px rgba(0,0,0,.2)',
                zIndex: 9999999,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn .25s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
              }}
            >
              <NotificationsContent 
                notifications={notifications} 
                loading={loading} 
                unread={unread} 
                markAllRead={markAllRead} 
                timeAgo={timeAgo} 
                isAr={isAr} 
                onClose={() => setOpen(false)} 
                isPanel={true}
              />
            </div>
          </>,
          document.body
        )}
      </>
    );
  }

  // ──────────────────────────────────────────────────────────
  // MOBILE - Dropdown using Portal
  // ──────────────────────────────────────────────────────────
  return (
    <>
      <div ref={buttonRef} style={{ margin: '4px 10px', position: 'relative' }}>
        <button
          onClick={() => { setOpen(p => !p); if (!open) fetchNotifs(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 11px', borderRadius: 10, cursor: 'pointer',
            background: open ? 'var(--bg-secondary)' : 'transparent',
            border: `1.5px solid ${open ? 'var(--border)' : 'transparent'}`,
            color: 'var(--text-secondary)', transition: 'all .2s',
          }}
          onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Bell size={16} strokeWidth={1.8} />
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 16, height: 16, borderRadius: 99,
                background: '#EF4444', border: '1.5px solid var(--bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-en)',
                padding: '0 3px',
              }}>{unread > 9 ? '9+' : unread}</div>
            )}
          </div>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textAlign: isAr ? 'right' : 'left', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
            {isAr ? 'الإشعارات' : 'Notifications'}
          </span>
          {unread > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: '#EF4444', color: '#fff', borderRadius: 99, padding: '1px 7px', fontFamily: 'var(--font-en)' }}>
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Portal for mobile dropdown */}
      {open && createPortal(
        <div 
          id="notification-panel"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: 'min(360px, calc(100vw - 32px))',
            maxHeight: 400,
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,.25)',
            zIndex: 9999999,
            animation: 'notifOpen .18s ease',
          }}
        >
          <NotificationsContent 
            notifications={notifications} 
            loading={loading} 
            unread={unread} 
            markAllRead={markAllRead} 
            timeAgo={timeAgo} 
            isAr={isAr} 
            onClose={() => setOpen(false)} 
            isPanel={false}
          />
        </div>,
        document.body
      )}
    </>
  );
}
/* ══════════════════════════════════════════════════════════
   DESKTOP SIDEBAR
══════════════════════════════════════════════════════════ */
export default function DashboardSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { lang,dir } = useLang();
  const isAr = lang === 'ar';
  const isRtl = dir === 'rtl';
  const { theme } = useThemeStore();


  const { user, logout } = useAuthStore();

  // ── Plan config ──────────────────────────────────────────
  const PLAN_CFG = {
    free:  { color: '#6B7280', Icon: Star,  ar: 'مجاني',   en: 'Free'  },
    pro:   { color: '#8B5CF6', Icon: Crown, ar: 'Pro',      en: 'Pro'   },
    elite: { color: '#F59E0B', Icon: Zap,   ar: 'Elite',    en: 'Elite' },
  };
  const planKey  = user?.planKey || 'free';
  const plan     = PLAN_CFG[planKey] || PLAN_CFG.free;
  const PlanIcon = plan.Icon;

  // ── Live points — fetched once, refreshed every 60s ─────
  const [walletPts, setWalletPts] = useState(null);

  const fetchPts = async () => {
    try {
      const { data } = await api.get('/wallet/me');
      setWalletPts(parseInt(data.data?.pointsBalance || 0));
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchPts();
    const interval = setInterval(fetchPts, 60_000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (to) =>
    to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(to);

  const isProfileActive =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/dashboard/profile');

  // ── Resizable sidebar ──
  const MIN_W = 140;
  const MAX_W = 440;
  const COLLAPSED_W = 64;
  const DEFAULT_W = 228;

  const [sidebarW, setSidebarW] = useState(() => {
    try { return parseInt(localStorage.getItem('sidebar_width') || DEFAULT_W); } catch { return DEFAULT_W; }
  });
  const [isResizing, setIsResizing] = useState(false);

  const w = collapsed ? COLLAPSED_W : sidebarW;

  const startResize = (e) => {
    if (collapsed) return;
    e.preventDefault();
    setIsResizing(true);
    document.body.classList.add('resizing');
    const startX = e.clientX;
    const startW = sidebarW;

    const onMove = (ev) => {
      const delta = isAr ? startX - ev.clientX : ev.clientX - startX;
      const newW = Math.max(MIN_W, Math.min(MAX_W, startW + delta));
      setSidebarW(newW);
    };

    const onUp = () => {
      setIsResizing(false);
      setSidebarW(prev => {
        try { localStorage.setItem('sidebar_width', String(prev)); } catch {}
        if (prev < MIN_W + 20) { setCollapsed(true); return DEFAULT_W; }
        return prev;
      });
      document.body.classList.remove('resizing');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const navItem = (item) => {
    const active = isActive(item.to);
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        title={collapsed ? (isAr ? item.ar : item.en) : undefined}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: collapsed ? '10px 0' : '9px 11px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10, marginBottom: 2,
          textDecoration: 'none',
          background: active ? 'var(--bg-secondary)' : 'transparent',
          // border: `1.5px solid ${active ? 'var(--border)' : 'transparent'}`,
          borderLeft: !isRtl && active ? '2px solid var(--text-primary)' : !isRtl ? '2px solid transparent' : undefined,
          borderRight: isRtl && active ? '2px solid var(--text-primary)' : isRtl ? '2px solid transparent' : undefined,
                         
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'all 0.2s ease', position: 'relative',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
      >
        {/* {active && (
          <div style={{ position: 'absolute', insetInlineStart: 0, top: '18%', bottom: '18%', width: 3, borderRadius: 99, background: 'var(--text-primary)' }} />
        )} */}
        <Icon size={16} strokeWidth={active ? 2.3 : 1.8} style={{ flexShrink: 0, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
        {!collapsed && (
          <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap', lineHeight: 1, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
            {isAr ? item.ar : item.en}
          </span>
        )}
      </Link>
    );
  };

 
const animationStyles = `
  @keyframes notifOpen { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0.6; }
  }
  
  /* Hover effect for notification items */
  .notification-item {
    transition: all 0.2s ease;
  }
  .notification-item:hover {
    transform: translateX(4px);
  }
  
  body.resizing { cursor: col-resize !important; user-select: none !important; }
  
  @media (max-width: 1024px) { .dash-sidebar { display: none !important; } }
  .dash-sidebar ::-webkit-scrollbar { width: 4px; }
  .dash-sidebar ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  .profile-pill { transition: background 0.2s ease, border-color 0.2s ease; }
  .profile-pill:hover { background: var(--bg-primary) !important; border-color: var(--text-primary) !important; }
  .avatar-collapsed { transition: border-color 0.2s ease; }
  .avatar-collapsed:hover > div { border-color: var(--text-primary) !important; }
`;
  return (
    <>
      <style>{animationStyles}</style>

      <nav
        className="dash-sidebar"
        role="navigation"
        aria-label={isAr ? 'القائمة الرئيسية' : 'Main navigation'}
        style={{
          width: w, height: '100vh', flexShrink: 0,
          background: 'var(--bg-primary)',
          borderInlineEnd: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          transition: isResizing ? 'none' : 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
          position: 'sticky', top: 0, overflow: 'hidden',
          userSelect: isResizing ? 'none' : 'auto',
        }}
      >
        {/* Resize handle */}
        {!collapsed && (
          <div
            onMouseDown={startResize}
            title={isAr ? 'اسحب لتغيير الحجم' : 'Drag to resize'}
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              [isAr ? 'left' : 'right']: -3,
              width: 6,
              zIndex: 50,
              cursor: 'col-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.querySelector('.rh').style.opacity = '1'; }}
            onMouseLeave={e => { if (!isResizing) e.currentTarget.querySelector('.rh').style.opacity = '0'; }}
          >
            <div className="rh" style={{
              width: 3, height: 48,
              borderRadius: 99,
              background: 'var(--text-primary)',
              opacity: isResizing ? 1 : 0,
              transition: 'opacity .2s',
            }} />
          </div>
        )}
        
        {/* Logo */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: collapsed ? '0' : '0 16px', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--border)', flexShrink: 0, position: 'relative' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            {/* <img src={collapsed ? LogoIcon : LogoGold} alt="TalexHub" style={{ height: collapsed ? 38 : 48, width: '100%', objectFit: 'contain', transition: 'height 0.2s ease' }} /> */}
        <img src={collapsed ? LogoIcon : (theme === 'light' ? LogoBlack : LogoGold)} 
  style={{ height: collapsed ? 38 : 48, width: '100%', objectFit: 'contain', transition: 'height 0.2s ease' }} />
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar" style={{ width: 24, height: 24, borderRadius: 6, cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar" style={{ width: 24, height: 24, borderRadius: 6, cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease', position: 'absolute', insetInlineEnd: -12, top: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
        </div>

        {/* ── User pill — Desktop EXPANDED ── */}
        {!collapsed ? (
          <Link
            to="/profile"
            className="profile-pill"
            title={isAr ? 'ملفي الشخصي' : 'My Profile'}
            aria-current={isProfileActive ? 'page' : undefined}
            style={{
              margin: '12px 10px 4px',
              padding: '10px 11px',
              borderRadius: 12,
              background: isProfileActive ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              border: `1px solid ${isProfileActive ? 'var(--text-primary)' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              textDecoration: 'none',
              transition: 'all .2s',
            }}
          >
            <Avatar name={user?.fullName} url={user?.avatarUrl} size={30} />
            <div style={{ minWidth: 0, flex: 1 }}>
              {/* Name + plan badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <p style={{
                  fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)',
                  margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', flex: 1, minWidth: 0,
                }}>
                  {user?.fullName || '—'}
                </p>
                {planKey !== 'free' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '1px 6px', borderRadius: 99, flexShrink: 0,
                    background: `${plan.color}18`, border: `1px solid ${plan.color}30`,
                  }}>
                    <PlanIcon size={9} color={plan.color} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: plan.color, fontFamily: 'var(--font-en)' }}>
                      {plan.en}
                    </span>
                  </span>
                )}
              </div>
              {/* Points row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={11} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-en)', letterSpacing: '-0.02em' }}>
                  {walletPts !== null ? walletPts.toLocaleString() : '—'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                  {isAr ? 'نقطة' : 'pts'}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          /* ── User pill — Desktop COLLAPSED ── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 4px', gap: 4 }}>
            <Link
              to="/profile"
              className="avatar-collapsed"
              title={`${user?.fullName || ''} — ${walletPts !== null ? walletPts.toLocaleString() : '—'} pts`}
              style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
            >
              <div style={{
                borderRadius: '50%', padding: 2,
                border: `2px solid ${isProfileActive ? 'var(--text-primary)' : 'transparent'}`,
                transition: 'border-color 0.2s ease',
              }}>
                <Avatar name={user?.fullName} url={user?.avatarUrl} size={32} />
              </div>
            </Link>
            {/* Points pill — visible even when collapsed */}
            <Link to="/wallet" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '3px 7px', borderRadius: 99,
                background: 'rgba(245,158,11,.12)',
                border: '1px solid rgba(245,158,11,.25)',
                cursor: 'pointer',
              }}>
                <Star size={9} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-en)', letterSpacing: '-0.01em' }}>
                  {walletPts !== null ? (walletPts >= 1000 ? `${(walletPts / 1000).toFixed(1)}K` : walletPts) : '—'}
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* NOTIFICATIONS — under profile */}
        <NotificationPanel isAr={isAr} collapsed={collapsed} />

        {/* Section label */}
        {!collapsed && (
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 18px 4px', margin: 0, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
            {isAr ? 'القائمة' : 'Menu'}
          </p>
        )}

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 8px' }}>
          {NAV.map(navItem)}
        </div>

        {/* Bottom */}
        <div style={{ padding: '6px 8px 14px', borderTop: '1px solid var(--border)' }}>
          {BOTTOM_NAV.map(navItem)}
          <button onClick={logout} title={collapsed ? (isAr ? 'تسجيل الخروج' : 'Logout') : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: collapsed ? '10px 0' : '9px 11px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, background: 'transparent', border: '1.5px solid transparent', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s ease', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FECACA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}>
            <LogOut size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </nav>
    </>
  );
}

export function MobileTopBar({ title }) {
  const { lang } = useLang();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loadingN, setLoadingN] = useState(false);

  const [mobilePts, setMobilePts] = useState(null);
  useEffect(() => {
    api.get('/wallet/me').then(({ data }) => {
      setMobilePts(parseInt(data.data?.pointsBalance || 0));
    }).catch(() => {});
  }, []);

  const notifRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const avatarDropdownRef = useRef(null);

  const fetchNotifs = async () => {
    setLoadingN(true);
    try {
      const { data } = await api.get('/users/me/notifications');
      const notifs = data.data?.notifications || [];
      setNotifications(notifs);
      setUnread(notifs.filter(n => !n.isRead).length);
    } catch { /* silent */ }
    finally { setLoadingN(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (avatarBtnRef.current && !avatarBtnRef.current.contains(e.target) && 
          avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/users/me/notifications/read-all').catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isAr ? 'الآن' : 'now';
    if (mins < 60) return isAr ? `${mins}د` : `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return isAr ? `${hrs}س` : `${hrs}h`;
    return isAr ? `${Math.floor(hrs/24)}ي` : `${Math.floor(hrs/24)}d`;
  };

  const AVATAR_MENU = [
    { icon: Home,      ar: 'الرئيسية',     en: 'Dashboard',    to: '/dashboard'           },
    { icon: User,      ar: 'الملف الشخصي', en: 'Profile',      to: '/profile'            },
    { icon: FileText,  ar: 'سيرتي الذاتية', en: 'My CVs',      to: '/dashboard/cvs'       },
    { icon: BookOpen,  ar: 'الدورات',       en: 'Courses',      to: '/courses'            },
    { icon: DollarSign,ar: 'الأسعار',       en: 'Pricing',      to: '/pricing'            },
    { icon: Wallet,    ar: 'المحفظة',       en: 'Wallet',       to: '/wallet'              },
    { icon: Settings,  ar: 'الإعدادات',     en: 'Settings',     to: '/dashboard/settings'  },
  ];

  // Calculate dropdown position based on button
  const getDropdownStyle = () => {
    if (avatarBtnRef.current) {
      const rect = avatarBtnRef.current.getBoundingClientRect();
      return {
        position: 'fixed',
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        width: 220,
      };
    }
    return {
      position: 'fixed',
      top: 60,
      right: 16,
      width: 220,
    };
  };

  return (
    <>
      <style>{`
        @keyframes notifOpen { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        @keyframes dropOpen  { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:none} }
        .dash-topbar { display: none !important; }
        @media (max-width: 1024px) { .dash-topbar { display: flex !important; } }
      `}</style>

      <div className="dash-topbar" style={{
        height: 64,
        alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 200,
        gap: 10,
        direction: 'ltr',
      }}>
        {/* Logo */}
        <img src={LogoGold} alt="TalexHub" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />

        {/* Points pill — mobile center */}
        <Link to="/wallet" style={{ textDecoration: 'none', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 99,
            background: 'rgba(245,158,11,.1)',
            border: '1px solid rgba(245,158,11,.25)',
          }}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-en)', letterSpacing: '-0.02em' }}>
              {mobilePts !== null ? mobilePts.toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(245,158,11,.7)', fontFamily: font }}>
              {isAr ? 'نقطة' : 'pts'}
            </span>
          </div>
        </Link>

        {/* Right side: notification + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Notification icon */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setNotifOpen(p => !p); setAvatarOpen(false); if (!notifOpen) fetchNotifs(); }}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: notifOpen ? 'var(--bg-secondary)' : 'transparent',
                border: `1.5px solid ${notifOpen ? 'var(--border)' : 'transparent'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'all .2s',
              }}
            >
              <Bell size={18} strokeWidth={1.8} color="var(--text-secondary)" />
              {unread > 0 && (
                <div style={{
                  position: 'absolute', top: 5, right: 5,
                  minWidth: 16, height: 16, borderRadius: 99,
                  background: '#EF4444', border: '1.5px solid var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-en)', padding: '0 3px',
                }}>{unread > 9 ? '9+' : unread}</div>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: 'fixed',
                top: 60,
                right: 16,
                width: 'min(340px, calc(100vw - 32px))',
                maxHeight: 420,
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--border)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,.3)',
                zIndex: 9999,
                animation: 'notifOpen .18s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>
                    {isAr ? 'الإشعارات' : 'Notifications'}
                  </span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {unread > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCheck size={11} /> {isAr ? 'قراءة الكل' : 'Mark read'}
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {loadingN ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12.5, fontFamily: font }}>
                      {isAr ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                      <Bell size={32} color="var(--text-secondary)" style={{ opacity: .2, margin: '0 auto 10px' }} />
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                        {isAr ? 'لا توجد إشعارات' : 'No notifications yet'}
                      </p>
                    </div>
                  ) : notifications.slice(0, 8).map((n, i) => (
                    <div key={n.id || i} style={{
                      padding: '11px 16px',
                      borderBottom: i < Math.min(notifications.length, 8) - 1 ? '1px solid var(--border)' : 'none',
                      background: !n.isRead ? 'rgba(99,102,241,.05)' : 'transparent',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 5 }} />}
                      <div style={{ flex: 1, minWidth: 0, paddingLeft: n.isRead ? 17 : 0 }}>
                        <p style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--text-primary)', margin: '0 0 2px', fontFamily: font, lineHeight: 1.4 }}>
                          {isAr ? (n.titleAr || n.title) : n.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.3 }}>
                          {isAr ? (n.bodyAr || n.body) : n.body}
                        </p>
                      </div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: 'var(--font-en)' }}>
                        {timeAgo(n.sentAt || n.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar with dropdown - positioned below button */}
          <div ref={avatarBtnRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setAvatarOpen(p => !p); setNotifOpen(false); }}
              style={{
                width: 40, height: 40, borderRadius: '50%', padding: 0,
                border: `2px solid ${avatarOpen ? 'var(--text-primary)' : 'var(--border)'}`,
                cursor: 'pointer', overflow: 'hidden', transition: 'border-color .2s',
                background: 'var(--bg-secondary)', flexShrink: 0,
              }}
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--bg-primary)' }}>
                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
              }
            </button>

            {avatarOpen && (
              <div 
                ref={avatarDropdownRef}
                style={{
                  ...getDropdownStyle(),
                  background: 'var(--bg-primary)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,.3)',
                  zIndex: 9999,
                  animation: 'dropOpen .18s ease',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.fullName || '—'}
                  </p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-en)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email || ''}
                  </p>
                </div>

                {AVATAR_MENU.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setAvatarOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 16px',
                        textDecoration: 'none',
                        color: 'var(--text-secondary)',
                        borderBottom: i < AVATAR_MENU.length - 1 ? '1px solid var(--border)' : 'none',
                        fontSize: 13.5, fontWeight: 500, fontFamily: font,
                        transition: 'all .15s',
                        background: 'transparent',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                      {isAr ? item.ar : item.en}
                    </Link>
                  );
                })}

                <button
                  onClick={() => { setAvatarOpen(false); logout(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', border: 'none', borderTop: '1px solid var(--border)',
                    background: 'transparent', cursor: 'pointer',
                    color: '#EF4444', fontSize: 13.5, fontWeight: 600, fontFamily: font,
                    transition: 'background .15s', textAlign: isAr ? 'right' : 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  {isAr ? 'تسجيل الخروج' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


export function MobileBottomNav() {
  const location = useLocation();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const isActive = (to) =>
    to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(to);

  return (
    <>
      <style>{`
        .dash-bottom-nav { display: none !important; }
        @media (max-width: 1024px) { .dash-bottom-nav { display: flex !important; } }
        @media (max-width: 1024px) { .dash-main-scroll { padding-bottom: 68px !important; } }
      `}</style>

      <nav
        className="dash-bottom-nav"
        role="navigation"
        aria-label={isAr ? 'التنقل السريع' : 'Quick navigation'}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 58,
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border)',
          zIndex: 200,
          alignItems: 'stretch',
          justifyContent: 'space-around',
          direction: 'ltr',
        }}
      >
        {MOBILE_NAV.map(item => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              aria-label={isAr ? item.ar : item.en}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                textDecoration: 'none',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                position: 'relative', transition: 'color 0.2s ease',
                padding: '5px 0 3px',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', top: 0, left: '22%', right: '22%', height: 2, borderRadius: 99, background: 'var(--text-primary)' }} />
              )}
              <Icon size={22} strokeWidth={active ? 2.3 : 1.7} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                {isAr ? item.ar : item.en}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}