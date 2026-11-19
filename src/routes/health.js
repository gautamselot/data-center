'use strict';
// Health checks for uptime monitors.
//   GET /api/health       (public)  -> {ok,status,issues}. ok=1 only when EVERY check passes; a warning also gives ok=0 so the monitor alerts you.
//   GET /api/health/full  (Admin)   -> every check with details, plus raw metrics.
// Limits are in T as [warn, fail]. Edit them here.
const fs=require('fs'),os=require('os'),path=require('path');
const {monitorEventLoopDelay}=require('perf_hooks');
const {db,q1}=require('../db');const {DIR}=require('../config');const {list}=require('../backup');const {route}=require('../router');
const GB=1073741824,MB=1048576;
const T={diskPct:[10,3],diskGB:[5,1],ramPct:[10,3],rssMB:[500,1500],lagMs:[250,2000],dbMs:[300,2000],walMB:[100,500],backupH:[36,72],dbGB:[1,5],bkGB:[10,30],starts24:[8,20]};
const lo=(v,t)=>v<t[1]?'fail':v<t[0]?'warn':'ok',hi=(v,t)=>v>=t[1]?'fail':v>=t[0]?'warn':'ok',worst=a=>a.includes('fail')?'fail':a.includes('warn')?'warn':'ok';
const lag=monitorEventLoopDelay({resolution:20});lag.enable();
// Remember every server start (data/starts.log) so a crash loop that run-forever hides is still visible.
const SL=path.join(DIR,'starts.log');let starts=[Date.now()];
try{const old=fs.existsSync(SL)?fs.readFileSync(SL,'utf8').split('\n').filter(Boolean).map(Number).filter(x=>x>Date.now()-7*864e5):[];starts=[...old,Date.now()];fs.writeFileSync(SL,starts.join('\n')+'\n')}catch(e){}
const IC={t:0,v:'ok'};
function run(){const C=[],M={},add=(name,status,detail)=>C.push({name,status,detail}),sz=f=>{try{return fs.statSync(f).size}catch(_){return 0}},
 tryc=(name,fn)=>{try{fn()}catch(e){add(name,'fail',String(e.message||e))}};
 tryc('Database',()=>{const t0=Date.now();q1('SELECT 1 x');db.exec('BEGIN IMMEDIATE');db.exec('ROLLBACK');const ms=Date.now()-t0;M.dbMs=ms;add('Database',hi(ms,T.dbMs),`reads and takes the write lock in ${ms} ms`)});
 tryc('Data integrity',()=>{if(Date.now()-IC.t>36e5){IC.v=String(Object.values(q1('PRAGMA quick_check')||{})[0]||'?');IC.t=Date.now()}add('Data integrity',IC.v=='ok'?'ok':'fail',IC.v=='ok'?'quick check passed (checked hourly)':IC.v)});
 const dbf=path.join(DIR,'datacenter.db'),dbs=sz(dbf),wal=sz(dbf+'-wal');M.dbMB=+(dbs/MB).toFixed(1);M.walMB=+(wal/MB).toFixed(1);
 add('Database size',hi(dbs/GB,T.dbGB),(dbs/MB).toFixed(1)+' MB');
 add('WAL file',hi(wal/MB,T.walMB),(wal/MB).toFixed(1)+' MB (large means checkpoints are not happening)');
 tryc('Disk space',()=>{const s=fs.statfsSync(DIR),free=s.bavail*s.bsize,tot=s.blocks*s.bsize,pct=free/tot*100;M.diskFreeGB=+(free/GB).toFixed(1);M.diskTotalGB=+(tot/GB).toFixed(1);
  add('Disk space',worst([lo(pct,T.diskPct),lo(free/GB,T.diskGB)]),`${pct.toFixed(0)}% free (${(free/GB).toFixed(1)} of ${(tot/GB).toFixed(0)} GB)`)});
 tryc('Backups',()=>{const L=list(),au=L.filter(x=>x.name.includes('-auto-')),last=au[0],age=last?(Date.now()-new Date(last.at))/36e5:null,tot=L.reduce((a,x)=>a+x.size,0);M.backups=L.length;M.lastAutoBackup=last?last.name:null;
  add('Automatic backup',age==null?'warn':hi(age,T.backupH),last?`latest is ${age.toFixed(1)} h old`:'no automatic backup yet');
  add('Backup folder',hi(tot/GB,T.bkGB),`${L.length} files, ${(tot/GB).toFixed(2)} GB`)});
 const rss=process.memoryUsage().rss/MB,fr=os.freemem(),tm=os.totalmem(),rp=fr/tm*100;M.appMB=Math.round(rss);M.ramFreePct=Math.round(rp);
 add('App memory',hi(rss,T.rssMB),rss.toFixed(0)+' MB');
 add('Server memory',lo(rp,T.ramPct),`${rp.toFixed(0)}% free (${(fr/GB).toFixed(1)} of ${(tm/GB).toFixed(1)} GB)`);
 const lg=lag.count?Math.max(0,lag.percentile(99)/1e6-20):0;lag.reset();M.lagMs=Math.round(lg);add('Responsiveness',hi(lg,T.lagMs),`event loop delay ${lg.toFixed(0)} ms (since last check)`);
 const s24=starts.filter(x=>x>Date.now()-864e5).length;M.starts24h=s24;M.uptimeMin=Math.round(process.uptime()/60);add('Restarts',hi(s24,T.starts24),`${s24} start(s) in 24 h, up ${M.uptimeMin} min`);
 try{M.users=q1('SELECT COUNT(*) c FROM users WHERE active=1').c;M.sessions=q1('SELECT COUNT(*) c FROM sessions WHERE expires>?',Date.now()).c;M.pressDays=q1('SELECT COUNT(*) c FROM entry_meta').c;M.lastPressEntry=(q1('SELECT MAX(date) d FROM entry_meta')||{}).d;M.operatorEntries=q1('SELECT COUNT(*) c FROM op_entries').c;M.lastOperatorEntry=(q1('SELECT MAX(date) d FROM op_entries')||{}).d}catch(e){}
 M.node=process.version;M.platform=os.platform();
 return{status:worst(C.map(c=>c.status)),C,M}}
route('GET','/api/health',null,()=>{let r;try{r=run()}catch(e){return{ok:0,status:'fail',issues:['Health check crashed']}}
 return{ok:r.status=='ok'?1:0,status:r.status,issues:r.C.filter(c=>c.status!='ok').map(c=>c.name+': '+c.detail),t:new Date().toISOString()}});
route('GET','/api/health/full','super',()=>{const r=run();return{status:r.status,checks:r.C,metrics:r.M}});