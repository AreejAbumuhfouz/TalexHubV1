

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import { C, TABS_CONFIG, fmt, fmtDateTime, fmtNum, STATUS_COLORS } from '../components/AdminTokens';
import { Spinner, Avatar } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { TableSkeleton } from '../components/AdminSkeleton';
import toast from 'react-hot-toast';



// دالة تنسيق التاريخ الآمنة
const formatDateSafe = (date) => {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};
// ════════════════════════════════════════════════════════════
// PLANS CONFIG PANEL
// ════════════════════════════════════════════════════════════
function PlansConfigPanel({ isAr }) {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/chat-plans');
      setPlans(data.data?.plans || {});
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleChange = (planKey, field, value) => {
    setPlans(p => ({ ...p, [planKey]: { ...p[planKey], [field]: field === 'canCreate' ? value : (parseInt(value) || 0) } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/chat-plans', { plans });
      toast.success(isAr ? 'تم حفظ إعدادات الخطط' : 'Plans saved');
    } catch {
      toast.error(isAr ? 'فشل الحفظ' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(isAr ? 'إعادة للقيم الافتراضية؟' : 'Reset to defaults?')) return;
    try {
      await api.post('/admin/chat-plans/reset');
      await loadPlans();
      toast.success(isAr ? 'تمت الإعادة' : 'Reset done');
    } catch {
      toast.error(isAr ? 'فشلت الإعادة' : 'Reset failed');
    }
  };

  if (loading) return <TableSkeleton rows={3} />;

  const planColors = { free: '#6B7280', pro: '#7B72EE', elite: '#F59E0B' };

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{isAr ? 'إعدادات خطط الغرف' : 'Room Plans Configuration'}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
            {isAr ? 'إعادة' : 'Reset'}
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? '...' : (isAr ? 'حفظ' : 'Save')}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        {Object.entries(plans).map(([key, config]) => (
          <div key={key} style={{ padding: 16, borderRadius: 12, border: `2px solid ${planColors[key]}30`, background: `${planColors[key]}08` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: planColors[key], marginBottom: 12, textTransform: 'uppercase' }}>{key}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: isAr ? 'المنصات' : 'Stages', field: 'stages', min: 1, max: 20 },
                { label: isAr ? 'المدة (دقيقة لكل غرفة)' : 'Duration (Min/Room)', field: 'durationMinutes', min: 5, max: 1440 },
                { label: isAr ? 'السعة (أشخاص)' : 'Capacity', field: 'capacity', min: 10, max: 10000 },
                { label: isAr ? 'غرف في اليوم' : 'Rooms/Day', field: 'maxRoomsPerDay', min: 0, max: 10 },
                { label: isAr ? 'غرف في الشهر' : 'Rooms/Month', field: 'maxRoomsPerMonth', min: 0, max: 100 },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <input type="number" min={f.min} max={f.max} value={config[f.field] || 0} onChange={e => handleChange(key, f.field, e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={config.canCreate || false} onChange={e => handleChange(key, 'canCreate', e.target.checked)} id={`create-${key}`} />
                <label htmlFor={`create-${key}`} style={{ fontSize: 12, color: 'var(--text-primary)' }}>{isAr ? 'إنشاء الغرف' : 'Allow Creation'}</label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ROOMS TABLE - FIXED OWNER DISPLAY
// ════════════════════════════════════════════════════════════
function RoomsTable({ isAr }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const limit = 20;

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/admin/chat-rooms', { params });
      console.log('Rooms data:', data.data);
      setRooms(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error('Load rooms error:', err);
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const handleToggle = async (roomId, current) => {
    try {
      await api.patch(`/admin/chat-rooms/${roomId}/toggle`);
      toast.success(current ? (isAr ? 'تم الإغلاق' : 'Closed') : (isAr ? 'تم التفعيل' : 'Activated'));
      loadRooms();
    } catch {
      toast.error('Failed');
    }
  };

  const planColors = { free: '#6B7280', pro: '#7B72EE', elite: '#F59E0B' };
  const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' };
  const td = { padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)' };

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginRight: 'auto' }}>{isAr ? 'الغرف' : 'Rooms'} ({total})</h3>
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={isAr ? 'بحث...' : 'Search...'} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', width: 150 }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
          <option value="">{isAr ? 'الكل' : 'All'}</option>
          <option value="active">{isAr ? 'نشط' : 'Active'}</option>
          <option value="closed">{isAr ? 'مغلق' : 'Closed'}</option>
        </select>
        <button onClick={loadRooms} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="refresh" size={12} /> {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>

      {loading ? <div style={{ padding: 20 }}><TableSkeleton rows={5} /></div> : rooms.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد غرف' : 'No rooms'}</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={th}>{isAr ? 'الاسم' : 'Name'}</th>
                <th style={th}>{isAr ? 'المالك' : 'Owner'}</th>
                <th style={th}>{isAr ? 'الخطة' : 'Plan'}</th>
                <th style={th}>Stages</th>
                <th style={th}>{isAr ? 'الأعضاء' : 'Members'}</th>
                <th style={th}>{isAr ? 'بلاغات' : 'Reports'}</th>
                <th style={th}>{isAr ? 'الحالة' : 'Status'}</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => {
                // ✅ FIX: Get owner name from multiple possible sources
                const ownerName = room.hostName || room.host?.fullName || room.creator?.fullName || 'Unknown';
                const ownerAvatar = room.hostAvatar || room.host?.avatarUrl || room.creator?.avatarUrl;
                
                return (
                  <tr key={room.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{room.name}</div>
                      {room.nameAr && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{room.nameAr}</div>}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar src={ownerAvatar} size={24} name={ownerName} />
                        <span>{ownerName}</span>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: (planColors[room.planKey] || '#6B7280') + '18', color: planColors[room.planKey] || '#6B7280', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {room.planKey || 'free'}
                      </span>
                    </td>
                    <td style={td}>{room.maxStages || 3}</td>
                    <td style={td}>{room.memberCount || 0}/{room.capacity || 50}</td>
                    <td style={td}>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('viewRoomReports', { detail: { roomId: room.id, roomName: room.name } }))}
                        style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: room.reportsCount > 0 ? '#EF444418' : '#3B82F618', color: room.reportsCount > 0 ? '#EF4444' : '#3B82F6' }}
                      >
                        {room.reportsCount || 0} {isAr ? 'بلاغ' : 'reports'}
                      </button>
                    </td>
                    <td style={td}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: room.isActive ? '#22C55E18' : '#EF444418', color: room.isActive ? '#22C55E' : '#EF4444' }}>
                        {room.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مغلق' : 'Closed')}
                      </span>
                    </td>
                    <td style={td}>
                      <button onClick={() => handleToggle(room.id, room.isActive)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: room.isActive ? '#EF444418' : '#22C55E18', color: room.isActive ? '#EF4444' : '#22C55E' }}>
                        {room.isActive ? (isAr ? 'إغلاق' : 'Close') : (isAr ? 'تفعيل' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {total > limit && (
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>←</button>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{page} / {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>→</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// REPORTS TABLE
// ════════════════════════════════════════════════════════════
function ReportsTable({ isAr }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const limit = 20;

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (selectedRoom) params.roomId = selectedRoom;
      const { data } = await api.get('/admin/chat-reports', { params });
      setReports(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error('Load reports error:', err);
      toast.error(isAr ? 'فشل تحميل البلاغات' : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, status, selectedRoom, isAr]);

  useEffect(() => { loadReports(); }, [loadReports]);

  useEffect(() => {
    const handleViewReports = (e) => {
      setSelectedRoom(e.detail.roomId);
      setPage(1);
    };
    window.addEventListener('viewRoomReports', handleViewReports);
    return () => window.removeEventListener('viewRoomReports', handleViewReports);
  }, []);

  const handleViewDetails = async (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setLoadingRoom(true);
    try {
      const { data } = await api.get(`/admin/chat-rooms/${report.roomId}`);
      setRoomDetails(data.data);
    } catch (err) {
      console.error('Failed to load room details', err);
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleResolve = async (reportId, resolved) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/chat-reports/${reportId}/resolve`, { resolved: !resolved });
      toast.success(resolved ? (isAr ? 'تم إعادة فتح البلاغ' : 'Report reopened') : (isAr ? 'تم حل البلاغ' : 'Report resolved'));
      loadReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
        setShowModal(false);
      }
    } catch {
      toast.error(isAr ? 'فشل التحديث' : 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا البلاغ؟' : 'Are you sure you want to delete this report?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/chat-reports/${reportId}`);
      toast.success(isAr ? 'تم حذف البلاغ' : 'Report deleted');
      loadReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
        setShowModal(false);
      }
    } catch {
      toast.error(isAr ? 'فشل الحذف' : 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseRoom = async (roomId) => {
    if (!window.confirm(isAr ? 'هل تريد إغلاق هذه الغرفة؟' : 'Do you want to close this room?')) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/chat-rooms/${roomId}/toggle`);
      toast.success(isAr ? 'تم إغلاق الغرفة' : 'Room closed');
      loadReports();
      if (roomDetails) {
        setRoomDetails({ ...roomDetails, isActive: false });
      }
    } catch {
      toast.error(isAr ? 'فشل إغلاق الغرفة' : 'Failed to close room');
    } finally {
      setActionLoading(false);
    }
  };

  const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' };
  const td = { padding: '10px 14px', fontSize: 12, color: 'var(--text-primary)' };

  const ReportModal = () => {
    if (!selectedReport) return null;
    const isPending = !selectedReport.resolved;
    
    return (
      <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-primary)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{isAr ? 'تفاصيل البلاغ' : 'Report Details'}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                {isAr ? 'الغرفة:' : 'Room:'} <strong>{selectedReport.room?.name}</strong>
                {selectedReport.room?.nameAr && ` (${selectedReport.room.nameAr})`}
              </p>
            </div>
            <button onClick={() => setShowModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={18} />
            </button>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#F59E0B' }}>{isAr ? 'معلومات البلاغ' : 'Report Information'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'المبلغ' : 'Reporter'}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Avatar src={selectedReport.reporter?.avatarUrl} size={32} name={selectedReport.reporter?.fullName} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedReport.reporter?.fullName || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ID: {selectedReport.reporterId || '-'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'السبب' : 'Reason'}</label>
                  <div style={{ marginTop: 4, fontWeight: 600, color: '#F59E0B' }}>{selectedReport.reason || '-'}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'التاريخ' : 'Date'}</label>
                  <div style={{ marginTop: 4 }}>{fmtDateTime(selectedReport.createdAt, isAr ? 'ar' : 'en')}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'الحالة' : 'Status'}</label>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: isPending ? '#F59E0B18' : '#22C55E18', color: isPending ? '#F59E0B' : '#22C55E' }}>
                      {isPending ? (isAr ? 'قيد المراجعة' : 'Pending') : (isAr ? 'تم الحل' : 'Resolved')}
                    </span>
                  </div>
                </div>
              </div>
              {selectedReport.description && (
                <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'تفاصيل إضافية' : 'Additional Details'}</label>
                  <div style={{ marginTop: 4 }}>{selectedReport.description}</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#818CF8' }}>{isAr ? 'معلومات الغرفة' : 'Room Information'}</h3>
              {loadingRoom ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spinner /></div>
              ) : roomDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'اسم الغرفة' : 'Room Name'}</label>
                      <div style={{ marginTop: 4, fontWeight: 600 }}>{roomDetails.name}</div>
                      {roomDetails.nameAr && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{roomDetails.nameAr}</div>}
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'المالك' : 'Owner'}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Avatar src={roomDetails.hostAvatar} size={28} name={roomDetails.hostName} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{roomDetails.hostName || 'Unknown'}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>ID: {roomDetails.createdBy}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'الخطة' : 'Plan'}</label>
                      <div style={{ marginTop: 4, textTransform: 'uppercase', fontWeight: 600 }}>{roomDetails.planKey || 'free'}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'عدد الأعضاء' : 'Members'}</label>
                      <div style={{ marginTop: 4 }}>{roomDetails.memberCount || 0} / {roomDetails.capacity || 50}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'المنصات' : 'Stages'}</label>
                      <div style={{ marginTop: 4 }}>{roomDetails.maxStages || 3}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{isAr ? 'تاريخ الإنشاء' : 'Created'}</label>
                      <div style={{ marginTop: 4 }}>{fmtDateTime(roomDetails.createdAt, isAr ? 'ar' : 'en')}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, fontWeight: 600 }}>{isAr ? 'حالة الغرفة' : 'Room Status'}</label>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: roomDetails.isActive ? '#22C55E18' : '#EF444418', color: roomDetails.isActive ? '#22C55E' : '#EF4444' }}>
                          {roomDetails.isActive ? (isAr ? 'نشطة' : 'Active') : (isAr ? 'مغلقة' : 'Closed')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {roomDetails.isActive && (
                        <button onClick={() => handleCloseRoom(roomDetails.id)} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {isAr ? 'إغلاق الغرفة' : 'Close Room'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>{isAr ? 'لا توجد معلومات' : 'No room information'}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <button onClick={() => handleDeleteReport(selectedReport.id)} disabled={actionLoading} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #EF4444', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {isAr ? 'حذف البلاغ' : 'Delete Report'}
              </button>
              <button onClick={() => handleResolve(selectedReport.id, selectedReport.resolved)} disabled={actionLoading} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: selectedReport.resolved ? '#F59E0B' : '#22C55E', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {actionLoading ? '...' : (selectedReport.resolved ? (isAr ? 'إعادة فتح' : 'Reopen') : (isAr ? 'حل البلاغ' : 'Resolve'))}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginRight: 'auto' }}>
            {selectedRoom ? (isAr ? `بلاغات الغرفة` : `Room Reports`) : (isAr ? 'جميع البلاغات' : 'All Reports')} ({total})
          </h3>
          {selectedRoom && (
            <button onClick={() => { setSelectedRoom(null); setPage(1); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="close" size={12} /> {isAr ? 'إلغاء الفلتر' : 'Clear filter'}
            </button>
          )}
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
            <option value="">{isAr ? 'الكل' : 'All'}</option>
            <option value="pending">{isAr ? 'قيد المراجعة' : 'Pending'}</option>
            <option value="resolved">{isAr ? 'تم الحل' : 'Resolved'}</option>
          </select>
          <button onClick={loadReports} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="refresh" size={12} /> {isAr ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {loading ? <div style={{ padding: 20 }}><TableSkeleton rows={5} /></div> : reports.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Icon name="flag" size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>{isAr ? 'لا توجد بلاغات' : 'No reports found'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>{isAr ? 'الغرفة' : 'Room'}</th>
                  <th style={th}>{isAr ? 'المبلغ' : 'Reporter'}</th>
                  <th style={th}>{isAr ? 'السبب' : 'Reason'}</th>
                  <th style={th}>{isAr ? 'التفاصيل' : 'Details'}</th>
                  <th style={th}>{isAr ? 'التاريخ' : 'Date'}</th>
                  <th style={th}>{isAr ? 'الحالة' : 'Status'}</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleViewDetails(report)}>
                    <td style={td}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{report.room?.name || 'N/A'}</div>
                      {report.room?.nameAr && <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{report.room.nameAr}</div>}
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>ID: {report.roomId}</div>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar src={report.reporter?.avatarUrl} size={24} name={report.reporter?.fullName} />
                        <div>
                          <div>{report.reporter?.fullName || 'Unknown'}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>ID: {report.reporterId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: '#F59E0B18', color: '#F59E0B', fontSize: 11, fontWeight: 600 }}>
                        {report.reason || (isAr ? 'غير محدد' : 'Not specified')}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ maxWidth: 200, wordBreak: 'break-word' }}>{report.description || '-'}</div>
                    </td>
                    {/* <td style={td}>{fmtDateTime(report.createdAt, isAr ? 'ar' : 'en')}</td> */}
                    <td style={td}>{formatDateSafe(report.createdAt || report.created_at)}</td>
                    <td style={td}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: report.resolved ? '#22C55E18' : '#F59E0B18', color: report.resolved ? '#22C55E' : '#F59E0B' }}>
                        {report.resolved ? (isAr ? 'تم الحل' : 'Resolved') : (isAr ? 'قيد المراجعة' : 'Pending')}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleViewDetails(report)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: '#3B82F618', color: '#3B82F6' }}>
                          {isAr ? 'تفاصيل' : 'Details'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > limit && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>←</button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{page} / {Math.ceil(total / limit)}</span>
            <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12 }}>→</button>
          </div>
        )}
      </div>
      
      {showModal && <ReportModal />}
    </>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
export default function ChatRoomsTab({ lang }) {
  const isAr = lang === 'ar';
  const [tab, setTab] = useState('rooms');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'rooms', ar: 'الغرف', en: 'Rooms' },
          { key: 'reports', ar: 'البلاغات', en: 'Reports' },
          { key: 'plans', ar: 'الخطط', en: 'Plans' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer', background: tab === t.key ? 'var(--bg-primary)' : 'transparent', color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: tab === t.key ? 700 : 400, fontSize: 13, borderBottom: tab === t.key ? '2px solid #818CF8' : 'none' }}>
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>
      {tab === 'rooms' && <RoomsTable isAr={isAr} />}
      {tab === 'reports' && <ReportsTable isAr={isAr} />}
      {tab === 'plans' && <PlansConfigPanel isAr={isAr} />}
    </div>
  );
}