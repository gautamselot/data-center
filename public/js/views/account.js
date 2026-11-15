// My account: profile, change password (8+ characters, same rule as the server), sign out.
V.acct=()=>{const u=S.u,row=(l,v)=>v?`<div class="ac-r"><span>${l}</span><b>${v}</b></div>`:'';
 const pf=(id,l,extra='')=>`<label for="${id}">${l}</label><div class="lg-field"><input id="${id}" type="password" autocomplete="new-password" ${extra}><button type="button" class="lg-eye" onclick="acEye(this)">Show</button></div>`;
 return `<div class="ac"><h1>My account</h1><p class="sub">Your details and password.</p>
 <div class="card"><div class="ac-p"><div class="av">${u.ini}</div><div class="ac-n"><b>${u.name}</b><span class="b g">${RL(u)}</span></div></div>
 <div class="ac-d">${row('Sign-in ID',u.id)}${row('Initials',u.ini)}${row('Department',u.dept)}</div></div>
 <div class="card"><b>Change password</b>
 ${pf('pw1','New password (8 or more characters)')}${pf('pw2','Repeat new password',`onkeydown="if(event.key=='Enter')savePw()"`)}
 <button class="lg-btn" onclick="savePw()">Save password</button></div>
 <button class="ac-out" onclick="logout()">Sign out</button></div>`};
function acEye(b){const i=b.previousElementSibling,s=i.type=='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'}
function savePw(){const a=$('#pw1').value,b=$('#pw2').value;if(a.length<8)return toast('Use at least 8 characters');if(a!=b)return toast('The two passwords do not match');run(async()=>{await api('/api/password',{pw:a});$('#pw1').value='';$('#pw2').value='';toast('Password changed')})}