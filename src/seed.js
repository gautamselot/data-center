'use strict';
// First-run data: presses, the 8 starting users (password 12345) and the Housing department.
const {q1,ex}=require('./db');const {PRESSES}=require('./config');const {now,audit,hash,uid}=require('./util');
const {DEFAULT_PW}=require('./config');
function seed(){
PRESSES.forEach(p=>ex('INSERT OR IGNORE INTO presses VALUES(?,?,?,?)',...p));
if(!q1('SELECT 1 x FROM users')){
 [['Ravindra Katariya','RK','admin'],['Siddharth Katariya','SSK','admin'],['Shrenik Katariya','SK','admin'],['Shreyans Katariya','SRK','admin'],['Gautam Selot','GS','admin'],['Ukhaji Khaire','UK','hod'],['Ajay Soni','AS','hod'],['Chandrashekhar Thorat','CT','hod']].forEach(([n,i,r])=>{
  const id=uid(n);ex('INSERT INTO users(id,name,ini,role,pw_hash,active,created_at) VALUES(?,?,?,?,?,1,?)',id,n,i,r,hash(DEFAULT_PW),now());if(r=='hod')PRESSES.forEach(p=>ex('INSERT INTO hod_press VALUES(?,?)',id,p[0]))});
 audit('system','Database created with 5 presses and 8 users')}
ex("UPDATE users SET super=1 WHERE id='gautam.selot'");
if(!q1('SELECT 1 x FROM departments')){ex("INSERT INTO departments VALUES('Housing')");
 [['Flatness',1050,[]],['Hand Press',540,[]],['Cutting',null,['M/c - 1','M/c - 2','M/c - 3']],['Press Brake',null,[]],['Hydl Press',null,[]]].forEach(([n,t,ms])=>{const id=ex('INSERT INTO workplaces(dept,name,target) VALUES(?,?,?)','Housing',n,t).lastInsertRowid;ms.forEach(m=>ex('INSERT INTO machines(workplace_id,name) VALUES(?,?)',id,m))});
 ex("UPDATE users SET dept='Housing' WHERE id='chandrashekhar.thorat'")}

 // One-time Housing operators (Housing_Correction.xlsx). Skips names that already exist. Password: the default (Data@987).
if(q1("SELECT 1 x FROM departments WHERE name='Housing'")){const {inits}=require('./routes/bulk'),hod=q1("SELECT id FROM users WHERE id='chandrashekhar.thorat'");
 [['Flatness',0,['Sohan Kumar','Anup Kumar','Gaya Kumar','Gopal','Raja']],['Hand Press',1,['Sanjay','Brijalal']],['Hand Press',0,['Bablu Yadav','Amarjeet','Ranjeet Yadav','Mukesh']]].forEach(([wn,sup,names])=>{
  const w=q1("SELECT id FROM workplaces WHERE dept='Housing' AND name=?",wn);
  names.forEach(n=>{if(q1('SELECT 1 x FROM users WHERE lower(name)=?',n.toLowerCase()))return;const id=uid(n);
   ex("INSERT INTO users(id,name,ini,role,pw_hash,active,created_at,dept,sup,boss) VALUES(?,?,?,'operator',?,1,?,'Housing',?,?)",id,n,inits(n),hash(DEFAULT_PW),now(),sup,hod?hod.id:null);
   if(w)ex('INSERT OR IGNORE INTO op_workplace VALUES(?,?)',id,w.id);audit('system','Created operator '+id)})})}
}
module.exports=seed;
