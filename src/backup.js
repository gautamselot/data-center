'use strict';
// Consistent database snapshots (SQLite VACUUM INTO) and the automatic daily backup.
// Files live in data/backups: datacenter-<auto|manual|prepurge>-YYYYMMDD-HHMMSS.db  (each one is a complete, openable database).
const fs=require('fs'),path=require('path');
const {db}=require('./db');const {BACKUP_DIR,BACKUP_KEEP}=require('./config');
fs.mkdirSync(BACKUP_DIR,{recursive:true});
const NAME=/^datacenter-(auto|manual|prepurge)-\d{8}-\d{6}(-\d+)?\.db$/;
const stamp=()=>{const d=new Date(Date.now()+5.5*36e5).toISOString();return d.slice(0,10).replace(/-/g,'')+'-'+d.slice(11,19).replace(/:/g,'')};
function snapshot(kind='manual'){let name=`datacenter-${kind}-${stamp()}.db`,i=1;
 while(fs.existsSync(path.join(BACKUP_DIR,name)))name=`datacenter-${kind}-${stamp()}-${++i}.db`;
 db.prepare('VACUUM INTO ?').run(path.join(BACKUP_DIR,name));return name}
function list(){return fs.readdirSync(BACKUP_DIR).filter(n=>NAME.test(n)).map(n=>{const s=fs.statSync(path.join(BACKUP_DIR,n));return{name:n,size:s.size,at:s.mtime.toISOString()}}).sort((a,b)=>b.name.localeCompare(a.name))}
const fileOf=name=>{if(!NAME.test(String(name||'')))return null;const f=path.join(BACKUP_DIR,name);return fs.existsSync(f)?f:null};
function remove(name){const f=fileOf(name);if(!f)return false;fs.unlinkSync(f);return true}
function prune(){list().filter(x=>x.name.includes('-auto-')).slice(BACKUP_KEEP).forEach(x=>remove(x.name))}
// Makes one automatic backup per day (checked at start and every 6 hours) and keeps the newest BACKUP_KEEP of them.
function schedule(){const run=()=>{try{if(!list().some(x=>x.name.includes('-auto-'+stamp().slice(0,8))))snapshot('auto');prune()}catch(e){console.error('Automatic backup failed:',e.message||e.m)}};
 run();const t=setInterval(run,6*36e5);if(t.unref)t.unref()}
module.exports={snapshot,list,fileOf,remove,schedule};
