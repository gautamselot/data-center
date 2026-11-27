// NAVIGATION. MODS = the 5 modules (live=1 are built). GRP(u) = top-bar groups with sub-screens; tabsOf(u) = every screen u may open; vw(t) renders one.
const IC=p=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const BELL=IC('<path d="M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4zM10 20a2 2 0 0 0 4 0"/>');
const MODS=[['press','Press Production',1,'#2f6fb5',IC('<path d="M4 21h16M7 21V9h10v12M12 3v6M9 6l3 3 3-3"/>')],
 ['disp','Daily Dispatches',0,'#55697c',IC('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>')],
 ['house','Housing Correction',1,'#c0601d',IC('<path d="M3 21V9l6 4V9l6 4V4h4v17z"/>')],
 ['mach','Machine Shop',0,'#55697c',IC('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>')],
 ['found','Foundry Production',0,'#55697c',IC('<path d="M5 8h14l-2 11H7zM9 8V5M15 8V5M8 13h8"/>')]];
const RL=u=>u.sa?'Admin':u.role=='admin'?'Management':u.role=='operator'?(u.sup?'Supervisor':'Operator'):'HOD';
const GRP=u=>{const has=m=>(u.mods||[]).includes(m),adm=u.role=='admin',mg=adm||(u.role=='hod'&&!!u.dept),W=(S.op&&S.op.wps)||[];
 const press=[['dash','Dashboard'],['repc','Press report']];if(u.role!='operator')press.push(['entry','Entry']);press.push(['repp','Press wise report']);if(adm)press.push(['tgt','Targets']);
 const hs=[];if(mg||u.sup)hs.push(['oauth',u.role=='operator'?'Authorize':'Overview']);W.forEach(w=>hs.push(['hw'+w.id,w.name]));if(!W.length)hs.push(['hw0','Workplaces']);
 const g=MODS.map(([k,l,live])=>{const on=!!live&&has(k);return{k,l,live,on,vis:u.role!='operator'||on,subs:k=='press'?press:k=='house'?hs:[]}});
 const x=(k,l,subs,show)=>{if(show)g.push({k,l,live:1,on:true,vis:true,subs})};
 x('users','User Management',u.sa?[['team','Accounts'],['ops','Operators'],['roster','Operator details']]:[['ops','Operators'],['roster','Operator details']],u.sa||(mg&&has('house')));
 x('aud','Audit log',[['aud','Audit log']],adm);x('bulk','Add operators',[['bulk','Add operators']],!!u.sa);x('db','Database',[['db','Database']],!!u.sa);x('maint','Backup and purge',[['maint','Backup and purge']],!!u.sa);
 return g};
const tabsOf=u=>{const l=GRP(u).filter(g=>g.on).flatMap(g=>g.subs);return u.role!='operator'?[['home','Home'],...l]:l.length?l:[['home','Home']]};
const go=t=>{if(S.u&&(t=='acct'||tabsOf(S.u).some(x=>x[0]==t))){S.tab=t;draw();$('#app').scrollTop=0}};
const vw=t=>{if(t=='repp')return V.rep();if(t=='repc')return V.crep();return /^hw\d+$/.test(t)?V.hw(+t.slice(2)):V[t]()};
// Header pop-ups: bell (notifications, empty for now) and account menu.
function menu(k){const p=$('#pop');if(!p.hidden&&p.dataset.k==k){p.hidden=true;return}p.dataset.k=k;
 p.innerHTML=k=='n'?'<b>Notifications</b><p class="sub" style="margin:8px 0 0">Nothing yet. Alerts will appear here.</p>':`<div class="pu"><b>${S.u.name}</b><small>${RL(S.u)}</small></div><button onclick="menuGo('acct')">My account</button><button class="out" onclick="logout()">Sign out</button>`;p.hidden=false}
function menuGo(t){$('#pop').hidden=true;go(t)}
document.addEventListener('click',e=>{const p=$('#pop');if(p&&!p.hidden&&!e.target.closest('#pop,.bell,.me'))p.hidden=true});