'use strict';
// Saves one press/day entry (both shifts + reasons) in a single transaction.
const {db,ex}=require('./db');const {F}=require('./config');const {now}=require('./util');
function saveEntry(date,press,a,b,rs,by,oa,ob){db.exec('BEGIN');try{
 for(const[s,v]of[['A',a],['B',b]])ex(`INSERT INTO entries(date,press,shift,${F.join(',')}) VALUES(?,?,?,${F.map(()=>'?').join(',')}) ON CONFLICT(date,press,shift) DO UPDATE SET ${F.map(k=>k+'=excluded.'+k).join(',')}`,date,press,s,...F.map(k=>+v[k]||0));
 ex(`INSERT INTO entry_meta(date,press,reason_log,reason_brk,reason_oth,entered_by,updated_at,off_a,off_b,reason_offa,reason_offb) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(date,press) DO UPDATE SET reason_log=excluded.reason_log,reason_brk=excluded.reason_brk,reason_oth=excluded.reason_oth,entered_by=excluded.entered_by,updated_at=excluded.updated_at,off_a=excluded.off_a,off_b=excluded.off_b,reason_offa=excluded.reason_offa,reason_offb=excluded.reason_offb`,date,press,rs.log||'',rs.brk||'',rs.oth||'',by,now(),oa?1:0,ob?1:0,oa?(rs.offa||''):'',ob?(rs.offb||''):'');
 db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}
module.exports={saveEntry};
