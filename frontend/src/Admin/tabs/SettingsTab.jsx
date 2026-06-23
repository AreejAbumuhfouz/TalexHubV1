'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import { Toggle, Spinner, Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { C } from '../components/AdminTokens';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>{children}</div>
  </div>
);

export default function SettingsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const [settings, setSettings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const set = (k, v) => setSettings(s => ({ ...s, [k]:v }));

  useEffect(() => {
    api.get('/admin/settings').then(r=>setSettings(r.data.data.settings||{})).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const saveAll = async () => {
    setSaving(true);
    try { await api.post('/admin/settings/bulk', { settings }); setSaved(true); setTimeout(()=>setSaved(false), 3000); }
    catch {}
    setSaving(false);
  };

  const S = ({ k, label, description }) => (
    <Toggle value={settings[k]==='true'||settings[k]===true} onChange={v=>set(k, v?'true':'false')} label={label} description={description} />
  );
  const N = ({ k, label, description, placeholder }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)' }}>{label}</div>
        {description&&<div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>{description}</div>}
      </div>
      <input type="number" value={settings[k]||''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
        style={{ ...C.input, width:90, textAlign:'center' }} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
    </div>
  );

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={24}/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:640 }}>
      <SH title={isAr?'الإعدادات':'Settings'}>
        {saved&&<span style={{ fontSize:12, color:'#22C55E', display:'flex', alignItems:'center', gap:5 }}><Icon name="check" size={13} color="#22C55E"/>{isAr?'تم الحفظ!':'Saved!'}</span>}
        <Btn variant="primary" onClick={saveAll} loading={saving}>{isAr?'حفظ الإعدادات':'Save Settings'}</Btn>
      </SH>

      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{isAr?'الميزات':'Features'}</div>
        <S k="ALLOW_FREE_ROOM_CREATE"   label={isAr?'إنشاء غرف مجانية':'Allow Free Room Creation'}         description={isAr?'السماح لمستخدمي الباقة المجانية بإنشاء غرف':'Let free plan users create chat rooms'} />
        <S k="ALLOW_FREE_CAREER_PATH"  label={isAr?'مسار مهني مجاني':'Allow Free Career Path'}             description={isAr?'السماح بمسار مهني للباقة المجانية':'Let free plan users access career path'} />
        <S k="ALLOW_FREE_AUTO_APPLY"   label={isAr?'تقديم تلقائي مجاني':'Allow Free Auto Apply'} />
        <S k="MAINTENANCE_MODE"        label={isAr?'وضع الصيانة':'Maintenance Mode'}                        description={isAr?'إيقاف الموقع مؤقتاً':'Temporarily take down the site'} />
      </div>

      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{isAr?'التقديم التلقائي — Auto Apply':'Auto Apply Settings'}</div>
        <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:14 }}>{isAr?'تحكم في حدود التقديم التلقائي لكل باقة':'Control auto-apply limits per plan'}</div>
        <N k="autoApply.dailyLimit.pro"     label={isAr?'الحد اليومي — Pro (تقديمات/يوم)':'Pro Daily Limit (applies/day)'}         description={isAr?'عدد التقديمات التلقائية اليومية لمشتركي Pro':'Daily auto-applies for Pro subscribers'}  placeholder="3"  />
        <N k="autoApply.dailyLimit.elite"   label={isAr?'الحد اليومي — Elite (تقديمات/يوم)':'Elite Daily Limit (applies/day)'}       description={isAr?'عدد التقديمات التلقائية اليومية لمشتركي Elite':'Daily auto-applies for Elite subscribers'} placeholder="10" />
        <N k="autoApply.monthlyLimit.pro"   label={isAr?'الحد الشهري — Pro (تقديمات/شهر)':'Pro Monthly Limit (applies/month)'}      description={isAr?'إجمالي التقديمات التلقائية الشهرية لمشتركي Pro':'Monthly auto-applies for Pro subscribers'}   placeholder="30" />
        <N k="autoApply.monthlyLimit.elite" label={isAr?'الحد الشهري — Elite (تقديمات/شهر)':'Elite Monthly Limit (applies/month)'}  description={isAr?'إجمالي التقديمات التلقائية الشهرية لمشتركي Elite':'Monthly auto-applies for Elite subscribers'} placeholder="100"/>
        <N k="autoApply.matchThreshold"     label={isAr?'الحد الأدنى للتطابق (%)':'Min Match Threshold (%)'}                        description={isAr?'لن يتقدم AI إلا على وظائف تتجاوز هذه النسبة':'AI only applies to jobs above this score'}   placeholder="65" />
        <S k="ALLOW_FREE_AUTO_APPLY" label={isAr?'السماح بالتقديم التلقائي للباقة المجانية':'Allow Auto-Apply for Free Plan'} description={isAr?'تجريبي — غير موصى به':'Experimental — not recommended'} />
      </div>
        <N k="OTP_EXPIRY_MINUTES"         label={isAr?'انتهاء OTP (دقائق)':'OTP Expiry (minutes)'}        placeholder="10" />
        <N k="AI_MIN_MATCH_SCORE"         label={isAr?'الحد الأدنى لنتيجة AI':'AI Min Match Score'}        placeholder="60" />
        <N k="REFERRAL_REWARD_POINTS"     label={isAr?'نقاط مكافأة الإحالة':'Referral Reward Points'}     placeholder="100" />
        <N k="POINTS_PER_USD"            label={isAr?'نقاط لكل دولار':'Points Per USD'}                   placeholder="100" />
        <N k="MIN_WITHDRAWAL_POINTS"      label={isAr?'الحد الأدنى للسحب':'Min Withdrawal Points'}         placeholder="500" />
        <N k="FREE_CHAT_MINUTES_PER_WEEK" label={isAr?'دقائق دردشة مجانية / أسبوع':'Free Chat Min/Week'} placeholder="60" />
        <N k="MAX_FILE_SIZE_MB"          label={isAr?'الحد الأقصى لحجم الملف (MB)':'Max File Size (MB)'}  placeholder="10" />
        <N k="MAX_CVS_PER_USER"          label={isAr?'الحد الأقصى لعدد السيرات الذاتية':'Max CVs/User'}  placeholder="5" />
      </div>
    
  );
}