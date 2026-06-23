import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, Search, X, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useLangStore from '../../i18n';

const STATUS_CFG = {
  pending:  { ar: 'قيد المراجعة', en: 'Pending',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  approved: { ar: 'مقبول',        en: 'Approved', color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  rejected: { ar: 'مرفوض',        en: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
};

const PLAN_COLOR = { pro: '#3B82F6', elite: '#8B5CF6', free: '#6B7280' };

const T = {
  ar: {
    title:          'المدفوعات',
    all:            'الكل',
    pending:        'قيد المراجعة',
    approved:       'مقبول',
    rejected:       'مرفوض',
    search:         'بحث بالاسم أو رقم العملية...',
    noRequests:     'لا توجد طلبات',
    receipt:        'الإيصال',
    open:           'فتح',
    approve:        'قبول',
    reject:         'رفض',
    confirmApprove: 'تأكيد قبول الطلب وتفعيل الخطة؟',
    approveSuccess: 'تم القبول وتفعيل الخطة ✓',
    approveFail:    'فشل القبول',
    rejectTitle:    'رفض الطلب',
    rejectReason:   'سبب الرفض (اختياري)',
    rejectHint:     'مثال: الإيصال غير واضح، المبلغ غير مطابق...',
    rejectSuccess:  'تم الرفض',
    rejectFail:     'فشل الرفض',
    cancel:         'إلغاء',
    currentPlan:    'خطة حالية:',
    ref:            'رقم العملية:',
    receiptLabel:   'الإيصال',
  },
  en: {
    title:          'Payments',
    all:            'All',
    pending:        'Pending',
    approved:       'Approved',
    rejected:       'Rejected',
    search:         'Search by name or transaction ref...',
    noRequests:     'No requests found',
    receipt:        'Receipt',
    open:           'Open',
    approve:        'Approve',
    reject:         'Reject',
    confirmApprove: 'Confirm approval and activate plan?',
    approveSuccess: 'Approved & plan activated ✓',
    approveFail:    'Approval failed',
    rejectTitle:    'Reject Request',
    rejectReason:   'Rejection reason (optional)',
    rejectHint:     'e.g. Receipt unclear, amount mismatch...',
    rejectSuccess:  'Request rejected',
    rejectFail:     'Rejection failed',
    cancel:         'Cancel',
    currentPlan:    'Current plan:',
    ref:            'Ref:',
    receiptLabel:   'Receipt',
  },
};

/* ── Receipt preview modal ───────────────────────────────── */
function ReceiptModal({ url, onClose, t }) {
  if (!url) return null;
  const isPdf = url.includes('.pdf') || url.includes('pdf');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', background: 'var(--bg-primary)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{t.receiptLabel}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', textDecoration: 'none', fontSize: 12, color: 'var(--text-secondary)' }}>
              <ExternalLink size={13} /> {t.open}
            </a>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} color="var(--text-primary)" />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {isPdf
            ? <iframe src={url} style={{ width: '100%', height: 500, border: 'none' }} title="receipt" />
            : <img src={url} alt="receipt" style={{ width: '100%', objectFit: 'contain', maxHeight: 500 }} />}
        </div>
      </div>
    </div>
  );
}

/* ── Reject modal ────────────────────────────────────────── */
function RejectModal({ requestId, onClose, onDone, t, isAr }) {
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.patch(`/payments/${requestId}/reject`, { reason });
      toast.success(t.rejectSuccess);
      onDone();
    } catch { toast.error(t.rejectFail); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#EF4444' }}>{t.rejectTitle}</p>
        </div>
        <div style={{ padding: '18px 20px' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{t.rejectReason}</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder={t.rejectHint}
            style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 18px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.cancel}
          </button>
          <button onClick={submit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#EF4444', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading && <RefreshCw size={13} style={{ animation: 'spin .8s linear infinite' }} />}
            {t.reject}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN TAB
══════════════════════════════════════════════════════════ */
export default function PaymentsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const t    = T[isAr ? 'ar' : 'en'];

  const [requests,    setRequests]  = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [statusFilter,setStatus]    = useState('all');
  const [q,           setQ]         = useState('');
  const [previewUrl,  setPreview]   = useState(null);
  const [rejectId,    setRejectId]  = useState(null);
  const [approvingId, setApproving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/payments', { params });
      setRequests(data.data?.rows || data.data || []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    if (!window.confirm(t.confirmApprove)) return;
    setApproving(id);
    try {
      await api.patch(`/payments/${id}/approve`);
      toast.success(t.approveSuccess);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t.approveFail);
    } finally { setApproving(null); }
  };

  const filtered = requests.filter(r => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.user?.fullName?.toLowerCase().includes(s)    ||
      r.user?.email?.toLowerCase().includes(s)        ||
      r.transactionRef?.toLowerCase().includes(s)
    );
  });

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const tabs = [
    { id: 'all',      label: `${t.all} (${counts.all})`              },
    { id: 'pending',  label: `⏳ ${t.pending} (${counts.pending})`   },
    { id: 'approved', label: `✓ ${t.approved} (${counts.approved})`  },
    { id: 'rejected', label: `✗ ${t.rejected} (${counts.rejected})`  },
  ];

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

      {/* ── Filter bar ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {tabs.map(f => (
            <button key={f.id} onClick={() => setStatus(f.id)} style={{
              padding: '7px 12px', borderRadius: 7, border: 'none',
              fontSize: 12.5, fontWeight: statusFilter === f.id ? 700 : 500,
              background: statusFilter === f.id ? 'var(--bg-primary)' : 'transparent',
              color: statusFilter === f.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: statusFilter === f.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
          onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Search size={13} color="var(--text-secondary)" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t.search}
            dir={isAr ? 'rtl' : 'ltr'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', padding: '9px 0', fontFamily: 'inherit' }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
              <X size={13} />
            </button>
          )}
        </div>

        <button onClick={load} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={14} color="var(--text-secondary)" />
        </button>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <RefreshCw size={22} style={{ animation: 'spin .8s linear infinite', color: 'var(--text-secondary)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
          <Clock size={36} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{t.noRequests}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(r => {
            const sc      = STATUS_CFG[r.status] || STATUS_CFG.pending;
            const planClr = PLAN_COLOR[r.planKey] || '#6B7280';
            const isApp   = approvingId === r.id;

            return (
              <div key={r.id} style={{ background: 'var(--bg-primary)', borderRadius: 14, border: `1px solid ${r.status === 'pending' ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>

                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180, flex: 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {r.user?.avatarUrl
                      ? <img src={r.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{r.user?.fullName?.[0] || '?'}</span>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                      {r.user?.fullName || '—'}
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.user?.email}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      {t.currentPlan} <strong style={{ color: 'var(--text-primary)' }}>{r.user?.planKey}</strong>
                    </p>
                  </div>
                </div>

                {/* Request details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 9px', borderRadius: 99, background: `${planClr}18`, color: planClr }}>
                      {r.planKey?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.billingPeriod}</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0, fontFamily: 'monospace' }}>
                    ${Number(r.amount).toFixed(2)}{' '}
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{r.currency}</span>
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                    {new Date(r.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US', { dateStyle: 'medium' })}
                  </p>
                </div>

                {/* Transfer info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{r.senderName}</p>
                  {r.senderPhone && (
                    <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: 'monospace' }}>{r.senderPhone}</p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {t.ref} {r.transactionRef}
                  </p>
                  {r.notes && (
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{r.notes}</p>
                  )}
                  {r.rejectionReason && (
                    <p style={{ fontSize: 11, color: '#EF4444', margin: '2px 0 0' }}>⚠ {r.rejectionReason}</p>
                  )}
                </div>

                {/* Status + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 99, background: sc.bg, color: sc.color }}>
                    {isAr ? sc.ar : sc.en}
                  </span>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {r.receiptUrl && (
                      <button onClick={() => setPreview(r.receiptUrl)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Eye size={13} /> {t.receipt}
                      </button>
                    )}

                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(r.id)} disabled={isApp} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: '#22C55E', fontSize: 12, fontWeight: 700, cursor: isApp ? 'default' : 'pointer', fontFamily: 'inherit', opacity: isApp ? 0.6 : 1 }}>
                          {isApp
                            ? <RefreshCw size={12} style={{ animation: 'spin .8s linear infinite' }} />
                            : <CheckCircle size={13} />}
                          {t.approve}
                        </button>
                        <button onClick={() => setRejectId(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <XCircle size={13} /> {t.reject}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {previewUrl && <ReceiptModal url={previewUrl} onClose={() => setPreview(null)} t={t} />}
      {rejectId   && (
        <RejectModal
          requestId={rejectId}
          onClose={() => setRejectId(null)}
          onDone={() => { setRejectId(null); load(); }}
          t={t}
          isAr={isAr}
        />
      )}
    </div>
  );
}