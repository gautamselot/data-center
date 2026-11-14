// Operator details (Sheet 1 of the Housing Excel): Product category, Name, Designation, Work place, Target, Remark.
// HODs see their own department, admins can pick a department. The remark is editable.
V.roster=()=>{const O=S.op,adm=S.u.role=='admin';if(S.rd==null)S.rd=adm?'':S.u.dept;
 const esc=t=>String(t).replace(/"/g,'&quot;'),inD=u=>!S.rd||u.dept==S.rd,wps=u=>(O.asg[u.id]||[]).map(wpOf).filter(Boolean);
 const place=u=>u.role=='hod'?'HOD':wps(u).map(w=>w.name).join(', ')||'Not assigned';
 const target=u=>u.role=='hod'?'-':wps(u).filter(w=>w.target!=null).map(w=>w.target+' Pcs Daily').join(', ')||'-';
 const remark=u=>u.remark||(u.role=='hod'?'All':u.sup?'Entry + Authorization':'');
 const rank=u=>u.role=='hod'?0:u.sup?1:2;
 const list=U.filter(u=>(u.role=='hod'||u.role=='operator')&&u.dept&&(adm||u.dept==S.u.dept)&&inD(u)).sort((a,b)=>a.dept.localeCompare(b.dept)||rank(a)-rank(b)||place(a).localeCompare(place(b)));
 const chips=O.wps.filter(w=>(!S.rd||w.dept==S.rd)&&w.target!=null).map(w=>`<span class="b">${w.name}: ${w.target} Pcs</span>`).join('');
 const pick=adm?`<div class="card"><label style="margin-top:0">Department</label><select onchange="S.rd=this.value;draw()"><option value="">All departments</option>${O.depts.map(x=>`<option ${x==S.rd?'selected':''}>${x}</option>`).join('')}</select></div>`:'';
 return `<h1>Operator details</h1><p class="sub">Who works where, with the daily target. Edit the remark and it saves when you leave the box.</p>${pick}
 <div class="card"${adm?' style="margin-top:12px"':''}><b>Daily targets</b><div class="pv">${chips||'<small>No targets set. Set them in Operators.</small>'}</div></div>
 <div class="tw ot" style="margin-top:12px"><table class="ot rs"><tr class="hd"><th>Product category</th><th>Name</th><th>Designation</th><th>Work place</th><th>Target</th><th>Remark</th></tr>${list.map(u=>`<tr><td data-l="Product category">${u.dept}</td><td data-l="Name">${u.name}<br><small>${u.ini}</small></td><td data-l="Designation">${u.role=='hod'?'HOD':u.sup?'Supervisor':'Operator'}</td><td data-l="Work place">${place(u)}</td><td data-l="Target">${target(u)}</td><td data-l="Remark"><input value="${esc(remark(u))}" placeholder="Remark" onchange="setRemark('${u.id}',this.value)"></td></tr>`).join('')||'<tr><td colspan="6">No people in this department yet. The super admin creates them in Team and access.</td></tr>'}</table></div>`};
function setRemark(id,v){run(async()=>{await api('/api/users/remark',{id,remark:v});await load();draw()})}
