import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, CheckCheck, Briefcase, Users, Info } from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';

const timeAgo = (d, ar) => {
  const x = Math.floor((Date.now() - new Date(d)) / 60000);
  if (x < 1)    return ar ? 'الآن' : 'Just now';
  if (x < 60)   return ar ? `منذ ${x} دقيقة` : `${x}m ago`;
  if (x < 1440) return ar ? `منذ ${Math.floor(x / 60)} ساعة` : `${Math.floor(x / 60)}h ago`;
  return ar ? `منذ ${Math.floor(x / 1440)} يوم` : `${Math.floor(x / 1440)}d ago`;
};

const ICON_MAP = {
  application: Users,
  job:         Briefcase,
  default:     Info,
};

const Skel = () => <div style={{ height: 72, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'cnPulse 1.5s infinite' }} />;

export default function CompanyNotificationsPage() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';

  const [notifs,   setNotifs]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(false);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/notifications');
      setNotifs(data.data?.notifications || data.data || []);
    } catch { setNotifs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.patch('/users/me/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success(isAr ? 'تم تحديد الكل كمقروء' : 'All marked as read');
    } catch { toast.error(isAr ? 'فشل' : 'Failed'); }
    finally { setMarking(false); }
  };

  const markOne = async (id) => {
    try {
      await api.patch(`/users/me/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <CompanyLayout title={isAr ? 'الإشعارات' : 'Notifications'}>
      <style>{'@keyframes cnPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      <div style={{ maxWidth: 680 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 3px' }}>{isAr ? 'الإشعارات' : 'Notifications'}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              {unreadCount > 0 ? (isAr ? `${unreadCount} غير مقروء` : `${unreadCount} unread`) : (isAr ? 'كل الإشعارات مقروءة' : 'All caught up')}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={marking} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              <CheckCheck size={14} /> {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            [0,1,2,3].map(i => <Skel key={i} />)
          ) : notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <BellOff size={40} color="var(--text-secondary)" style={{ opacity: 0.2, marginBottom: 14 }} />
              <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>{isAr ? 'لا توجد إشعارات' : 'No notifications yet'}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{isAr ? 'ستظهر هنا عند وصول إشعارات جديدة' : 'New notifications will appear here'}</p>
            </div>
          ) : notifs.map(n => {
            const Icon = ICON_MAP[n.type] || ICON_MAP.default;
            return (
              <div key={n.id} onClick={() => !n.isRead && markOne(n.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 13, border: `1px solid ${!n.isRead ? 'var(--text-primary)' : 'var(--border)'}`, cursor: !n.isRead ? 'pointer' : 'default', transition: 'all 0.2s', position: 'relative', opacity: n.isRead ? 0.7 : 1 }}
                onMouseEnter={e => { if (!n.isRead) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-primary)'}>

                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 11, background: n.isRead ? 'var(--bg-secondary)' : 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={n.isRead ? 'var(--text-secondary)' : '#3B82F6'} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: n.isRead ? 500 : 700, color: 'var(--text-primary)', margin: '0 0 3px', lineHeight: 1.4 }}>{n.title || n.message}</p>
                  {n.body && n.title && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.5 }}>{n.body}</p>}
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-en)' }}>{timeAgo(n.createdAt || n.created_at, isAr)}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CompanyLayout>
  );
}
