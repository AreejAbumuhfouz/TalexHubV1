

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Crown, Shield, Hand, PhoneOff, Send, MessageSquare, UserX, LogOut, Users, Flag, Timer, Hourglass, Zap, AlertCircle } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Ava from './Ava';
import WaveBars from './WaveBars';
import RoomTimer from './RoomTimer';
import CapBar from './CapBar';
import ReportDialog from './ReportDialog';
import LeaveDialog from './LeaveDialog';
import { DEFAULT_PLANS, fmtTime, hasBad, loadBadWords } from './utils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export default function RoomView({ room, user, isAr, font, onLeave }) {
  const socketRef = useRef(null);
  const pcsRef = useRef({});
  const streamRef = useRef(null);
  const audioRefs = useRef({});
  const inputRef = useRef(null);
  const msgEndRef = useRef(null);
  const typingTimer = useRef(null);
  const lockRef = useRef(false);

  const [roomState, setRoomState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mySocketId, setMySocketId] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [speakingIds, setSpeakingIds] = useState(new Set());
  const [raisedHands, setRaisedHands] = useState(new Set());
  const [menuTarget, setMenuTarget] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const planKey = user?.planKey || 'free';
  // const maxStages = room.planLimits?.stages || DEFAULT_PLANS[planKey]?.stages || 8;
  const maxStages = room.maxStages || room.planLimits?.stages || DEFAULT_PLANS[planKey]?.stages || 8;
const capacity  = room.capacity  || room.planLimits?.capacity || DEFAULT_PLANS[planKey]?.capacity || 50;
  // const capacity = room.planLimits?.capacity || DEFAULT_PLANS[planKey]?.capacity || 50;
  const amHost = !!(roomState && mySocketId && roomState.hostSocketId === mySocketId);
  const amCoHost = !!(roomState && mySocketId && roomState.coHosts?.includes(mySocketId));
  const amStage = !!(roomState && mySocketId && roomState.stage?.includes(mySocketId));
  const canCtrl = amHost || amCoHost;
  const stageCount = roomState?.stage?.length || 0;
  const members = roomState ? Object.entries(roomState.members || {}).map(([sid, m]) => ({ ...m, socketId: sid })) : [];
  const stageMems = members.filter(m => roomState?.stage?.includes(m.socketId));
  const audience = members.filter(m => !roomState?.stage?.includes(m.socketId));
  const memberCount = roomState?.memberCount || members.length;
  const hostMember = members.find(m => m.socketId === roomState?.hostSocketId);
  const roomName = isAr && room.nameAr ? room.nameAr : room.name;
  const roomDescription = room.description;

  const createPeer = useCallback((rid, s) => {
    if (pcsRef.current[rid]) return pcsRef.current[rid];
    const pc = new RTCPeerConnection({ iceServers: room.iceServers || ICE });
    pc.onicecandidate = e => { if (e.candidate) s.emit('webrtc:ice', { to: rid, candidate: e.candidate, roomId: room.id }); };
    pc.ontrack = e => {
      let a = audioRefs.current[rid];
      if (!a) { a = document.createElement('audio'); a.autoplay = true; document.body.appendChild(a); audioRefs.current[rid] = a; }
      a.srcObject = e.streams[0];
      try {
        const ctx = new AudioContext(), analyser = ctx.createAnalyser();
        ctx.createMediaStreamSource(e.streams[0]).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          const talking = buf.some(v => Math.abs(v - 128) > 18);
          setSpeakingIds(p => { const n = new Set(p); talking ? n.add(rid) : n.delete(rid); return n; });
          requestAnimationFrame(tick);
        };
        tick();
      } catch {}
    };
    if (streamRef.current) streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current));
    pcsRef.current[rid] = pc; return pc;
  }, [room.id, room.iceServers]);

  const callPeer = useCallback(async (rid, s) => { const pc = createPeer(rid, s); const offer = await pc.createOffer(); await pc.setLocalDescription(offer); s.emit('webrtc:offer', { to: rid, offer, roomId: room.id }); }, [createPeer, room.id]);
  const closePeer = useCallback(id => { pcsRef.current[id]?.close(); delete pcsRef.current[id]; audioRefs.current[id]?.remove(); delete audioRefs.current[id]; setSpeakingIds(p => { const n = new Set(p); n.delete(id); return n; }); }, []);
  const stopMic = useCallback(() => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setMicOn(false); }, []);
  const startMic = useCallback(async s => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream; setMicOn(true);
      (roomState?.stage || []).forEach(sid => { if (sid !== (s || socketRef.current)?.id && !pcsRef.current[sid]) callPeer(sid, s || socketRef.current); });
    } catch { toast.error(isAr ? 'تعذر الوصول للميكروفون' : 'Microphone access denied'); }
  }, [roomState?.stage, callPeer, isAr]);

  useEffect(() => {
    loadBadWords();
    const s = io(SOCKET_URL, { withCredentials: true, auth: { token: useAuthStore.getState().token } });
    socketRef.current = s;

    s.on('connect', () => {
      setMySocketId(s.id);
      s.emit('chat:join', { roomId: room.id });
    });

    // ✅ FIX: Load history directly, no dedup needed here
    // s.on('chat:history', msgs => setMessages(msgs));
    s.on('chat:history', msgs => {
  console.log('HISTORY MSG SAMPLE:', JSON.stringify(msgs[0], null, 2));
  setMessages(msgs);
});

    // ✅ FIX Bug #1 — Replace temp message instead of adding duplicate
    s.on('chat:new_message', msg => {
      setMessages(prev => {
        // If a temp message with same tempId exists, replace it with real one
        const hasTmp = msg.tempId && prev.some(m => m.tempId === msg.tempId);
        if (hasTmp) {
          return prev.map(m => (m.tempId === msg.tempId ? { ...msg } : m));
        }
        // Otherwise just append (message from another user)
        return [...prev, msg];
      });
    });

    s.on('chat:message_blocked', ({ tempId }) => {
      setMessages(p => p.filter(m => m.tempId !== tempId));
      setBlockedCount(p => p + 1);
      toast.error(isAr ? '🚫 رسالتك تحتوي كلمات غير لائقة' : '🚫 Message blocked', { duration: 3000 });
    });

    s.on('room:state', state => { setRoomState(state); if (streamRef.current) state.stage?.forEach(sid => { if (sid !== s.id && !pcsRef.current[sid]) callPeer(sid, s); }); });
    s.on('room:user_joined', m => toast(`${m.fullName} ${isAr ? 'انضم' : 'joined'}`, { icon: '👋', duration: 2000 }));
    s.on('room:user_left', ({ socketId }) => { closePeer(socketId); setRaisedHands(p => { const n = new Set(p); n.delete(socketId); return n; }); });
    s.on('room:closed', () => { toast(isAr ? 'انتهت الغرفة' : 'Room ended'); doLeave(); });
    s.on('room:you_are_host', () => toast.success(isAr ? 'أصبحت المضيف!' : "You're the host!"));
    s.on('stage:hand_raised', ({ socketId }) => setRaisedHands(p => new Set([...p, socketId])));
    s.on('stage:you_are_on', async ({ autoMic }) => { toast.success(isAr ? '🎤 أنت على المنصة!' : '🎤 You\'re on stage!'); setHandRaised(false); setRaisedHands(p => { const n = new Set(p); n.delete(s.id); return n; }); if (autoMic) await startMic(s); });
    s.on('stage:you_are_removed', () => { toast(isAr ? 'تمت إزالتك' : 'Removed from stage'); stopMic(); });
    s.on('stage:you_are_muted', () => { streamRef.current?.getAudioTracks().forEach(t => { t.enabled = false; }); setMicOn(false); });
    s.on('stage:you_are_unmuted', () => { streamRef.current?.getAudioTracks().forEach(t => { t.enabled = true; }); setMicOn(true); });
    s.on('mod:you_are_kicked', () => { toast.error(isAr ? 'تم إخراجك' : 'You were kicked'); doLeave(); });
    s.on('chat:typing', ({ socketId }) => setTypingUsers(p => [...new Set([...p, socketId])]));
    s.on('chat:stop_typing', ({ socketId }) => setTypingUsers(p => p.filter(id => id !== socketId)));
    s.on('webrtc:offer', async ({ from, offer }) => { const pc = createPeer(from, s); await pc.setRemoteDescription(new RTCSessionDescription(offer)); const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); s.emit('webrtc:answer', { to: from, answer: ans, roomId: room.id }); });
    s.on('webrtc:answer', async ({ from, answer }) => { const pc = pcsRef.current[from]; if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer)); });
    s.on('webrtc:ice', async ({ from, candidate }) => { const pc = pcsRef.current[from]; if (pc && candidate) try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} });

    return () => {
      s.emit('chat:leave', { roomId: room.id });
      s.disconnect();
      stopMic();
      Object.values(pcsRef.current).forEach(pc => pc.close());
      Object.values(audioRefs.current).forEach(a => a.remove());
    };
  }, [room.id]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const doLeave = () => { stopMic(); socketRef.current?.emit('chat:leave', { roomId: room.id }); onLeave(); };
  const emit = (ev, data) => socketRef.current?.emit(ev, { roomId: room.id, ...data });

  const toggleMic = () => {
    if (!amStage || !streamRef.current) return;
    const next = !micOn;
    streamRef.current.getAudioTracks().forEach(t => { t.enabled = next; });
    setMicOn(next);
    emit(next ? 'stage:self_unmute' : 'stage:self_mute', {});
  };

  const raiseHand = () => {
    if (amHost) return;
    if (amStage) { emit('stage:leave_stage', {}); stopMic(); setHandRaised(false); return; }
    if (handRaised) { emit('stage:cancel_request', {}); setHandRaised(false); }
    else { emit('stage:request', {}); setHandRaised(true); toast('✋ ' + (isAr ? 'رفعت يدك' : 'Hand raised')); }
  };

  // ✅ FIX Bug #1 + #2 — Optimistic temp message includes full sender info
  const sendMsg = useCallback(() => {
    const text = input.trim();
    if (!text || lockRef.current) return;
    if (hasBad(text)) { toast.error(isAr ? '🚫 كلمات غير لائقة' : '🚫 Inappropriate language'); setInput(''); return; }

    lockRef.current = true;
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // ✅ Add temp message with full sender info so avatar/name show immediately
    setMessages(p => [...p, {
      id:        tempId,
      tempId,
      content:   text,
      senderId:  user.id,        // ✅ must match user.id for isMine check
      sender: {
        id:        user.id,
        fullName:  user.fullName,
        avatarUrl: user.avatarUrl,
      },
      createdAt: new Date().toISOString(),
    }]);

    socketRef.current?.emit('chat:message', { roomId: room.id, content: text, tempId });
    setInput('');
    clearTimeout(typingTimer.current);
    socketRef.current?.emit('chat:stop_typing', { roomId: room.id });
    requestAnimationFrame(() => { inputRef.current?.focus(); lockRef.current = false; });
  }, [input, user, room.id, isAr]);

  const onType = useCallback(v => {
    setInput(v);
    if (v) socketRef.current?.emit('chat:typing', { roomId: room.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { socketRef.current?.emit('chat:stop_typing', { roomId: room.id }); }, 1500);
  }, [room.id]);

  // ✅ FIX Bug #3 — isMine uses user.id (string comparison safe)
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const same = prev?.senderId === msg.senderId;
    const near = prev && (new Date( msg.created_at) - new Date(prev.createdAt)) < 90000;
    acc.push({ ...msg, first: !same || !near });
    return acc;
  }, []);

  const ctxAccept   = sid => { if (stageCount >= maxStages) { toast.error(isAr ? `المنصة ممتلئة (${maxStages})` : `Stage full (${maxStages})`); return; } emit('stage:accept', { targetSocketId: sid }); setMenuTarget(null); setRaisedHands(p => { const n = new Set(p); n.delete(sid); return n; }); };
  const ctxRemove   = sid => { emit('stage:remove',   { targetSocketId: sid }); setMenuTarget(null); };
  const ctxMute     = sid => { emit('stage:mute',     { targetSocketId: sid }); setMenuTarget(null); };
  const ctxCoHost   = sid => { emit('cohost:add',     { targetSocketId: sid }); setMenuTarget(null); };
  const ctxUnCoHost = sid => { emit('cohost:remove',  { targetSocketId: sid }); setMenuTarget(null); };
  const ctxKick     = sid => { emit('mod:kick',       { targetSocketId: sid }); setMenuTarget(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={18} color="#818CF8" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, fontFamily: font, margin: 0 }}>{roomName}</p>
            {roomDescription && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, margin: '2px 0 0' }}>{roomDescription}</p>}
            <CapBar current={memberCount} max={capacity} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RoomTimer expiresAt={room.expiresAt} isAr={isAr} onWarn={() => { if (amHost) toast(isAr ? '⏰ 5 دقائق متبقية!' : '⏰ 5 minutes left!'); }} />
          {blockedCount > 0 && <span style={{ fontSize: 11, color: '#EF4444', padding: '4px 8px', borderRadius: 99, background: 'rgba(239,68,68,.1)' }}>🚫 {blockedCount}</span>}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* SPEAKERS */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, fontFamily: font, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mic size={14} /> {isAr ? 'المتحدثون' : 'Speakers'} ({stageCount}/{maxStages})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
            {hostMember && (
              <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,.1), rgba(245,158,11,.05))', border: '1.5px solid rgba(245,158,11,.3)', borderRadius: 16, padding: '12px 8px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', borderRadius: 20, padding: '2px 10px', fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                  <Crown size={10} style={{ display: 'inline', marginRight: 3 }} /> HOST
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                  <Ava name={hostMember.fullName} url={hostMember.avatarUrl} size={60} host speaking={speakingIds.has(hostMember.socketId)} />
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '8px 0 4px', fontFamily: font }}>
                    {hostMember.fullName?.split(' ')[0] || hostMember.fullName}
                    {hostMember.socketId === mySocketId && <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}> (me)</span>}
                  </p>
                  <WaveBars active={speakingIds.has(hostMember.socketId)} color="#F59E0B" sm />
                </div>
              </div>
            )}
            {stageMems.filter(m => m.socketId !== roomState?.hostSocketId).map(m => {
              const sid = m.socketId, talking = speakingIds.has(sid), muted = roomState?.members?.[sid]?.muted, isMe = sid === mySocketId, isCH = roomState?.coHosts?.includes(sid);
              return (
                <div key={sid} onClick={() => canCtrl && !isMe && setMenuTarget({ socketId: sid, ...m, isOnStage: true })}

                
                  style={{ background: talking ? 'rgba(34,197,94,.08)' : 'var(--bg-secondary)', border: `1.5px solid ${talking ? 'rgba(34,197,94,.4)' : isCH ? 'rgba(129,140,248,.3)' : 'var(--border)'}`, borderRadius: 16, padding: '12px 8px', textAlign: 'center', cursor: canCtrl && !isMe ? 'pointer' : 'default', position: 'relative' }}>
                  {isCH && <div style={{ position: 'absolute', top: -6, right: -6, background: '#818CF8', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={10} color="#fff" /></div>}
                  {muted && <div style={{ position: 'absolute', top: -6, left: -6, background: '#EF4444', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MicOff size={10} color="#fff" /></div>}
                  <Ava name={m.fullName} url={m.avatarUrl} size={60} speaking={talking && !muted} muted={muted} cohost={isCH} />
                  {/* <p style={{ fontSize: 12, fontWeight: 600, margin: '8px 0 4px', fontFamily: font }}>{isMe ? (isAr ? 'أنا' : 'Me') : m.fullName?.split(' ')[0] || m.fullName}</p> */}
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '8px 0 4px', fontFamily: font, textAlign: 'center', width: '100%' }}>{isMe ? (isAr ? 'أنا' : 'Me') : m.fullName?.split(' ')[0] || m.fullName}</p>
                  {talking && !muted && <WaveBars active sm />}
                </div>
              );
            })}
            {Array.from({ length: Math.max(0, maxStages - stageMems.length) }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: 16, padding: '12px 8px', textAlign: 'center', opacity: 0.5 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-primary)', border: '2px dashed var(--border)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mic size={20} color="var(--text-secondary)" /></div>
                <p style={{ fontSize: 11, marginTop: 8, fontFamily: font }}>{isAr ? 'شاغر' : 'Open'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LISTENERS */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: font, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} /> {isAr ? 'المستمعون' : 'Listeners'} ({audience.length})
          </h3>
          {audience.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-secondary)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 13, fontFamily: font }}>{isAr ? 'لا يوجد مستمعون' : 'No listeners yet'}</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {audience.map(m => {
                const sid = m.socketId, isMe = sid === mySocketId, hasHand = raisedHands.has(sid);
                return (
                  <div key={sid} onClick={() => canCtrl && !isMe && setMenuTarget({ socketId: sid, ...m, isOnStage: false })}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: hasHand ? 'rgba(245,158,11,.1)' : 'var(--bg-secondary)', border: `1px solid ${hasHand ? 'rgba(245,158,11,.3)' : 'var(--border)'}`, borderRadius: 40, cursor: canCtrl && !isMe ? 'pointer' : 'default' }}>
                    <Ava name={m.fullName} url={m.avatarUrl} size={32} hand={hasHand} />
                    <span style={{ fontSize: 13, fontWeight: 500, fontFamily: font }}>{isMe ? (isAr ? 'أنا' : 'Me') : m.fullName}</span>
                    {hasHand && <Hand size={12} color="#F59E0B" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CHAT */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: font, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={14} /> {isAr ? 'الدردشة' : 'Chat'}
          </h3>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 200, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grouped.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: 13, fontFamily: font }}>
                  {isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}
                </div>
              )}
              {grouped.map((msg, i) => {
                // ✅ FIX Bug #3 — compare as strings to be safe
                const isMine = String(msg.senderId) === String(user?.id);
                return (
                  <div key={msg.id || msg.tempId || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    {/* ✅ FIX Bug #2 — show avatar + name for others on first msg in group */}
                    {!isMine && msg.first && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Ava name={msg.sender?.fullName} url={msg.sender?.avatarUrl} size={24} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#818CF8', fontFamily: font }}>
                          {msg.sender?.fullName || 'User'}
                        </span>
                      </div>
                    )}
                    <div style={{
                      maxWidth: '75%',
                      padding: '9px 13px',
                      borderRadius: isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      background: isMine ? '#818CF8' : 'var(--bg-primary)',
                      color: isMine ? '#fff' : 'var(--text-primary)',
                      fontSize: 13,
                      fontFamily: 'var(--font-en)',
                      wordBreak: 'break-word',
                      direction: 'ltr',
                      textAlign: 'left',
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--text-secondary)', margin: '3px 6px 0', opacity: 0.6 }}>
                      {fmtTime( msg.created_at)}
                    </span>
                  </div>
                );
              })}
              {typingUsers.filter(id => id !== mySocketId).length > 0 && (
                <div style={{ padding: '2px 8px' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{isAr ? 'جاري الكتابة...' : 'Typing...'}</span>
                </div>
              )}
              <div ref={msgEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-primary)' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => onType(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
                dir="ltr"
                style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-en)', outline: 'none' }}
              />
              <button onClick={sendMsg} disabled={!input.trim()}
                style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: input.trim() ? '#818CF8' : 'var(--border)', color: '#fff', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--bg-primary)' }}>
        {amStage && (
          <button onClick={toggleMic} style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', background: micOn ? '#22C55E' : '#EF4444', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        )}
        {!amHost && (
          <button onClick={raiseHand} style={{ padding: '10px 20px', borderRadius: 40, border: `1.5px solid ${handRaised ? '#F59E0B' : 'var(--border)'}`, background: handRaised ? 'rgba(245,158,11,.1)' : 'var(--bg-secondary)', color: handRaised ? '#F59E0B' : 'var(--text-primary)', fontSize: 13, fontWeight: 600, fontFamily: font, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hand size={14} /> {handRaised ? (isAr ? 'خفض اليد' : 'Lower Hand') : (isAr ? 'رفع اليد' : 'Raise Hand')}
          </button>
        )}
        {amHost && (
          <button onClick={() => setShowEndDialog(true)} style={{ padding: '10px 20px', borderRadius: 40, border: '1.5px solid #EF4444', background: 'rgba(239,68,68,.1)', color: '#EF4444', fontSize: 13, fontWeight: 600, fontFamily: font, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <PhoneOff size={14} /> {isAr ? 'إنهاء' : 'End Room'}
          </button>
        )}
        <button onClick={() => setShowReportDialog(true)} style={{ padding: '10px 20px', borderRadius: 40, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, fontFamily: font, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Flag size={14} /> {isAr ? 'إبلاغ' : 'Report'}
        </button>
      </div>

      {menuTarget && <CtxMenu />}

      {showLeaveDialog && (
        <LeaveDialog isAr={isAr} font={font} type="leave" onConfirm={() => { setShowLeaveDialog(false); doLeave(); }} onCancel={() => setShowLeaveDialog(false)} />
      )}
      {showEndDialog && amHost && (
        <LeaveDialog isAr={isAr} font={font} type="end" onConfirm={() => { setShowEndDialog(false); emit('room:close', {}); }} onCancel={() => setShowEndDialog(false)} />
      )}
      {showReportDialog && (
        <ReportDialog isAr={isAr} font={font} onClose={() => setShowReportDialog(false)} onSubmit={async ({ reason, description }) => {
          try { await api.post(`/chat/rooms/${room.id}/report`, { reason, description }); toast.success(isAr ? '✅ تم الإبلاغ' : '✅ Reported'); }
          catch { toast.error(isAr ? 'فشل الإبلاغ' : 'Report failed'); }
        }} />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );

  function CtxMenu() {
    if (!menuTarget) return null;
    const { socketId: sid, fullName, isOnStage } = menuTarget;
    const isCH = roomState?.coHosts?.includes(sid);
    return (
      <div onClick={() => setMenuTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 14 }}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: 'var(--bg-primary)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ava name={fullName} url={menuTarget.avatarUrl} size={34} />
            <p style={{ fontWeight: 700, fontSize: 13.5, fontFamily: font, margin: 0 }}>{fullName}</p>
          </div>
          {isOnStage && <button onClick={() => { ctxMute(sid); }} style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}><MicOff size={14} /> {isAr ? 'كتم' : 'Mute'}</button>}
          {isOnStage && <button onClick={() => { ctxRemove(sid); }} style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}><LogOut size={14} /> {isAr ? 'إزالة من المنصة' : 'Remove from stage'}</button>}
          {!isOnStage && <button onClick={() => { ctxAccept(sid); }} style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}><Mic size={14} /> {isAr ? 'قبول على المنصة' : 'Accept to stage'}</button>}
          {isCH
            ? <button onClick={() => { ctxUnCoHost(sid); }} style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}><Shield size={14} /> {isAr ? 'إزالة مشارك' : 'Remove co-host'}</button>
            : <button onClick={() => { ctxCoHost(sid); }} style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}><Shield size={14} /> {isAr ? 'تعيين مشارك' : 'Make co-host'}</button>
          }
          <button onClick={() => { ctxKick(sid); }} style={{ width: '100%', padding: '13px 18px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, color: '#EF4444' }}><UserX size={14} /> {isAr ? 'إخراج' : 'Kick'}</button>
        </div>
      </div>
    );
  }
}