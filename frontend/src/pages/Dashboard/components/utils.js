import api from '../../..//services/api';

export const DEFAULT_PLANS = {
  free:  { stages: 3,  durationMinutes: 30,  canCreate: false, maxRoomsPerDay: 0,  maxRoomsPerMonth: 0,  capacity: 50,  label: 'Free',  color: '#6B7280' },
  pro:   { stages: 6,  durationMinutes: 120, canCreate: true,  maxRoomsPerDay: 2,  maxRoomsPerMonth: 15, capacity: 200, label: 'Pro',   color: '#818CF8' },
  elite: { stages: 8,  durationMinutes: 300, canCreate: true,  maxRoomsPerDay: 3,  maxRoomsPerMonth: 30, capacity: 500, label: 'Elite', color: '#F59E0B' },
};

export const getErr = (err, isAr) => {
  if (!err) return isAr ? 'حدث خطأ' : 'An error occurred';
  const msg = err.response?.data?.message || err.message;
  if (!msg) return isAr ? 'حدث خطأ' : 'An error occurred';
  if (typeof msg === 'string') return msg;
  if (msg.en && msg.ar) return isAr ? msg.ar : msg.en;
  return JSON.stringify(msg);
};

export const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

let badWords = { en: [], ar: [] };
export const loadBadWords = async () => {
  try { const { data } = await api.get('/chat/bad-words'); if (data.data?.list) badWords = data.data.list; }
  catch { badWords = { en: ['fuck','shit','ass','bitch'], ar: ['كس','زب','شرموط','عاهرة'] }; }
};
export const hasBad = text => {
  if (!text) return false;
  const n = text.toLowerCase();
  return badWords.en.some(w => new RegExp(`\\b${w}\\b`, 'gi').test(n)) || badWords.ar.some(w => n.includes(w));
};