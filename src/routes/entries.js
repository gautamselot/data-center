'use strict';
// Daily press entries: save (both shifts) and lock/unlock.
const {q1,ex}=require('../db');
const {F,HF}=require('../config');
const {today,audit,bad}=require('../util');
const {saveEntry}=require('../entries');
const {route}=require('../router');
route('POST','/api/entry','any',(u,b)=>{let{date,press,a,b:bb,rs={}}=b;if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||date>today())bad('Invalid or future date');
 if(!q1('SELECT 1 x FROM presses WHERE code=?',press))bad('Unknown press');if(u.role!='admin'&&!q1('SELECT 1 x FROM hod_press WHERE user_id=? AND press=?',u.id,press))bad('You are not assigned to this press',403);
 const m=q1('SELECT status FROM entry_meta WHERE date=? AND press=?',date,press);if(m&&m.status=='locked'&&u.role!='admin')bad('This entry is locked. Ask an admin.',403);
 const nm=s=>{if(s&&s.off){const o={off:1};F.forEach(k=>o[k]=0);o.oth=12;return o}return s};const oa=!!(a&&a.off),ob=!!(bb&&bb.off);a=nm(a);bb=nm(bb);
 for(const s of[a,bb]){if(!s)bad('Both shifts are required');const h=HF.reduce((x,k)=>x+(+s[k]||0),0);if(Math.abs(h-12)>=0.005)bad('Each shift must add up to exactly 12 hours');if((+s.out||0)>(+s.inp||0))bad('Output cannot be more than input')}
 const T=k=>(oa?0:(+a[k]||0))+(ob?0:(+bb[k]||0));if((T('log')>0&&!rs.log)||(T('brk')>0&&!rs.brk)||(T('oth')>0&&!rs.oth))bad('Give reasons and actions for log shortage, breakdown and other hours');
 if(oa&&!String(rs.offa||'').trim())bad('Give a reason for Shift A being off');if(ob&&!String(rs.offb||'').trim())bad('Give a reason for Shift B being off');
 saveEntry(date,press,a,bb,rs,u.id,oa,ob);audit(u.id,`Saved entry ${date} ${press}`);return{ok:1}});
route('POST','/api/entry/lock','admin',(u,b)=>{const m=q1('SELECT status FROM entry_meta WHERE date=? AND press=?',b.date,b.press);if(!m)bad('No such entry',404);const s=m.status=='locked'?'submitted':'locked';ex('UPDATE entry_meta SET status=? WHERE date=? AND press=?',s,b.date,b.press);audit(u.id,`${s=='locked'?'Locked':'Unlocked'} ${b.date} ${b.press}`);return{ok:1}});
