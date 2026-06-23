'use strict';
import AdminExportBtn from '../components/AdminExportBtn';
import { Icon } from '../components/AdminIcons';
import useLangStore from '../../i18n';

const SH = ({ title }) => (
  <div style={{ marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
  </div>
);

export default function ReportsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';

  const reports = [
    { type:'users',        icon:'users',      color:'#7B72EE', label:isAr?'تصدير المستخدمين':'Export Users',             desc:isAr?'جميع المستخدمين — اسم، بريد، دور، باقة':'All users — name, email, role, plan' },
    { type:'jobs',         icon:'jobs',       color:'#3B82F6', label:isAr?'تصدير الوظائف':'Export Jobs',                desc:isAr?'جميع الوظائف — عنوان، شركة، طلبات':'All jobs — title, company, applications' },
    { type:'companies',    icon:'companies',  color:'#F59E0B', label:isAr?'تصدير الشركات':'Export Companies',           desc:isAr?'جميع الشركات — اسم، صناعة، مالك':'All companies — name, industry, owner' },
    { type:'applications', icon:'audit',      color:'#EC4899', label:isAr?'تصدير الطلبات':'Export Applications',       desc:isAr?'جميع طلبات التوظيف':'All job applications' },
    { type:'courses',      icon:'courses',    color:'#8B5CF6', label:isAr?'تصدير الدورات':'Export Courses',            desc:isAr?'جميع الدورات — عنوان، سعر، مسجلون':'All courses — title, price, enrolled' },
    { type:'wallets',      icon:'wallet',     color:'#22C55E', label:isAr?'تصدير المحافظ':'Export Wallets',            desc:isAr?'جميع المحافظ — نقاط، رصيد':'All wallets — points, cash' },
    { type:'transactions', icon:'trend',      color:'#14B8A6', label:isAr?'تصدير المعاملات':'Export Transactions',     desc:isAr?'كل المعاملات المالية':'All wallet transactions' },
    { type:'audit',        icon:'audit',      color:'#6b7280', label:isAr?'تصدير سجل النشاطات':'Export Audit Log',    desc:isAr?'كل نشاطات الأدمن':'All admin activity' },
    { type:'waitlist',     icon:'waitlist',   color:'#F59E0B', label:isAr?'تصدير قائمة الانتظار':'Export Waitlist',   desc:isAr?'جميع التسجيلات':'All waitlist signups' },
    { type:'reports',      icon:'moderation', color:'#EF4444', label:isAr?'تصدير البلاغات':'Export Reported Posts',   desc:isAr?'المنشورات المبلغ عنها':'Reported posts' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <SH title={isAr?'التقارير والتصدير':'Reports & Exports'} />
      <div style={{ background:'rgba(123,114,238,0.06)', border:'1px solid rgba(123,114,238,0.15)', borderRadius:10, padding:'12px 16px', fontSize:12, color:'#7B72EE' }}>
        {isAr?'📥 جميع الملفات بصيغة CSV مع BOM لدعم Excel والنص العربي':'📥 All files exported as UTF-8 CSV with BOM for Excel and Arabic text support'}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {reports.map(r => (
          <div key={r.type} style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:8, background:r.color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name={r.icon} size={16} color={r.color}/>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{r.label}</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>{r.desc}</div>
              </div>
            </div>
            <AdminExportBtn type={r.type} small label="" />
          </div>
        ))}
      </div>
    </div>
  );
}