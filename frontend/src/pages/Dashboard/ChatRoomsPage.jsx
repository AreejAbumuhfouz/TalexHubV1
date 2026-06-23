

'use strict';
import { useState, useEffect, useCallback } from 'react';
import { Mic, RefreshCw, Plus, Crown, AlertCircle, Radio, ChevronRight, Search, Users } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';
import RoomView from './components/RoomView';
import CreateRoomModal from './components/CreateRoomModal';
import PlanQuotaBar from './components/PlanQuotaBar';
import { DEFAULT_PLANS, getErr, loadBadWords } from './components/utils';

export default function ChatRoomsPage() {
  const { user } = useAuthStore();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [collapsed, setCollapsed] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [allowFree, setAllowFree] = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [usedMonth, setUsedMonth] = useState(0);
  
  // Search state (removed language filter)
  const [searchTerm, setSearchTerm] = useState('');

  const planKey = user?.planKey || 'free';
  const cfg = plans[planKey] || DEFAULT_PLANS[planKey];
  const dayLeft = cfg.maxRoomsPerDay === 0 ? 0 : Math.max(0, cfg.maxRoomsPerDay - usedToday);
  const canCreate = (cfg.canCreate || allowFree) && (cfg.maxRoomsPerDay === 0 || dayLeft > 0);
  const quotaOut = cfg.canCreate && dayLeft === 0;

  useEffect(() => {
    loadBadWords();
    api.get('/chat/settings').then(({ data }) => {
      const d = data.data || {};
      if (d.plans) setPlans(d.plans);
      setAllowFree(d.allowFreeCreate || false);
      setUsedToday(d.usedToday || 0);
      setUsedMonth(d.usedMonth || 0);
    }).catch(() => {});
  }, [user, activeRoom]);

  
  const loadRooms = useCallback(async () => {
  setLoading(true);
  try {
    const { data } = await api.get('/chat/rooms');
    // Use room data directly - assume room already has host info
    const roomsWithHosts = (data.data || []).map(room => ({
      ...room,
      host: {
        fullName: room.hostName || 'Host',
        avatarUrl: room.hostAvatar || null
      }
    }));
    setRooms(roomsWithHosts);
  } catch (err) {
    if (err.response?.status !== 403) toast.error(getErr(err, isAr));
  } finally {
    setLoading(false);
  }
}, [isAr]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Filter rooms based on search only
  useEffect(() => {
    let filtered = [...rooms];
    
    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(room => {
        const enMatch = room.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const arMatch = room.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());
        return enMatch || arMatch;
      });
    }
    
    setFilteredRooms(filtered);
  }, [rooms, searchTerm]);

  const joinRoom = async roomId => {
    if (!user) {
      toast.error(isAr ? 'سجّل دخولك أولاً' : 'Please log in');
      return;
    }
    try {
      const { data } = await api.get(`/chat/rooms/${roomId}`);
      setActiveRoom(data.data);
    } catch (err) {
      toast.error(getErr(err, isAr));
    }
  };

  if (activeRoom) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <MobileTopBar title={isAr ? 'الغرف الصوتية' : 'Voice Rooms'} />
        <RoomView room={activeRoom} user={user} isAr={isAr} font={font} onLeave={() => {
          setActiveRoom(null);
          loadRooms();
          api.get('/chat/settings').then(({ data }) => {
            const d = data.data || {};
            setUsedToday(d.usedToday || 0);
            setUsedMonth(d.usedMonth || 0);
          }).catch(() => {});
        }} />
      </div>
      <MobileBottomNav />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MobileTopBar title={isAr ? 'الغرف الصوتية' : 'Voice Rooms'} />
        <main style={{ flex: 1, padding: 'clamp(16px,3vw,28px)', maxWidth: 780, margin: '0 auto', width: '100%', boxSizing: 'border-box', paddingBottom: 90 }}>

          {/* Header row */}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0, fontFamily: font }}>{isAr ? 'الغرف الصوتية' : 'Voice Rooms'}</h1>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={loadRooms} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'background .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-primary)'; }}>
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => canCreate && setShowCreate(true)}
                disabled={!canCreate}
                title={quotaOut ? (isAr ? 'انتهى الحد اليومي' : 'Daily limit reached') : !cfg.canCreate && !allowFree ? (isAr ? 'يتطلب Pro' : 'Requires Pro') : ''}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 11, border: 'none', background: canCreate ? '#818CF8' : 'var(--bg-secondary)', color: canCreate ? '#fff' : 'var(--text-secondary)', cursor: canCreate ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, fontFamily: font, boxShadow: canCreate ? '0 3px 12px rgba(129,140,248,.3)' : 'none', transition: 'all .15s', opacity: quotaOut ? .6 : 1 }}
                onMouseEnter={e => { if (canCreate) e.currentTarget.style.background = '#6366F1'; }}
                onMouseLeave={e => { if (canCreate) e.currentTarget.style.background = '#818CF8'; }}>
                {quotaOut ? <><AlertCircle size={14} /> {isAr ? 'انتهى الحد' : 'Limit reached'}</> :
                 !cfg.canCreate && !allowFree ? <><Crown size={14} /> {isAr ? 'يتطلب Pro' : 'Pro required'}</> :
                 <><Plus size={14} /> {isAr ? 'غرفة جديدة' : 'New Room'}</>}
              </button>
            </div>
          </div>
          {/* Search Bar Only - No language filters */}
         
          <div style={{ marginBottom: 20 }}>
  <div style={{ position: 'relative' }}>
    <Search
      size={16}
      style={{
        position: 'absolute',
        left: isAr ? 'auto' : 12,
        right: isAr ? 12 : 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-secondary)',
      }}
    />
    <input
      type="text"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder={isAr ? 'ابحث عن غرفة...' : 'Search rooms...'}
      style={{
        width: '100%',
        padding: isAr ? '12px 40px 12px 12px' : '12px 12px 12px 40px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        fontSize: 13,
        fontFamily: font,
        outline: 'none',
        transition: 'border-color .15s',
      }}
      onFocus={e => {
        e.target.style.borderColor = '#818CF8';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--border)';
      }}
    />
  </div>
</div>

          {/* PLAN QUOTA BAR */}
          <PlanQuotaBar planKey={planKey} plans={plans} usedToday={usedToday} usedMonth={usedMonth} isAr={isAr} font={font} />

          {/* Rooms List */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <RefreshCw size={24} color="var(--text-secondary)" style={{ animation: 'spin .8s linear infinite' }} />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 0 50px' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Mic size={26} color="var(--text-secondary)" opacity={.35} />
              </div>
              <p style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 5px' }}>
                {searchTerm ? (isAr ? 'لا توجد نتائج' : 'No results found') : (isAr ? 'لا توجد غرف مباشرة' : 'No live rooms')}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>
                {searchTerm ? (isAr ? 'جرب بحثاً آخر' : 'Try another search') : (isAr ? 'كن أول من يبدأ محادثة' : 'Be the first to start one')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredRooms.map(room => {
                const rp = plans[room.planKey] || DEFAULT_PLANS[room.planKey] || plans.free;
                const rn = isAr && room.nameAr ? room.nameAr : room.name;
                const col = DEFAULT_PLANS[room.planKey]?.color || '#818CF8';
                const isFull = room.memberCount >= (room.planLimits?.capacity || rp.capacity || 50);
                const hostName = room.host?.fullName || 'Host';
                const hostAvatar = room.host?.avatarUrl;
                const hostInitial = hostName.charAt(0).toUpperCase();
                
                return (
                  <div key={room.id}
                    style={{ background: 'var(--bg-primary)', border: `1.5px solid ${isFull ? 'rgba(239,68,68,.3)' : 'var(--border)'}`, borderRadius: 16, padding: '15px 17px', display: 'flex', alignItems: 'center', gap: 13, transition: 'all .15s', opacity: isFull ? 0.7 : 1 }}
                    onMouseEnter={e => { if (!isFull) { e.currentTarget.style.borderColor = 'rgba(129,140,248,.5)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(129,140,248,.1)'; } }}
                    onMouseLeave={e => { if (!isFull) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; } }}>
                    
                    {/* Host Avatar instead of Mic icon */}
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#818CF8,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      {hostAvatar ? (
                        <img src={hostAvatar} alt={hostName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{hostInitial}</span>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#22C55E', borderRadius: '50%', width: 14, height: 14, border: '2px solid var(--bg-primary)' }} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, fontFamily: font, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rn}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: '#22C55E', fontWeight: 600 }}><Radio size={9} /> {isAr ? 'مباشر' : 'Live'}</span>
                        <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)' }}>
                          <Users size={10} /> {room.memberCount || 0}/{rp.capacity || 50}
                        </span>
                        <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>·</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{rp.stages} {isAr ? 'منصة' : 'stages'} · {rp.durationMinutes}{isAr ? 'د' : 'm'}</span>
                        {/* {room.planKey && room.planKey !== 'free' && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: col, background: col + '14', border: `1px solid ${col}28` }}>
                            <Crown size={8} color={col} fill={col} /> {rp.label || room.planKey}
                          </span>
                        )} */}
                      </div>
                      {/* Host name display */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                        <Crown size={10} color="#F59E0B" />
                        <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: font }}>
                          {isAr ? 'المضيف:' : 'Host:'} {hostName}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => !isFull && joinRoom(room.id)}
                      disabled={isFull}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 17px', borderRadius: 11, background: isFull ? 'var(--bg-secondary)' : 'var(--text-primary)', color: isFull ? 'var(--text-secondary)' : 'var(--bg-primary)', border: 'none', cursor: isFull ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font, flexShrink: 0, transition: 'all .15s', opacity: isFull ? 0.6 : 1 }}
                      onMouseEnter={e => { if (!isFull) e.currentTarget.style.opacity = '.85'; }}
                      onMouseLeave={e => { if (!isFull) e.currentTarget.style.opacity = '1'; }}>
                      {isFull ? (isAr ? 'ممتلئة' : 'Full') : <><ChevronRight size={14} /> {isAr ? 'دخول' : 'Join'}</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <MobileBottomNav />
      {showCreate && (
        <CreateRoomModal isAr={isAr} font={font} plans={plans} onClose={() => setShowCreate(false)}
          onCreate={r => { setRooms(p => [r, ...p]); setUsedToday(d => d + 1); setUsedMonth(m => m + 1); setActiveRoom(r); }} />
      )}
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>
    </div>
  );
}