// Add many operators at once (Admin only). Server side: src/routes/bulk.js
V.bulk=()=>{const bs=U.filter(x=>x.on&&x.dept&&(x.role=='hod'||(x.role=='operator'&&x.sup)));S.bu=S.bu||{boss:'',wp:'',names:''};
 const k=S.bu,bo=bs.find(x=>x.id==k.boss),wps=S.op.wps.filter(w=>bo&&w.dept==bo.dept);
 return `<h1>Add operators</h1><p class="sub">Create many operator accounts in one go. One name per line. Each gets a login, the default password and the workplace you choose.</p>
 <div class="card"><label style="margin-top:0">Reports to</label><select onchange="bulkSet('boss',this.value)"><option value="">Choose…</option>${bs.map(x=>`<option value="${x.id}" ${x.id==k.boss?'selected':''}>${x.name} (${x.role=='hod'?'HOD':'Supervisor'}, ${x.dept})</option>`).join('')}</select>
 <label>Workplace</label><select onchange="bulkSet('wp',this.value)"><option value="">None (assign later)</option>${wps.map(w=>`<option value="${w.id}" ${w.id==k.wp?'selected':''}>${w.name}</option>`).join('')}</select>
 <label>Names (one per line)</label><textarea id="bn" rows="10" placeholder="Full name, one per line">${k.names.replace(/</g,'&lt;')}</textarea>
 <button class="btn w" onclick="bulkGo()">Create accounts</button></div>`};
function bulkSet(f,v){S.bu.names=$('#bn').value;S.bu[f]=v;if(f=='boss')S.bu.wp='';draw()}
function bulkGo(){const k=S.bu;k.names=$('#bn').value;if(!k.boss)return toast('Choose who they report to');if(!k.names.trim())return toast('Enter at least one name');
 run(async()=>{const j=await api('/api/users/bulk',{boss:k.boss,wp:k.wp,names:k.names});k.names='';await load();draw();
  const t=j.made.map(m=>`${m.name} | ID: ${m.id} | Initials: ${m.ini} | Password: ${m.password}`).join('\n').replace(/</g,'&lt;');
  show(`<b>${j.made.length} accounts created</b><p class="sub" style="margin-top:6px">Default password for all. They can change it under My account.${j.skipped.length?'<br>Skipped, already exist: '+j.skipped.join(', ').replace(/</g,'&lt;'):''}</p><textarea id="bc" rows="9" readonly style="font-size:13px">${t}</textarea><button class="btn w" onclick="bulkCopy()">Copy all</button>`)})}
function bulkCopy(){const t=$('#bc');t.select();document.execCommand('copy');toast('Copied')}