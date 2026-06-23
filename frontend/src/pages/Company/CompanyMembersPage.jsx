import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Shield, Eye, Users, Mail, RefreshCw } from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = {
  admin:  { ar: 'مسؤول',      en: 'Admin',  icon: Shield, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)'  },
  hr:     { ar: 'موارد بشرية', en: 'HR',     icon: Users,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)'  },
  viewer: { ar: 'مشاهد',      en: 'Viewer', icon: Eye,    color: '#71717A', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)'  },
};

/* ── Member Card ─────────────────────────────────────────── */
function MemberCard({ member, isAr, isOwner, onRemove, onRoleChange, currentUserId }) {
  const [removing, setRemoving] = useState(false);
  const role = ROLES[member.role] || ROLES.viewer;
  const RoleIcon = role.icon;
  const isSelf = member.userId === currentUserId;

  const handleRemove = async () => {
    if (!window.confirm(isAr ? `هل تريد إزالة ${member.user?.fullName}؟` : `Remove ${member.user?.fullName}?`)) return;
    setRemoving(true);
    try {
      await onRemove(member.userId);
    } finally {
      setRemoving(false);
    }
  };

  const name = member.user?.fullName || member.user?.email || '—';
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      {/* Avatar */}
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {member.user?.avatarUrl
          ? <img src={member.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>{initial}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </p>
          {isSelf && (
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              {isAr ? 'أنت' : 'You'}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Mail size={11} /> {member.user?.email || '—'}
        </p>
      </div>

      {/* Role badge */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 99, background: role.bg, color: role.color, border: `1px solid ${role.border}`, flexShrink: 0 }}>
        <RoleIcon size={11} /> {isAr ? role.ar : role.en}
      </span>

      {/* Remove */}
      {isOwner && !isSelf && (
        <button onClick={handleRemove} disabled={removing} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: removing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: removing ? 0.5 : 1, transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={e => { if (!removing) e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
          {removing ? <RefreshCw size={13} style={{ animation: 'cmSpin .8s linear infinite' }} /> : <Trash2 size={13} />}
        </button>
      )}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = () => <div style={{ height: 78, background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)', animation: 'cmPulse 1.5s ease-in-out infinite' }} />;

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CompanyMembersPage() {
  const { lang }   = useLangStore();
  const isAr       = lang === 'ar';
  const authUser   = useAuthStore(s => s.user);

  const [members,     setMembers]     = useState([]);
  const [company,     setCompany]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole,  setInviteRole]  = useState('hr');
  const [inviting,    setInviting]    = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: statsRes } = await api.get('/companies/me/stats');
      const c = statsRes.data.company;
      setCompany(c);
      const { data: mRes } = await api.get(`/companies/${c.id}/members`);
      setMembers(mRes.data?.members || []);
    } catch {
      toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return toast.error(isAr ? 'أدخل بريداً إلكترونياً' : 'Enter an email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) return toast.error(isAr ? 'بريد غير صالح' : 'Invalid email');
    setInviting(true);
    try {
      await api.post(`/companies/${company.id}/members`, { email: inviteEmail.trim(), role: inviteRole });
      toast.success(isAr ? 'تمت الدعوة بنجاح ✓' : 'Member invited ✓');
      setInviteEmail('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الإرسال' : 'Invite failed'));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await api.delete(`/companies/${company.id}/members/${userId}`);
      setMembers(prev => prev.filter(m => m.userId !== userId));
      toast.success(isAr ? 'تمت الإزالة' : 'Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحذف' : 'Remove failed'));
    }
  };

  const isOwner = company?.ownerId === authUser?.id;

  return (
    <CompanyLayout title={isAr ? 'أعضاء الفريق' : 'Team Members'}>
      <style>{'@keyframes cmPulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes cmSpin{to{transform:rotate(360deg)}}'}</style>

      <div style={{ maxWidth: 720, display: 'grid', gap: 18 }}>

        {/* ── Invite Section ── */}
        {isOwner && (
          <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '20px 22px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <UserPlus size={15} color="var(--text-secondary)" /> {isAr ? 'دعوة عضو جديد' : 'Invite Team Member'}
            </h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Email input */}
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 11, padding: '0 14px', transition: 'border-color 0.2s' }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <Mail size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  placeholder={isAr ? 'البريد الإلكتروني...' : 'Email address...'}
                  type="email" dir="ltr"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text-primary)', padding: '12px 0', fontFamily: 'inherit' }}
                />
              </div>

              {/* Role select */}
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ padding: '12px 14px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                {Object.entries(ROLES).map(([k, r]) => (
                  <option key={k} value={k}>{isAr ? r.ar : r.en}</option>
                ))}
              </select>

              {/* Invite button */}
              <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 20px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13.5, fontWeight: 700, cursor: inviting || !inviteEmail.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: inviting || !inviteEmail.trim() ? 0.6 : 1, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
                {inviting ? <RefreshCw size={14} style={{ animation: 'cmSpin .8s linear infinite' }} /> : <UserPlus size={14} />}
                {isAr ? 'إرسال الدعوة' : 'Send Invite'}
              </button>
            </div>

            {/* Role descriptions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {Object.entries(ROLES).map(([k, r]) => {
                const Icon = r.icon;
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 99, background: r.bg, border: `1px solid ${r.border}`, fontSize: 11.5, color: r.color, fontWeight: 600 }}>
                    <Icon size={11} /> {isAr ? r.ar : r.en}
                    <span style={{ fontWeight: 400, opacity: 0.7 }}>
                      {k === 'admin' ? (isAr ? ' — صلاحيات كاملة' : ' — Full access') : k === 'hr' ? (isAr ? ' — إدارة المتقدمين' : ' — Manage applicants') : (isAr ? ' — مشاهدة فقط' : ' — View only')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Members List ── */}
        <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Users size={14} color="var(--text-secondary)" /> {isAr ? 'أعضاء الفريق' : 'Team Members'}
            </h2>
            <span style={{ fontSize: 12.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {members.length} {isAr ? 'عضو' : 'members'}
            </span>
          </div>

          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              [0, 1, 2].map(i => <Skel key={i} />)
            ) : members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <Users size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 5px', color: 'var(--text-primary)' }}>
                  {isAr ? 'لا يوجد أعضاء بعد' : 'No team members yet'}
                </p>
                <p style={{ fontSize: 13, margin: 0 }}>
                  {isAr ? 'ادعُ أعضاء الفريق أعلاه' : 'Invite team members above'}
                </p>
              </div>
            ) : (
              members.map(m => (
                <MemberCard
                  key={m.userId || m.id}
                  member={m}
                  isAr={isAr}
                  isOwner={isOwner}
                  onRemove={handleRemove}
                  currentUserId={authUser?.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
}