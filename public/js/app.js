// App shell: draw() renders header, nav and the current view. Login (tile ID picker + manual ID), logout, password, popups, startup.
const lgEsc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LGR={sa:'Super admin',admin:'Admin',hod:'HOD',operator:'Operator'};
function lgTiles(f){const P=(S.people||[]).filter(p=>!f||p.ini.toLowerCase().includes(f.toLowerCase())),sel=(S.sel||'').toLowerCase();
 const grp=(l,fn)=>{const L=P.filter(fn);return L.length?`<h4>${l}</h4><div class="lg-tiles">${L.map(p=>`<button type="button" class="lg-tile ${p.ini.toLowerCase()==sel?'on':''}" data-i="${lgEsc(p.ini)}" onclick="lgPick(this.dataset.i)"><i>${lgEsc(p.ini)}</i><small>${LGR[p.sa?'sa':p.role]}</small></button>`).join('')}</div>`:''};
 return grp('Super admin',p=>p.sa)+grp('Admins',p=>p.role=='admin'&&!p.sa)+grp('HODs',p=>p.role=='hod')+grp('Operators',p=>p.role=='operator')||'<p class="sub" style="margin:4px 2px">No match. You can still sign in with the ID you typed.</p>'}
function lgShow(f){const p=$('#lgp');if(!p)return;p.innerHTML=lgTiles(f||'');p.hidden=false}
function lgToggle(){const p=$('#lgp');if(p.hidden){$('#lu').blur();lgShow()}else p.hidden=true}
function lgType(v){S.sel=v;lgShow(v.trim())}
function lgPick(i){S.sel=i;$('#lu').value=i;$('#lgp').hidden=true;$('#lp').focus()}
document.addEventListener('click',e=>{const p=$('#lgp');if(p&&!p.hidden&&!e.target.closest('.lg-field,#lgp'))p.hidden=true});
function draw(){
    document.body.classList.toggle('lg-on',!S.u);
    $('#br').innerHTML=`<img class="wm" src="${WORD}" alt="Data Center">`;
    if(!S.u){$('#who').innerHTML='';$('#nav').innerHTML='';
    if(!S.people){S.people=[];api('/api/people').then(j=>{S.people=j.people;draw()}).catch(()=>draw())}
    if(S.sel==null)S.sel=localStorage.getItem('dc_last')||'';
    $('#app').innerHTML=`<div class="lg">
    <section class="lg-brand"><div class="lg-logo"><img src="${ICON}" alt=""></div><h1>Data Center</h1><p>Press production, shift by shift.</p>
     <ul><li>Daily press entry in two 12 hour shifts</li><li>Live reports against target</li><li>Operator output with supervisor authorization</li></ul><small>Bhalwani · SUPA</small></section>
    <section class="lg-form"><form onsubmit="login();return false"><h2>Welcome back</h2><p class="lg-sub">Tap the ID field to pick your tile, or type your ID.</p>
     <label for="lu">Your ID or initials</label><div class="lg-field"><input id="lu" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Choose or type your ID" value="${lgEsc(S.sel)}" onfocus="lgShow()" onclick="if($('#lgp').hidden)lgShow()" oninput="lgType(this.value)" onkeydown="if(event.key=='Enter'){event.preventDefault();$('#lp').focus()}"><button type="button" class="lg-eye" onclick="lgToggle()">Choose</button></div>
     <div class="lg-pick" id="lgp" hidden></div>
     <label for="lp">Password</label><div class="lg-field"><input id="lp" type="password" autocomplete="current-password" placeholder="Enter your password"><button type="button" class="lg-eye" onclick="lgEye(this)">Show</button></div>
     <div class="lg-err" role="alert">${S.err}</div><button class="lg-btn" type="submit">Sign in</button>
     <p class="lg-help">Forgot your password? Ask the super admin to reset it.</p></form></section></div>`;return}
    if(S.tab!='acct'&&!tabsOf(S.u).some(x=>x[0]==S.tab))S.tab=tabsOf(S.u)[0][0];
    $('#who').innerHTML=`<button class="me ${S.tab=='acct'?'on':''}" onclick="go('acct')" aria-label="My account"><i>${S.u.ini}</i><span><b>${S.u.name.split(' ')[0]}</b><small>${RL(S.u)}</small></span></button>`;
    $('#nav').innerHTML=tabsOf(S.u).length<2?'':tabsOf(S.u).map(([k,l])=>`<button class="${S.tab==k?'on':''}" onclick="go('${k}')">${l}</button>`).join('');
    const on=$('#nav .on');if(on)on.scrollIntoView({inline:'center',block:'nearest'});
    $('#app').innerHTML=V[S.tab]();if(S.tab=='entry'){['A','B'].forEach(s=>{const c=$('#off'+s);if(c&&c.checked)offchg(s)});calc()}if(S.tab=='db')loadDb();if(S.tab=='maint')loadBk();
   }
   function lgEye(b){const i=$('#lp'),s=i.type=='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'}
   function show(h){$('#mbody').innerHTML=h;$('#modal').style.display='flex'}
   function creds(u,p){show(`<b>Login details</b><p class="sub" style="margin-top:6px">Share these now. The password is not shown again. The person must set a new password at first sign-in.</p><div class="card" style="text-align:left">ID: <b>${u.id}</b>${u.ini?' (or '+u.ini+')':''}<br>Password: <b>${p}</b></div>`)}
   function pwForm(){show(`<b>Change password</b>${S.pend?'<p class="sub" style="margin-top:6px">Set a new password to continue.</p>':''}<label style="text-align:left">New password (8 or more characters)</label><input id="np" type="password" autocomplete="new-password"><button class="btn w" onclick="chPw()">Save password</button>`)}
   async function init(){try{const m=await api('/api/me');if(m.user.mc)throw 0;S.u=m.user;await load()}catch(e){S.u=null}draw()}
   function login(){const id=$('#lu').value.trim();if(!id){S.err='Choose or type your ID.';draw();return}
    run(async()=>{try{const j=await api('/api/login',{id,pw:$('#lp').value});try{localStorage.setItem('dc_last',id)}catch(_){}S.err='';if(j.user.mc){S.pend=j.user;draw();pwForm();return}S.u=j.user;await load();S.tab=tabsOf(S.u)[0][0];S.ep=S.u.role=='admin'?'P10':S.u.pr[0]||'P10';S.rp=S.ep;draw()}catch(e){S.err=e.message;draw()}})}
   function logout(){run(async()=>{await api('/api/logout',{});S.u=null;draw()})}
   function chPw(){const v=$('#np').value;if(v.length<8)return toast('Use at least 8 characters');run(async()=>{await api('/api/password',{pw:v});$('#modal').style.display='none';if(S.pend){S.u=S.pend;S.u.mc=0;S.pend=null;await load();S.tab=tabsOf(S.u)[0][0];S.ep=S.u.role=='admin'?'P10':S.u.pr[0]||'P10';S.rp=S.ep;draw()}toast('Password changed')})}
   init();
   if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});