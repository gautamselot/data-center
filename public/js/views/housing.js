// Housing Correction: V.hw(id) = one screen per workplace. Flatness has its own entry form; the rest use the plain shift-output form.
// Anyone not assigned to the workplace (HOD, admin, supervisor) gets a read-only review of the day.
const ffBlank=()=>({sec:'',cl:'',pcs:'',wt:'',op:''}),
 ffFin=r=>{const n=+String(r.sec||'').split('|')[1];return n>0&&+r.cl>0&&+r.pcs>0?Math.floor(+r.cl/n)*Math.round(+r.pcs):0},
 ffTot=()=>S.ff.rows.reduce((a,r)=>a+ffFin(r),0);
const hwHead=(w,note)=>`<h1>${w.name}</h1><p class="sub">${note||'Enter your output for one shift. Entering the same shift again updates it until it is authorized.'}${w.target==null?'':' Daily target: '+w.target+' pcs.'}</p>`;
const hwDS=()=>`<label style="margin-top:0">Date</label><input type="date" value="${S.od}" max="${TD}" onchange="S.od=this.value||TD;draw()"><label>Shift</label><select onchange="S.os=this.value;draw()"><option value="A" ${S.os=='A'?'selected':''}>Shift A (Day)</option><option value="B" ${S.os=='B'?'selected':''}>Shift B (Night)</option></select>`;
function ffInit(w){const k=[S.od,S.os,w.id].join('|');if(S.ff&&S.ff.k==k)return;
 const rs=(S.op.fr||[]).filter(r=>r.op==S.u.id&&r.date==S.od&&r.shift==S.os&&r.wp==w.id).map(r=>({sec:r.sec+'|'+r.unit,cl:r.cl,pcs:r.pcs,wt:r.wt||'',op:r.opv||''}));
 S.ff={k,rows:rs.length?rs:[ffBlank()]}}
const flatForm=w=>{ffInit(w);const cur=S.op.ents.find(e=>e.op==S.u.id&&e.date==S.od&&e.shift==S.os&&e.wp==w.id&&!e.mc),lk=cur&&cur.st=='authorized',d=lk?'disabled':'',my=S.op.ents.filter(e=>e.op==S.u.id&&e.wp==w.id).slice(0,14);
 const opt=r=>'<option value="">Select</option>'+(S.op.sec||[]).map(([c,n])=>{const v=c+'|'+n;return `<option value="${v}" ${v==r.sec?'selected':''}>${c} (${n})</option>`}).join('');
 const num=(i,k,v,l,st)=>`<td data-l="${l}"><input type="number" min="0" step="${st}" inputmode="decimal" value="${v}" oninput="ffSet(${i},'${k}',this.value)" ${d}></td>`;
 const row=(r,i)=>`<tr><td data-l="Section no"><select onchange="ffSet(${i},'sec',this.value)" ${d}>${opt(r)}</select></td>${num(i,'cl',r.cl,'C/L (mm)','any')}${num(i,'pcs',r.pcs,'PCS','1')}${num(i,'wt',r.wt,'WT/PC','any')}${num(i,'op',r.op,'O/P','any')}<td data-l="Final pieces"><b id="ffn${i}">${ffFin(r)}</b></td><td>${lk?'':`<button class="btn s" onclick="ffDel(${i})">Remove</button>`}</td></tr>`;
 return `${hwHead(w,'Final pieces = whole pieces per bar (C/L divided by section length, remainder dropped) times PCS.')}<div class="card">${hwDS()}</div>
 <div class="tw ot" style="margin-top:12px"><table class="ot ff"><tr class="hd"><th>Section no</th><th>C/L (mm)</th><th>PCS</th><th>WT/PC</th><th>O/P</th><th>Final pieces</th><th></th></tr>${S.ff.rows.map(row).join('')}</table></div>
 <div class="card" style="margin-top:12px"><b>Total final pieces: <span id="fft">${ffTot()}</span></b>${w.target==null?'':' <small>Target '+w.target+' pcs</small>'}
 ${lk?'<p class="sub">This entry is authorized and locked.</p>':`<button class="btn s" style="margin-top:12px" onclick="ffAdd()">Add row</button><button class="btn w" onclick="ffSave()">${cur?'Update entry':'Submit entry'}</button>`}</div>
 <h2>My recent entries</h2>${opTable(my,false)}`};
function ffSet(i,k,v){const r=S.ff.rows[i];r[k]=v;if(k=='sec'||k=='cl'||k=='pcs'){$('#ffn'+i).textContent=ffFin(r);$('#fft').textContent=ffTot()}}
function ffAdd(){S.ff.rows.push(ffBlank());draw()}
function ffDel(i){S.ff.rows.splice(i,1);if(!S.ff.rows.length)S.ff.rows.push(ffBlank());draw()}
function ffSave(){const rs=S.ff.rows.filter(r=>r.sec||r.cl!==''||r.pcs!=='');if(!rs.length)return toast('Add at least one row');if(rs.some(r=>!r.sec||!(+r.cl>0)||!(+r.pcs>0)))return toast('Each row needs a section, C/L and PCS');
 run(async()=>{await api('/api/op/flat',{date:S.od,shift:S.os,wp:S.ow,rows:rs.map(r=>({sec:r.sec,cl:+r.cl,pcs:+r.pcs,wt:+r.wt||0,op:+r.op||0}))});S.ff=null;await load();toast('Entry saved');draw()})}
const genForm=w=>{S.ow=w.id;if(w.m.length&&!w.m.some(m=>m.id==S.om))S.om=w.m[0].id;
 const mc=w.m.length?S.om:0,cur=S.op.ents.find(e=>e.op==S.u.id&&e.date==S.od&&e.shift==S.os&&e.wp==w.id&&e.mc==mc),lk=cur&&cur.st=='authorized',my=S.op.ents.filter(e=>e.op==S.u.id&&e.wp==w.id).slice(0,14);
 return `${hwHead(w)}<div class="card">${hwDS()}${w.m.length?`<label>Machine</label><select onchange="S.om=+this.value;draw()">${w.m.map(m=>`<option value="${m.id}" ${m.id==mc?'selected':''}>${m.name}</option>`).join('')}</select>`:''}
 <label>Actual output (pcs)</label><input id="oa" type="number" min="0" step="1" inputmode="numeric" placeholder="0" value="${cur?cur.actual:''}" ${lk?'disabled':''}>
 ${lk?'<p class="sub">This entry is authorized and locked.</p>':`<button class="btn w" style="margin-top:12px" onclick="saveO()">${cur?'Update entry':'Submit entry'}</button>`}</div><h2>My recent entries</h2>${opTable(my,false)}`};
const ffTable=fr=>`<div class="tw ot"><table class="ot"><tr><th>Shift</th><th>By</th><th>Section</th><th>C/L</th><th>PCS</th><th>WT/PC</th><th>O/P</th><th>Final pcs</th></tr>${fr.map(r=>`<tr><td>${r.shift}</td><td><small>${opIni(r.op)}</small></td><td>${r.sec} (${r.unit})</td><td>${r.cl}</td><td>${r.pcs}</td><td>${r.wt||'-'}</td><td>${r.opv||'-'}</td><td><b>${r.fin}</b></td></tr>`).join('')||'<tr><td colspan="8">No rows</td></tr>'}</table></div>`;
const hwReview=w=>{const es=S.op.ents.filter(e=>e.wp==w.id&&e.date==S.od),fr=(S.op.fr||[]).filter(r=>r.wp==w.id&&r.date==S.od);
 return `${hwHead(w,'Entries for the selected day.')}<div class="card"><label style="margin-top:0">Date</label><input type="date" value="${S.od}" max="${TD}" onchange="S.od=this.value||TD;draw()"></div><h2>Entries</h2>${opTable(es,true)}${w.name=='Flatness'?`<h2>Flatness rows</h2>${ffTable(fr)}`:''}`};
V.hw=id=>{const w=wpOf(id);S.od=S.od||TD;S.os=S.os||'A';
 if(!w)return `<h1>Housing Correction</h1><p class="sub">${S.u.role=='operator'?'No workplace is assigned to you yet. Ask your HOD to assign one.':'No workplaces yet. Add them in User Management, Operators.'}</p>`;
 return S.u.role=='operator'&&w.mine?(w.name=='Flatness'?flatForm(w):genForm(w)):hwReview(w)};