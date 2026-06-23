
'use strict';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Send, RefreshCw, ChevronDown,
  Sparkles, Clock, MessageSquare, Trophy, Brain, ArrowLeft, X, Calendar,
  AlertCircle, Shield, Crown, Zap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

const getErrorMessage = (err, isAr) => {
  if (!err) return isAr ? 'حدث خطأ' : 'An error occurred';
  const msg = err.response?.data?.message || err.message;
  if (!msg) return isAr ? 'حدث خطأ' : 'An error occurred';
  if (typeof msg === 'string') return msg;
  if (typeof msg === 'object') {
    if (msg.en && msg.ar) return isAr ? msg.ar : msg.en;
    return JSON.stringify(msg);
  }
  return String(msg);
};

const gradeColor = {
  excellent: '#22C55E',
  good: '#3B82F6',
  average: '#F59E0B',
  needs_improvement: '#EF4444',
};
const gradeBg = {
  excellent: 'rgba(34,197,94,0.1)',
  good: 'rgba(59,130,246,0.1)',
  average: 'rgba(245,158,11,0.1)',
  needs_improvement: 'rgba(239,68,68,0.1)',
};
const gradeLabel = {
  excellent: { ar: 'ممتاز', en: 'Excellent' },
  good: { ar: 'جيد', en: 'Good' },
  average: { ar: 'متوسط', en: 'Average' },
  needs_improvement: { ar: 'يحتاج تطوير', en: 'Needs Improvement' },
};

function ScoreRing({ score = 0, size = 72 }) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(Math.max(score, 0), 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={size/2} y={size/2} dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: 14, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}
        transform={`rotate(90,${size/2},${size/2})`}>
        {score}%
      </text>
    </svg>
  );
}

function VoiceWave({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 20 }}>
      {[1, 1.8, 2.5, 1.8, 1].map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: active ? '#22C55E' : 'var(--border)',
          height: active ? `${h * 7}px` : '3px',
          transition: 'all 0.15s ease',
          animation: active ? `wv${i} ${0.5 + i * 0.1}s ease-in-out infinite alternate` : 'none',
        }} />
      ))}
      <style>{`
        @keyframes wv0{from{height:5px}to{height:14px}}
        @keyframes wv1{from{height:9px}to{height:20px}}
        @keyframes wv2{from{height:12px}to{height:24px}}
        @keyframes wv3{from{height:9px}to{height:18px}}
        @keyframes wv4{from{height:5px}to{height:12px}}
      `}</style>
    </div>
  );
}

function ConfirmDialog({ isAr, font, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, type = 'warning' }) {
  const colors = {
    warning: { bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.3)', icon: '⚠️', color: '#F59E0B' },
    danger: { bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.3)', icon: '🚫', color: '#EF4444' },
    info: { bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.3)', icon: 'ℹ️', color: '#3B82F6' },
  };
  const c = colors[type] || colors.warning;
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-primary)', borderRadius: 20, overflow: 'hidden',
        border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,.3)',
        animation: 'slideUp .3s ease',
      }}>
        <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: c.bg, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>{c.icon}</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: font, margin: '0 0 8px', color: 'var(--text-primary)' }}>{title}</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
        </div>
        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: font, transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            {cancelLabel || (isAr ? 'إلغاء' : 'Cancel')}
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px 16px', borderRadius: 12, border: 'none', background: c.color, color: '#fff', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: font, transition: 'opacity .2s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
            {confirmLabel || (isAr ? 'تأكيد' : 'Confirm')}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function useSpeechToText({ lang, onTranscript, onInterim }) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);
  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' '; else interim += t;
      }
      if (final) onTranscript(final);
      if (interim && onInterim) onInterim(interim);
    };
    rec.start(); recRef.current = rec;
  }, [lang, onTranscript, onInterim]);
  const stop = useCallback(() => { recRef.current?.stop(); recRef.current = null; setListening(false); }, []);
  return { listening, supported, start, stop };
}

// LIMITS DISPLAY COMPONENT - المعدل
function LimitsDisplay({ isAr, font, usage, limits, userPlan, walletBalance }) {
  const getPlanIcon = () => {
    switch(userPlan?.toLowerCase()) {
      case 'pro': return <Crown size={16} color="#F59E0B" />;
      case 'elite': return <Zap size={16} color="#8B5CF6" />;
      default: return <Shield size={16} color="#6B7280" />;
    }
  };

  const getPlanColor = () => {
    switch(userPlan?.toLowerCase()) {
      case 'pro': return '#F59E0B';
      case 'elite': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const usedToday = usage?.today || 0;
  const usedMonth = usage?.thisMonth || 0;
  const limitPerDay = limits?.perDay || 0;
  const limitPerMonth = limits?.perMonth || 0;
  const isCreationAllowed = limits?.allowCreation !== false;
  
  const remainingToday = limitPerDay - usedToday;
  const remainingMonth = limitPerMonth - usedMonth;
  const isLimitReached = !isCreationAllowed || (limitPerDay > 0 && usedToday >= limitPerDay) || (limitPerMonth > 0 && usedMonth >= limitPerMonth);

  // للخطة FREE - عرض رسالة الترقية فقط
  if (userPlan === 'free' || !isCreationAllowed) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        border: '1px solid #F59E0B',
        borderRadius: 14,
        padding: '20px 18px',
        marginBottom: 20,
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <Shield size={24} color="#F59E0B" />
          <span style={{ fontWeight: 800, fontSize: 16, color: '#F59E0B' }}>FREE Plan</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {isAr 
            ? 'مقابلات الذكاء الاصطناعي غير متاحة للخطة المجانية'
            : 'AI interviews are not available for the free plan'}
        </p>
        <button
          onClick={() => window.location.href = '/pricing'}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            border: 'none',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🚀 {isAr ? 'قم بترقية خطتك الآن' : 'Upgrade Your Plan Now'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      border: `1px solid ${isLimitReached ? '#EF4444' : 'var(--border)'}`,
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getPlanIcon()}
          <span style={{ fontWeight: 700, fontSize: 13, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em', color: getPlanColor() }}>
            {isAr ? `باقة ${userPlan || 'FREE'}` : `${userPlan || 'FREE'} Plan`}
          </span>
          {userPlan !== 'free' && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 99,
              background: `${getPlanColor()}20`,
              color: getPlanColor(),
              fontWeight: 600
            }}>
              {userPlan === 'pro' ? (isAr ? 'محترف' : 'Professional') : (isAr ? 'نخبة' : 'Elite')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLimitReached ? '#EF4444' : '#22C55E' }} />
          <span style={{ fontSize: 11, color: isLimitReached ? '#EF4444' : 'var(--text-secondary)', fontFamily: font }}>
            {isLimitReached 
              ? (isAr ? '⚠️ تم الوصول للحد الأقصى' : '⚠️ Limit reached')
              : (isAr ? 'متاح' : 'Available')}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}>
        {/* Daily Limit - عرض المستخدم/الإجمالي */}
        <div style={{
          padding: '10px 12px',
          background: 'var(--bg-primary)',
          borderRadius: 10,
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Calendar size={13} color="var(--text-secondary)" />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, textTransform: 'uppercase' }}>
              {isAr ? 'اليوم' : 'Today'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-en)', color: remainingToday <= 0 ? '#EF4444' : 'var(--text-primary)' }}>
              {usedToday}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: font }}>
              / {limitPerDay === 0 ? '∞' : limitPerDay}
            </span>
          </div>
          <div style={{
            height: 3,
            background: 'var(--border)',
            borderRadius: 99,
            marginTop: 8,
            overflow: 'hidden',
          }}>
            <div style={{
              width: limitPerDay === 0 ? 0 : `${(usedToday / limitPerDay) * 100}%`,
              height: '100%',
              background: remainingToday <= 0 ? '#EF4444' : remainingToday <= 2 ? '#F59E0B' : '#22C55E',
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Monthly Limit - عرض المستخدم/الإجمالي */}
        <div style={{
          padding: '10px 12px',
          background: 'var(--bg-primary)',
          borderRadius: 10,
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={13} color="var(--text-secondary)" />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, textTransform: 'uppercase' }}>
              {isAr ? 'الشهر' : 'Month'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-en)', color: remainingMonth <= 0 ? '#EF4444' : 'var(--text-primary)' }}>
              {usedMonth}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: font }}>
              / {limitPerMonth === 0 ? '∞' : limitPerMonth}
            </span>
          </div>
          <div style={{
            height: 3,
            background: 'var(--border)',
            borderRadius: 99,
            marginTop: 8,
            overflow: 'hidden',
          }}>
            <div style={{
              width: limitPerMonth === 0 ? 0 : `${(usedMonth / limitPerMonth) * 100}%`,
              height: '100%',
              background: remainingMonth <= 0 ? '#EF4444' : remainingMonth <= 3 ? '#F59E0B' : '#22C55E',
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Points */}
        {/* <div style={{
          padding: '10px 12px',
          background: 'var(--bg-primary)',
          borderRadius: 10,
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Sparkles size={13} color="#F59E0B" />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, textTransform: 'uppercase' }}>
              {isAr ? 'النقاط' : 'Points'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-en)', color: '#F59E0B' }}>
              {walletBalance || 0}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>
              {isAr ? 'نقطة' : 'pts'}
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6, fontFamily: font }}>
            {isAr ? 'كل مقابلة = 2 نقطة لكل سؤال' : 'Each interview = 2 points per question'}
          </div>
        </div> */}
      </div>

      {isLimitReached && (
        <div style={{
          marginTop: 12,
          padding: '10px 12px',
          background: 'rgba(239,68,68,0.1)',
          borderRadius: 10,
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <AlertCircle size={14} color="#EF4444" />
          <span style={{ fontSize: 12, color: '#EF4444', fontFamily: font }}>
            {isAr 
              ? 'لقد وصلت إلى الحد الأقصى للاستخدام اليومي أو الشهري.'
              : 'You have reached your daily or monthly limit.'}
          </span>
        </div>
      )}
    </div>
  );
}

// ✅ SETUP SCREEN - المعدل
function SetupScreen({ isAr, font, onStart, limits, usage, walletBalance, userPlan }) {
  const { user } = useAuthStore();
  const [jobTitle, setJobTitle] = useState('');
  const [suggestions, setSugg] = useState([]);
  const [showDropdown, setShowDD] = useState(false);
  const [loadingTitles, setLoadT] = useState(true);
  const [difficulty, setDifficulty] = useState('medium');
  const [lang, setLang] = useState(isAr ? 'ar' : 'en');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const titleFromProfile = user?.headline || '';
    if (titleFromProfile) setJobTitle(titleFromProfile);
    api.get('/applications/me', { params: { limit: 20 } })
      .then(({ data }) => {
        const titles = [...new Set((data.data?.rows || data.data || []).map(a => a.jobTitle || a.job?.title).filter(Boolean))];
        const all = titleFromProfile ? [titleFromProfile, ...titles.filter(t => t !== titleFromProfile)] : titles;
        setSugg(all.slice(0, 8));
      }).catch(() => { if (titleFromProfile) setSugg([titleFromProfile]); })
      .finally(() => setLoadT(false));
  }, [user]);

  const usedToday = usage?.today || 0;
  const usedMonth = usage?.thisMonth || 0;
  const limitPerDay = limits?.perDay || 0;
  const limitPerMonth = limits?.perMonth || 0;
  const isCreationAllowed = limits?.allowCreation !== false;
  
  const hasReachedDailyLimit = limitPerDay > 0 && usedToday >= limitPerDay;
  const hasReachedMonthlyLimit = limitPerMonth > 0 && usedMonth >= limitPerMonth;
  const hasReachedLimit = !isCreationAllowed || hasReachedDailyLimit || hasReachedMonthlyLimit;

  const handleStart = async () => {
    if (!jobTitle.trim()) { 
      toast.error(isAr ? 'أدخل المسمى الوظيفي' : 'Enter a job title'); 
      return; 
    }
    
    if (hasReachedLimit) {
      if (userPlan === 'free') {
        toast.error(isAr 
          ? 'مقابلات الذكاء الاصطناعي غير متاحة للخطة المجانية. قم بترقية خطتك.'
          : 'AI interviews are not available for the free plan. Please upgrade.');
      } else {
        toast.error(isAr 
          ? 'لقد وصلت إلى الحد الأقصى للاستخدام. قم بترقية خطتك للمزيد من المقابلات.'
          : 'You have reached your usage limit. Upgrade your plan for more interviews.');
      }
      return;
    }

    const pointsNeeded = count * 2;
    if (walletBalance < pointsNeeded) {
      toast.error(isAr ? `رصيدك غير كافٍ (${walletBalance} نقطة). تحتاج ${pointsNeeded} نقطة.` : `Insufficient balance (${walletBalance} pts). Need ${pointsNeeded} pts.`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/training/generate', { jobTitle: jobTitle.trim(), difficulty, count, language: lang });
      onStart({
        jobTitle: jobTitle.trim(), difficulty, language: lang,
        questions: [
          { id: 0, type: 'general', isIntro: true,
            question: lang === 'ar' ? 'عرّف عن نفسك — من أنت؟ وما هي خبراتك ومهاراتك الرئيسية؟' : 'Tell me about yourself — who are you, and what are your main skills and experiences?',
            hint: lang === 'ar' ? 'ابدأ بالاسم والمسمى، ثم أبرز إنجازاتك وخبرتك.' : 'Start with your name and title, highlight key achievements.',
            timeSeconds: 120,
          },
          ...(data.data?.questions || []),
        ],
        pointsUsed: pointsNeeded,
      });
    } catch (err) { 
      toast.error(getErrorMessage(err, isAr)); 
    }
    finally { 
      setLoading(false); 
    }
  };

  const difficulties = [
    { key: 'easy', ar: 'سهل', en: 'Easy', color: '#22C55E' },
    { key: 'medium', ar: 'متوسط', en: 'Medium', color: '#F59E0B' },
    { key: 'hard', ar: 'صعب', en: 'Hard', color: '#EF4444' },
  ];
  const filtered = suggestions.filter(s => s.toLowerCase().includes(jobTitle.toLowerCase()) && s !== jobTitle);

  const getButtonText = () => {
    if (loading) return isAr ? 'جاري التحضير...' : 'Preparing...';
    if (hasReachedLimit) {
      if (userPlan === 'free') return isAr ? 'الخطة المجانية غير مدعومة' : 'Free plan not supported';
      return isAr ? 'تم الوصول للحد الأقصى' : 'Limit Reached';
    }
    if (!jobTitle.trim()) return isAr ? 'أدخل المسمى الوظيفي' : 'Enter Job Title';
    return isAr ? 'ابدأ المقابلة' : 'Start Interview';
  };

  const isButtonDisabled = loading || !jobTitle.trim() || hasReachedLimit;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,28px)', maxWidth: 600, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="var(--text-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: font }}>{isAr ? 'تدريب المقابلة بالذكاء الاصطناعي' : 'AI Interview Training'}</h1>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>{isAr ? 'استعد لمقابلتك القادمة مع مدرب AI' : 'Prepare for your next interview with AI coach'}</p>
          </div>
        </div>

        <LimitsDisplay 
          isAr={isAr} 
          font={font} 
          usage={usage} 
          limits={limits} 
          userPlan={userPlan}
          walletBalance={walletBalance}
        />
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isAr ? 'المسمى الوظيفي *' : 'Job Title *'}</label>
          <div style={{ position: 'relative' }}>
            <input 
              ref={inputRef} 
              value={jobTitle} 
              onChange={e => { setJobTitle(e.target.value); setShowDD(true); }} 
              onFocus={(e) => { setShowDD(true); e.target.style.borderColor = 'var(--text-primary)'; }} 
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; setTimeout(() => setShowDD(false), 150); }}
              placeholder={loadingTitles ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'مثال: مطور واجهة أمامية' : 'e.g. Frontend Developer')}
              dir={isAr ? 'rtl' : 'ltr'}
              style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: font, boxSizing: 'border-box' }}
            />
            {jobTitle ? (
              <button onClick={() => { setJobTitle(''); inputRef.current?.focus(); }} style={{ position: 'absolute', insetInlineEnd: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 3 }}><X size={14} /></button>
            ) : (
              <ChevronDown size={14} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineEnd: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            )}
          </div>
          {showDropdown && filtered.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 11, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
              {filtered.map((s, i) => (
                <button key={i} onMouseDown={() => { setJobTitle(s); setShowDD(false); }} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13.5, fontFamily: font, textAlign: isAr ? 'right' : 'left', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 9, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isAr ? 'مستوى الصعوبة' : 'Difficulty Level'}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {difficulties.map(d => (
              <button key={d.key} onClick={() => setDifficulty(d.key)} style={{ flex: 1, padding: '9px 8px', borderRadius: 10, border: `1.5px solid ${difficulty === d.key ? d.color : 'var(--border)'}`, background: difficulty === d.key ? `${d.color}15` : 'var(--bg-primary)', color: difficulty === d.key ? d.color : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>{isAr ? d.ar : d.en}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7, fontFamily: font }}>{isAr ? 'عدد الأسئلة' : 'Questions'}</label>
            <select value={count} onChange={e => setCount(+e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: font, cursor: 'pointer' }}>
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} {isAr ? 'أسئلة' : 'questions'}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7, fontFamily: font }}>{isAr ? 'لغة المقابلة' : 'Language'}</label>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: font, cursor: 'pointer' }}>
              <option value="ar">{isAr ? 'العربية' : 'Arabic'}</option>
              <option value="en">{isAr ? 'الإنجليزية' : 'English'}</option>
            </select>
          </div>
        </div>

        <button onClick={handleStart} disabled={isButtonDisabled} style={{ width: '100%', padding: '13px', borderRadius: 12, background: !isButtonDisabled ? 'var(--text-primary)' : 'var(--bg-primary)', color: !isButtonDisabled ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: !isButtonDisabled ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: `1px solid ${!isButtonDisabled ? 'transparent' : 'var(--border)'}`, opacity: isButtonDisabled ? 0.6 : 1 }}>
          {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> {isAr ? 'جاري التحضير...' : 'Preparing...'}</> : <><Sparkles size={16} /> {getButtonText()}</>}
        </button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        <p style={{ fontWeight: 700, fontSize: 13, fontFamily: font, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} color="#F59E0B" /> {isAr ? 'نصائح للنجاح' : 'Tips for success'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(isAr ? ['اقرأ السؤال بعناية قبل الإجابة', 'استخدم أسلوب STAR للأسئلة السلوكية', 'كن محدداً وأعط أمثلة حقيقية', 'يمكنك الكتابة أو التحدث بالميكروفون'] : ['Read each question carefully', 'Use the STAR method', 'Be specific and give examples', 'Speak into the mic — your words appear instantly']).map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.5 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', flexShrink: 0, marginTop: 6 }} />{tip}</div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// InterviewScreen (نفسه بدون تغيير)
function InterviewScreen({ session, isAr, font, onFinish }) {
  const { questions, jobTitle, language } = session;
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [interim, setInterim] = useState('');
  const [results, setResults] = useState([]);
  const [scoring, setScoring] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const textareaRef = useRef(null);
  const answerRef = useRef('');

  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { setInterim(''); }, [current]);

  const onTranscript = useCallback((finalText) => {
    setAnswer(prev => { const trimmed = prev.trimEnd(); return trimmed ? trimmed + ' ' + finalText.trim() : finalText.trim(); });
    setInterim('');
  }, []);
  const onInterimUpdate = useCallback((text) => { setInterim(text); }, []);
  const { listening, supported, start: startSTT, stop: stopSTT } = useSpeechToText({ lang: language, onTranscript, onInterim: onInterimUpdate });

  const toggleMic = () => {
    if (listening) { stopSTT(); }
    else { if (!supported) { toast.error(isAr ? 'متصفحك لا يدعم التعرف على الصوت' : 'Browser does not support speech recognition'); return; } setInterim(''); startSTT(); }
  };
  useEffect(() => () => stopSTT(), []);

  const submitAnswer = async () => {
    const finalAnswer = (answer + ' ' + interim).trim();
    if (!finalAnswer) { toast.error(isAr ? 'اكتب أو قل إجابتك أولاً' : 'Please write or speak your answer first'); return; }
    if (listening) stopSTT();
    setScoring(true);
    const q = questions[current];
    try {
      const { data } = await api.post('/training/score', { question: q.question, answer: finalAnswer, jobTitle, language });
      const result = data.data || { score: 70, grade: 'good', feedback: '—', strengths: [], improvements: [], betterAnswer: '' };
      const newResults = [...results, { question: q, answer: finalAnswer, ...result }];
      setResults(newResults);
      if (current + 1 < questions.length) { setCurrent(c => c + 1); setAnswer(''); setInterim(''); setTimeout(() => textareaRef.current?.focus(), 100); }
      else { onFinish(newResults); }
    } catch (err) { toast.error(getErrorMessage(err, isAr)); }
    finally { setScoring(false); }
  };

  const confirmEndEarly = () => {
    setShowEndDialog(false);
    if (listening) stopSTT();
    const finalAnswer = (answer + ' ' + interim).trim();
    let currentResults;
    if (finalAnswer) {
      const q = questions[current];
      currentResults = [...results, { question: q, answer: finalAnswer, score: 0, grade: 'average', feedback: isAr ? 'تم إنهاء المقابلة مبكراً' : 'Interview ended early', strengths: [], improvements: [], betterAnswer: '' }];
    } else { currentResults = results; }
    onFinish(currentResults);
  };

  const q = questions[current];
  const total = questions.length;
  const progress = total > 1 ? Math.round((current / (total - 1)) * 100) : 100;
  const typeLabel = { behavioral: isAr ? 'سلوكي' : 'Behavioral', technical: isAr ? 'تقني' : 'Technical', situational: isAr ? 'ظرفي' : 'Situational', general: isAr ? 'عام' : 'General' };
  const typeColor = { behavioral: '#8B5CF6', technical: '#3B82F6', situational: '#F59E0B', general: '#6B7280' };
  const tc = q?.isIntro ? '#BD8E50' : (typeColor[q?.type] || '#6B7280');
  const tLabel = q?.isIntro ? (isAr ? '👋 تعريف بالنفس' : '👋 Self-Intro') : (typeLabel[q?.type] || typeLabel.general);
  const hasContent = (answer + interim).trim().length > 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: font, color: 'var(--text-primary)' }}>{jobTitle}</span>
            <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, background: `${tc}15`, color: tc, fontWeight: 600 }}>{tLabel}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, fontWeight: 600 }}>{isAr ? `${current + 1} من ${total}` : `${current + 1} / ${total}`}</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'var(--text-primary)', borderRadius: 99, transition: 'width .4s ease' }} /></div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,28px)', maxWidth: 680, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MessageSquare size={16} color="var(--text-secondary)" /></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 8px', fontFamily: font, textTransform: 'uppercase', letterSpacing: '.06em' }}>{isAr ? 'السؤال' : 'Question'} {current + 1}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: font, lineHeight: 1.6 }}>{q?.question}</p>
              {q?.hint && (
                <div style={{ marginTop: 12, padding: '9px 13px', borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <Sparkles size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.5 }}>{isAr ? 'تلميح: ' : 'Hint: '}{q.hint}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: `1.5px solid ${listening ? 'rgba(34,197,94,.5)' : 'var(--border)'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12, transition: 'border-color .3s', boxShadow: listening ? '0 0 0 3px rgba(34,197,94,.1)' : 'none' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: font }}>{isAr ? 'إجابتك' : 'Your Answer'}</span>
            <button onClick={toggleMic} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 8, border: `1px solid ${listening ? '#22C55E' : 'var(--border)'}`, background: listening ? 'rgba(34,197,94,.1)' : 'var(--bg-primary)', color: listening ? '#22C55E' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: font }}>
              {listening ? <><VoiceWave active /> {isAr ? 'إيقاف' : 'Stop'}</> : <><Mic size={13} /> {isAr ? 'تحدث' : 'Speak'}</>}
            </button>
          </div>
          <textarea ref={textareaRef} value={answer} onChange={e => setAnswer(e.target.value)} placeholder={isAr ? 'اكتب إجابتك هنا...' : 'Type your answer here...'} dir={language === 'ar' ? 'rtl' : 'ltr'} rows={6}
            style={{ width: '100%', padding: '14px 16px', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 14, fontFamily: font, resize: 'none', lineHeight: 1.65, boxSizing: 'border-box' }} />
          {listening && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(34,197,94,.2)', background: 'rgba(34,197,94,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'micpulse 1s ease-in-out infinite' }} />
              <span style={{ fontSize: 11.5, color: '#22C55E', fontFamily: font, fontWeight: 600 }}>{isAr ? 'يستمع... تحدث الآن' : 'Listening... speak now'}</span>
              <style>{`@keyframes micpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}`}</style>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={submitAnswer} disabled={scoring || !hasContent} style={{ flex: 1, padding: '13px', borderRadius: 11, background: hasContent ? 'var(--text-primary)' : 'var(--bg-secondary)', color: hasContent ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: hasContent ? 'pointer' : 'default', fontSize: 14, fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: `1px solid ${hasContent ? 'transparent' : 'var(--border)'}`, minWidth: 200 }}>
            {scoring ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> {isAr ? 'جاري التقييم...' : 'Scoring...'}</> : current + 1 < total ? <><Send size={15} /> {isAr ? 'إرسال والتالي' : 'Submit & Next'}</> : <><Trophy size={15} /> {isAr ? 'إنهاء المقابلة' : 'Finish Interview'}</>}
          </button>
          <button onClick={() => setShowEndDialog(true)} style={{ padding: '10px 16px', borderRadius: 11, border: '1.5px solid #EF4444', background: 'rgba(239,68,68,.08)', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: font, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><X size={14} /> {isAr ? 'إنهاء مبكراً' : 'End Early'}</button>
        </div>
      </div>

      {showEndDialog && (
        <ConfirmDialog
          isAr={isAr} font={font}
          title={isAr ? 'إنهاء المقابلة' : 'End Interview'}
          message={isAr
            ? `لديك ${total - current - 1} أسئلة متبقية. هل أنت متأكد من إنهاء المقابلة الآن؟\n\nسيتم حفظ تقدمك وخصم المقابلة من رصيدك.`
            : `You have ${total - current - 1} questions remaining. Are you sure you want to end now?\n\nYour progress will be saved and this interview will be deducted from your balance.`
          }
          confirmLabel={isAr ? 'نعم، إنهاء' : 'Yes, End'} cancelLabel={isAr ? 'استمرار' : 'Continue'}
          type="warning" onConfirm={confirmEndEarly} onCancel={() => setShowEndDialog(false)}
        />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ResultsScreen({ results, jobTitle, isAr, font, onRestart }) {
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (r.score || 0), 0) / results.length) : 0;
  const overall = avg >= 80 ? 'excellent' : avg >= 60 ? 'good' : avg >= 40 ? 'average' : 'needs_improvement';
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,28px)', maxWidth: 700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <ScoreRing score={avg} size={84} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 5px', fontFamily: font, textTransform: 'uppercase', letterSpacing: '.06em' }}>{isAr ? 'نتيجة المقابلة النهائية' : 'Overall Interview Score'}</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', fontFamily: font, color: 'var(--text-primary)' }}>{jobTitle}</p>
          <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: gradeBg[overall], color: gradeColor[overall], border: `1px solid ${gradeColor[overall]}33` }}>{gradeLabel[overall]?.[isAr ? 'ar' : 'en'] || (isAr ? 'غير مقيّم' : 'Not Rated')}</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[{ val: results.length, label: isAr ? 'سؤال' : 'Questions' }, { val: results.filter(r => (r.score || 0) >= 70).length, label: isAr ? 'ممتاز' : 'Excellent' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{s.val}</div><div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>{s.label}</div></div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {results.map((r, i) => {
          const g = r.grade || 'average';
          return (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px', fontFamily: font }}>{isAr ? `سؤال ${i + 1}` : `Question ${i + 1}`}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: font, lineHeight: 1.5 }}>{r.question?.question}</p>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: gradeColor[g] || '#6B7280', fontFamily: 'var(--font-en)' }}>{r.score || 0}</div>
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 99, background: gradeBg[g] || 'rgba(107,114,128,.1)', color: gradeColor[g] || '#6B7280', fontWeight: 600 }}>{gradeLabel[g]?.[isAr ? 'ar' : 'en'] || (isAr ? 'غير مقيّم' : 'Not Rated')}</span>
                </div>
              </div>
              {r.feedback && <div style={{ padding: '12px 18px' }}><p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.55 }}>{r.feedback}</p></div>}
            </div>
          );
        })}
      </div>
      <button onClick={onRestart} style={{ width: '100%', padding: '13px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <RefreshCw size={15} /> {isAr ? 'مقابلة جديدة' : 'New Interview'}
      </button>
    </div>
  );
}

// MAIN PAGE
export default function InterviewPage() {
  const { lang } = useLang();
  const { user } = useAuthStore();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [collapsed, setCollapsed] = useState(false);
  const [screen, setScreen] = useState('setup');
  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);
  const [limits, setLimits] = useState(null);
  const [usage, setUsage] = useState({ today: 0, thisMonth: 0 });
  const [walletBalance, setWalletBalance] = useState(0);
  const [userPlan, setUserPlan] = useState(user?.planKey || user?.plan_key || user?.plan || 'free');

  useEffect(() => {
    api.get('/training/limits')
      .then(({ data }) => {
        if (data.data) {
          setLimits(data.data.limits);
          setUsage(data.data.usage || { today: 0, thisMonth: 0 });
        }
      })
      .catch((err) => {
        console.error('Failed to load limits:', err);
        const defaultLimits = {
          free: { perDay: 0, perMonth: 0, allowCreation: false },
          pro: { perDay: 3, perMonth: 18, allowCreation: true },
          elite: { perDay: 5, perMonth: 24, allowCreation: true },
        };
        setLimits(defaultLimits[userPlan] || defaultLimits.free);
      });
  }, [userPlan]);

  useEffect(() => {
    api.get('/wallet/me')
      .then(({ data }) => setWalletBalance(data.data?.pointsBalance || 0))
      .catch(() => {});
  }, []);

  const handleStart = (sessionData) => {
    if (!sessionData.questions?.length) { toast.error(isAr ? 'لم يتم توليد أسئلة' : 'No questions generated'); return; }
    setSession(sessionData); setResults([]); setScreen('interview');
  };

  const handleFinish = async (finalResults) => {
    setResults(finalResults); 
    setScreen('results');

    setUsage(prev => ({ 
      today: prev.today + 1, 
      thisMonth: prev.thisMonth + 1 
    }));

    if (session?.pointsUsed) {
      try {
        await api.post('/training/deduct-points', {
          points: session.pointsUsed,
          description: `AI Interview: ${session.jobTitle}`,
        });
        setWalletBalance(prev => Math.max(0, prev - session.pointsUsed));
      } catch {
        console.log('Points deduction failed');
      }
    }

    if (session) {
      api.post('/training/sessions', {
        jobTitle: session.jobTitle, 
        questions: session.questions,
        answers: finalResults.map(r => r.answer),
        overallScore: Math.round(finalResults.reduce((s, r) => s + (r.score || 0), 0) / finalResults.length),
      }).catch(() => {});
    }
  };

  return (
    <>
<style>{`*{box-sizing:border-box}body{margin:0}@media(max-width:1024px){.int-wrap{padding-bottom:72px!important}}*::-webkit-scrollbar{display:none}*{-ms-overflow-style:none;scrollbar-width:none}`}</style>      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <MobileTopBar title={isAr ? 'تدريب المقابلة' : 'Interview Training'} />
          <div className="int-wrap" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {screen === 'setup' && <SetupScreen isAr={isAr} font={font} onStart={handleStart} limits={limits} usage={usage} walletBalance={walletBalance} userPlan={userPlan} />}
            {screen === 'interview' && session && <InterviewScreen session={session} isAr={isAr} font={font} onFinish={handleFinish} />}
            {screen === 'results' && <ResultsScreen results={results} jobTitle={session?.jobTitle || ''} isAr={isAr} font={font} onRestart={() => setScreen('setup')} />}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
}