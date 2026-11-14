'use strict';
// Small shared helpers: time, audit log, passwords, ids, errors.
const crypto=require('crypto');const {q1,ex}=require('./db');
const now=()=>new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),today=()=>new Date(Date.now()+5.5*36e5).toISOString().slice(0,10);
const audit=(u,a)=>ex('INSERT INTO audit_log(at,user_id,action) VALUES(?,?,?)',now(),u,a);
const hash=p=>{const s=crypto.randomBytes(16).toString('hex');return s+':'+crypto.scryptSync(p,s,32).toString('hex')};
const check=(p,h)=>{const[s,x]=h.split(':'),y=crypto.scryptSync(p,s,32);return crypto.timingSafeEqual(Buffer.from(x,'hex'),y)};
const rpw=()=>{const a='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(crypto.randomBytes(8),b=>a[b%a.length]).join('')};
const uid=n=>{const w=n.toLowerCase().replace(/[^a-z\s]/g,'').split(/\s+/).filter(Boolean),b=w.length>1?w[0]+'.'+w[w.length-1]:w[0]||'user';let id=b,i=2;while(q1('SELECT 1 x FROM users WHERE id=?',id))id=b+i++;return id};
const bad=(m,c=400)=>{throw{c,m}};
module.exports={now,today,audit,hash,check,rpw,uid,bad};
