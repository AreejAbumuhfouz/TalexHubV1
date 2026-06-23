'use strict';
import { useState } from 'react';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import BroadcastModal from '../modals/BroadcastModal';
import useLangStore from '../../i18n';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function NotificationsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const [open, setOpen] = useState(false);

  const cards = [
    { label:isAr?'إرسال للجميع':'Send to All',        desc:isAr?'يصل لكل المستخدمين النشطين':'Reaches all active users',   color:'#7B72EE' },
    { label:isAr?'إرسال للمجانيين':'Send to Free',     desc:isAr?'مستخدمو الباقة المجانية':'Free plan users only',         color:'#6b7280' },
    { label:isAr?'إرسال للـ Pro':'Send to Pro',        desc:isAr?'مستخدمو الباقة الاحترافية':'Pro plan users only',        color:'#7B72EE' },
    { label:isAr?'إرسال للشركات':'Send to Companies',  desc:isAr?'حسابات الشركات فقط':'Company accounts only',            color:'#3B82F6' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <BroadcastModal open={open} onClose={()=>setOpen(false)} lang={lang} />
      <SH title={isAr?'الإشعارات':'Notifications'}>
        <Btn variant="primary" onClick={()=>setOpen(true)}><Icon name="send" size={13}/>{isAr?'إرسال إشعار':'Broadcast'}</Btn>
      </SH>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
        {cards.map((card,i) => (
          <div key={i} onClick={()=>setOpen(true)} style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'box-shadow 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{ width:34, height:34, borderRadius:8, background:card.color+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              <Icon name="bell" size={15} color={card.color}/>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{card.label}</div>
            <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}