'use strict';
// Database schema and upgrades. Runs on every start and is safe to repeat.
// To add a column or table later: add a line at the END of migrate() (check cols('table').includes('name') first).
const {db,q,q1,ex,cols}=require('./db');
function migrate(){
db.exec(`PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,ini TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('admin','hod','operator')),pw_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT,super INTEGER NOT NULL DEFAULT 0,dept TEXT,sup INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS presses(code TEXT PRIMARY KEY,location TEXT NOT NULL,size TEXT,default_target REAL NOT NULL);
CREATE TABLE IF NOT EXISTS hod_press(user_id TEXT NOT NULL,press TEXT NOT NULL,PRIMARY KEY(user_id,press));
CREATE TABLE IF NOT EXISTS targets(date TEXT NOT NULL,press TEXT NOT NULL,tons REAL NOT NULL,PRIMARY KEY(date,press));
CREATE TABLE IF NOT EXISTS entries(date TEXT NOT NULL,press TEXT NOT NULL,shift TEXT NOT NULL CHECK(shift IN('A','B')),
 inp REAL NOT NULL CHECK(inp>=0),out REAL NOT NULL CHECK(out>=0),run REAL NOT NULL CHECK(run>=0),die REAL NOT NULL CHECK(die>=0),pow REAL NOT NULL CHECK(pow>=0),man REAL NOT NULL CHECK(man>=0),log REAL NOT NULL CHECK(log>=0),brk REAL NOT NULL CHECK(brk>=0),noo REAL NOT NULL CHECK(noo>=0),oth REAL NOT NULL CHECK(oth>=0),
 hc REAL NOT NULL DEFAULT 0,dies REAL NOT NULL DEFAULT 0,ord REAL NOT NULL DEFAULT 0,PRIMARY KEY(date,press,shift),
 CHECK(abs(run+die+pow+man+log+brk+noo+oth-12)<0.005),CHECK(out<=inp));
CREATE TABLE IF NOT EXISTS entry_meta(date TEXT NOT NULL,press TEXT NOT NULL,reason_log TEXT,reason_brk TEXT,reason_oth TEXT,entered_by TEXT,status TEXT NOT NULL DEFAULT 'submitted',updated_at TEXT,PRIMARY KEY(date,press));
CREATE TABLE IF NOT EXISTS audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,at TEXT,user_id TEXT,action TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);`);
if(!cols('users').includes('super'))ex('ALTER TABLE users ADD COLUMN super INTEGER NOT NULL DEFAULT 0');
if(!cols('entry_meta').includes('reason_offa')){ex('ALTER TABLE entry_meta ADD COLUMN reason_offa TEXT');ex('ALTER TABLE entry_meta ADD COLUMN reason_offb TEXT')}
if(!q1("SELECT sql s FROM sqlite_master WHERE type='table' AND name='users'").s.includes("'operator'")){db.exec('BEGIN');try{
 db.exec(`CREATE TABLE users_new(id TEXT PRIMARY KEY,name TEXT NOT NULL,ini TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('admin','hod','operator')),pw_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT,super INTEGER NOT NULL DEFAULT 0,dept TEXT,sup INTEGER NOT NULL DEFAULT 0)`);
 db.exec(`INSERT INTO users_new(id,name,ini,role,pw_hash,active,created_at,super) SELECT id,name,ini,role,pw_hash,active,created_at,${cols('users').includes('super')?'super':'0'} FROM users ORDER BY rowid`);
 db.exec('DROP TABLE users;ALTER TABLE users_new RENAME TO users');db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}
db.exec(`CREATE TABLE IF NOT EXISTS departments(name TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS workplaces(id INTEGER PRIMARY KEY AUTOINCREMENT,dept TEXT NOT NULL,name TEXT NOT NULL,target REAL,UNIQUE(dept,name));
CREATE TABLE IF NOT EXISTS machines(id INTEGER PRIMARY KEY AUTOINCREMENT,workplace_id INTEGER NOT NULL,name TEXT NOT NULL,UNIQUE(workplace_id,name));
CREATE TABLE IF NOT EXISTS op_workplace(user_id TEXT NOT NULL,workplace_id INTEGER NOT NULL,PRIMARY KEY(user_id,workplace_id));
CREATE TABLE IF NOT EXISTS op_entries(id INTEGER PRIMARY KEY AUTOINCREMENT,date TEXT NOT NULL,shift TEXT NOT NULL CHECK(shift IN('A','B')),workplace_id INTEGER NOT NULL,machine_id INTEGER NOT NULL DEFAULT 0,operator TEXT NOT NULL,actual REAL NOT NULL CHECK(actual>=0),target REAL,status TEXT NOT NULL DEFAULT 'pending',entered_at TEXT,authorized_by TEXT,authorized_at TEXT,UNIQUE(date,shift,workplace_id,machine_id,operator));`);
if(!cols('entry_meta').includes('off_a')){ex('ALTER TABLE entry_meta ADD COLUMN off_a INTEGER NOT NULL DEFAULT 0');ex('ALTER TABLE entry_meta ADD COLUMN off_b INTEGER NOT NULL DEFAULT 0')}
if(!cols('users').includes('remark'))ex('ALTER TABLE users ADD COLUMN remark TEXT');
if(!cols('users').includes('boss')){ex('ALTER TABLE users ADD COLUMN boss TEXT');
    q("SELECT id,dept FROM users WHERE role='operator' AND dept IS NOT NULL").forEach(o=>{const h=q("SELECT id FROM users WHERE role='hod' AND dept=?",o.dept);if(h.length==1)ex('UPDATE users SET boss=? WHERE id=?',h[0].id,o.id)})}
    if(!cols('users').includes('must_change'))ex('ALTER TABLE users ADD COLUMN must_change INTEGER NOT NULL DEFAULT 0');

}
module.exports=migrate;
