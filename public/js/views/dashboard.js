// Dashboard + super-admin demo tools.
V.dash=()=>{const d=S.dt,days=mdays(d.slice(0,7)).filter(x=>x<=d),mo=mdays(d.slice(0,7));let to=0,tt=0,n=0,m=0,mt=0;
 const cards=PR.map(([p])=>{const e=E(d,p),t=tg(d,p),o=outT(d,p);tt+=t;if(e){n++;to+=o}
  const pm=R2(days.reduce((a,x)=>a+(outT(x,p)||0),0)),pt=R2(days.reduce((a,x)=>a+tg(x,p),0)),mT=R2(mo.reduce((a,x)=>a+tg(x,p),0));
  return `<div class="card"><small>${pl(p)}</small><div class="big ${e?col(o,t):''}">${e?o+' t':t>0?'No entry':'Off day'}</div><small>Target ${t} t</small>
  <div style="margin-top:10px"><small>Achieved till date</small><div class="big ${col(pm,pt)}" style="font-size:22px">${pm} t</div><small>Target till date ${pt} t</small></div><div style="margin-top:6px"><small>Month target <b>${mT} t</b></small></div></div>`}).join('');
 days.forEach(x=>PID.forEach(p=>{mt+=tg(x,p);m+=outT(x,p)||0}));to=R2(to);m=R2(m);
 const ok=Object.values(S.ents).every(e=>eq(hsum(e.a),12)&&eq(hsum(e.b),12));
 return `<h1>Dashboard</h1><p class="sub">Output per press against target. Green means the target is met, red means it is not.</p><div class="row" style="max-width:220px"><div><label style="margin-top:0">Date</label><input type="date" value="${d}" max="${YD}" onchange="S.dt=this.value||YD;draw()"></div></div>
 <div class="grid"><div class="card"><small>Total output</small><div class="big ${n?col(to,tt):''}">${to} t</div><small>Target ${R2(tt)} t</small></div><div class="card"><small>Month to date</small><div class="big ${col(m,mt)}">${m} t</div><small>Target to date ${R2(mt)} t</small></div><div class="card"><small>Entries made</small><div class="big ${n==PR.length?'g':'r'}">${n} of ${PR.length}</div><small>presses</small></div><div class="card"><small>24 hour tally</small><div class="big ${ok?'g':'r'}">${ok?'All match':'Mismatch'}</div><small>every saved entry</small></div></div>
 <h2>Presses</h2><div class="grid">${cards}</div>
 ${S.u.sa?`<h2>Demo tools</h2><div class="card"><button class="btn s" onclick="sample()">Load sample data for ${mlab(S.mo)}</button> <button class="btn s" onclick="clearAll()">Clear all entries</button></div>`:''}`};
function sample(){run(async()=>{await api('/api/sample',{mo:S.mo});await load();toast('Sample data loaded');draw()})}
function clearAll(){if(prompt('Type CLEAR to delete all press entries')!=='CLEAR')return;run(async()=>{await api('/api/clear',{confirm:'CLEAR'});await load();toast('All entries cleared');draw()})}
