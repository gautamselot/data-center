// App shell: draw() renders header, nav and the current view. Login, logout, password, popups, startup.
function draw(){
 $('#br').innerHTML=`<img class="wm" src="${WORD}" alt="Data Center">`;
 if(!S.u){$('#who').innerHTML='';$('#nav').innerHTML='';
 if(!S.people){S.people=[];api('/api/people').then(j=>{S.people=j.people;draw()}).catch(()=>draw())}
 const P=S.people||[],sel=S.sel||localStorage.getItem('dc_last')||'';
 const grp=(l,f)=>{const L=P.filter(f);return L.length?`<optgroup label="${l}">${L.map(p=>`<option value="${p.ini}" ${p.ini==sel?'selected':''}>${p.ini}</option>`).join('')}</optgroup>`:''};
 $('#app').innerHTML=`<div class="login card">${LOGO(72)}<h1 style="margin-top:10px">Data Center</h1><p class="sub">Press production, shift by shift.</p>
 <label style="text-align:left">Your initials</label><select id="lu" onchange="S.sel=this.value"><option value="">Choose initials</option>${grp('Super admin',p=>p.sa)+grp('Admins',p=>p.role=='admin'&&!p.sa)+grp('HODs',p=>p.role=='hod')+grp('Operators',p=>p.role=='operator')}</select>
 <label style="text-align:left">Password</label><input id="lp" type="password" autocomplete="current-password" onkeydown="if(event.key=='Enter')login()">
 <div class="err">${S.err}</div><button class="btn w" style="margin-top:6px" onclick="login()">Sign in</button></div>`;return}
 if(!tabsOf(S.u).some(x=>x[0]==S.tab))S.tab=tabsOf(S.u)[0][0];
 $('#who').innerHTML=`<b>${S.u.name}</b>${RL(S.u)} · ${S.u.ini} · <a href="#" onclick="pwForm();return false">Change password</a> · <a href="#" onclick="logout();return false">Sign out</a>`;
 $('#nav').innerHTML=tabsOf(S.u).length<2?'':tabsOf(S.u).map(([k,l])=>`<button class="${S.tab==k?'on':''}" onclick="go('${k}')">${l}</button>`).join('');
 $('#app').innerHTML=V[S.tab]();if(S.tab=='entry'){['A','B'].forEach(s=>{const c=$('#off'+s);if(c&&c.checked)offchg(s)});calc()}if(S.tab=='db')loadDb();if(S.tab=='maint')loadBk();
}
function show(h){$('#mbody').innerHTML=h;$('#modal').style.display='flex'}
function creds(u,p){show(`<b>Login details</b><p class="sub" style="margin-top:6px">Share these now. The password is not shown again.</p><div class="card" style="text-align:left">ID: <b>${u.id}</b>${u.ini?' (or '+u.ini+')':''}<br>Password: <b>${p}</b></div>`)}
function pwForm(){show(`<b>Change password</b><label style="text-align:left">New password (5 or more characters)</label><input id="np" type="password" autocomplete="new-password"><button class="btn w" onclick="chPw()">Save password</button>`)}
async function init(){try{const m=await api('/api/me');S.u=m.user;await load()}catch(e){S.u=null}draw()}
function login(){run(async()=>{try{const j=await api('/api/login',{id:$('#lu').value,pw:$('#lp').value});try{localStorage.setItem('dc_last',$('#lu').value)}catch(_){}S.u=j.user;S.err='';await load();S.tab=tabsOf(S.u)[0][0];S.ep=S.u.role=='admin'?'P10':S.u.pr[0]||'P10';S.rp=S.ep;draw()}catch(e){S.err=e.message;draw()}})}
function logout(){run(async()=>{await api('/api/logout',{});S.u=null;draw()})}
function chPw(){const v=$('#np').value;if(v.length<5)return toast('Use at least 5 characters');run(async()=>{await api('/api/password',{pw:v});$('#modal').style.display='none';toast('Password changed')})}
init();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
