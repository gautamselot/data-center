// My account: details, change password, sign out.
V.acct=()=>{const u=S.u;return `<h1>My account</h1><p class="sub">Your details and password.</p>
    <div class="card acct"><div class="av">${u.ini}</div><div><b>${u.name}</b><br><small>${RL(u)}${u.dept?' · '+u.dept:''} · sign in with <b>${u.ini}</b></small></div></div>
    <div class="card" style="margin-top:12px"><b>Change password</b>
    <label for="pw1">New password (5 or more characters)</label><input id="pw1" type="password" autocomplete="new-password">
    <label for="pw2">Repeat new password</label><input id="pw2" type="password" autocomplete="new-password" onkeydown="if(event.key=='Enter')savePw()">
    <button class="btn w" onclick="savePw()">Save password</button></div>
    <div class="card" style="margin-top:12px"><button class="btn s" onclick="logout()">Sign out</button></div>`};
   function savePw(){const a=$('#pw1').value,b=$('#pw2').value;if(a.length<5)return toast('Use at least 5 characters');if(a!=b)return toast('The two passwords do not match');run(async()=>{await api('/api/password',{pw:a});$('#pw1').value='';$('#pw2').value='';toast('Password changed')})}