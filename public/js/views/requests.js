// Requests: Management raise (text + optional photo), super admin sets status. Server side: src/routes/requests.js
(()=>{if(document.getElementById('rq-css'))return;const s=document.createElement('style');s.id='rq-css';s.textContent=`
:root{--y:#a87400;--yt:rgba(224,176,40,.2)}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--y:#e0b04a}}
:root[data-theme="dark"]{--y:#e0b04a}
.rq-t{width:100%;border-collapse:collapse;font-size:14px}
.rq-t th,.rq-t td{padding:11px 12px;text-align:left;vertical-align:top;white-space:normal;border-bottom:1px solid var(--line)}
.rq-t tr:last-child td{border-bottom:0}.rq-t th{color:var(--mut);font-size:12.5px;font-weight:600}
.rq-n{font-weight:800;white-space:nowrap}.rq-tx{white-space:pre-wrap;overflow-wrap:anywhere;min-width:220px}
.rq-s{display:inline-block;padding:3px 12px;border-radius:99px;font:700 12px inherit;white-space:nowrap}
.rq-s.p{background:var(--rt);color:var(--r)}.rq-s.o{background:var(--yt);color:var(--y)}.rq-s.c{background:var(--gt);color:var(--g)}
.rq-sel{width:auto;min-width:130px;font-weight:700;border-width:2px}
.rq-sel.p{border-color:var(--r);color:var(--r)}.rq-sel.o{border-color:var(--y);color:var(--y)}.rq-sel.c{border-color:var(--g);color:var(--g)}
.rq-ph{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.rq-pv{display:flex;gap:10px;align-items:center;margin-top:10px}.rq-pv img{width:84px;height:84px;object-fit:cover;border-radius:8px;border:1px solid var(--line)}
@media(max-width:640px){
.rq-t,.rq-t tbody{display:block;width:100%}.rq-t tr.hd{display:none}
.rq-t tr{display:grid;grid-template-columns:1fr auto;gap:8px 12px;padding:14px 12px;border-bottom:1px solid var(--line)}
.rq-t tr:last-child{border-bottom:0}.rq-t td{display:block;padding:0;border:0;min-width:0}
.rq-t td:nth-child(1){order:1}.rq-t td:nth-child(3){order:2;text-align:right}
.rq-t td:nth-child(2){order:3;grid-column:1/-1;min-width:0}.rq-t td:nth-child(4){order:4;grid-column:1/-1}.rq-t td:nth-child(5){order:5;grid-column:1/-1}
.rq-sel{width:100%}.rq-ph .btn{flex:1}
}`;document.head.appendChild(s)})();
const RQS=[['pending','Pending','p'],['ongoing','Ongoing','o'],['completed','Completed','c']];
const rqD=d=>d?fd(d)+' '+d.slice(0,4):'';
const rqRow=r=>{const s=RQS.find(x=>x[0]==r.status);
 return `<tr><td class="rq-n">#${r.id}</td><td class="rq-tx">${r.text}<br><small>${(usr(r.u)||{name:r.u}).name}</small></td><td>${rqD(r.at)}${r.done_at?`<br><small>Done ${rqD(r.done_at)}</small>`:''}</td><td>${r.ph?`<button class="btn s" onclick="rqPhoto(${r.id})">View photo</button>`:'<small>No photo</small>'}</td><td>${S.u.sa?`<select class="rq-sel ${s[2]}" onchange="rqSet(${r.id},this.value)">${RQS.map(([k,l])=>`<option value="${k}" ${k==r.status?'selected':''}>${l}</option>`).join('')}</select>`:`<span class="rq-s ${s[2]}">${s[1]}</span>`}</td></tr>`};
async function loadRq(){try{const j=await api('/api/requests'),el=$('#rqx');if(!el)return;const n=k=>j.list.filter(r=>r.status==k).length;
 el.innerHTML=`<div style="margin:0 0 10px">${RQS.map(([k,l,c])=>`<span class="rq-s ${c}" style="margin-right:6px">${l} ${n(k)}</span>`).join('')}</div><div class="card" style="padding:0"><table class="rq-t"><tr class="hd"><th>Ticket</th><th>Request</th><th>Date</th><th>Photo</th><th>Status</th></tr>${j.list.map(rqRow).join('')||'<tr><td colspan="5">No requests yet</td></tr>'}</table></div>`;rqPrev()}catch(e){toast(e.message)}}
V.req=()=>{const sa=!!S.u.sa;S.rqp=S.rqp||'';
 return `<h1>Requests</h1><p class="sub">${sa?'Set the status of each request.':'Write what should change or be added. Add a photo if it helps.'}</p>
 ${sa?'':`<div class="card"><label style="margin-top:0">What should change or be added?</label><textarea id="rqt" rows="3" placeholder="Describe the change"></textarea>
 <div class="rq-ph"><button class="btn s" onclick="$('#rqc').click()">Take photo</button><button class="btn s" onclick="$('#rqg').click()">From gallery</button></div>
 <input id="rqc" type="file" accept="image/*" capture="environment" hidden onchange="rqPick(this)"><input id="rqg" type="file" accept="image/*" hidden onchange="rqPick(this)">
 <div id="rqpv"></div><button class="btn w" onclick="rqAdd()">Add request</button></div>`}
 <div id="rqx" style="margin-top:12px">Loading...</div>`};
function rqPrev(){const el=$('#rqpv');if(el)el.innerHTML=S.rqp?`<div class="rq-pv"><img src="${S.rqp}" alt=""><button class="btn s" onclick="S.rqp='';rqPrev()">Remove photo</button></div>`:''}
function rqShrink(f){return new Promise((ok,no)=>{const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{const k=Math.min(1,1280/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.7))};
 im.onerror=()=>{URL.revokeObjectURL(u);no()};im.src=u})}
function rqPick(i){const f=i.files[0];i.value='';if(!f)return;rqShrink(f).then(d=>{S.rqp=d;rqPrev()}).catch(()=>toast('Could not read that photo'))}
function rqAdd(){const t=$('#rqt').value.trim();if(!t)return toast('Write the request');if(S.rqb)return;S.rqb=1;
 run(async()=>{try{await api('/api/requests',{text:t,photo:S.rqp||''});$('#rqt').value='';S.rqp='';toast('Request added');loadRq()}finally{S.rqb=0}})}
function rqSet(id,v){run(async()=>{try{await api('/api/requests/status',{id,status:v})}finally{loadRq()}})}
function rqPhoto(id){run(async()=>{const j=await api('/api/requests/photo?id='+id);show(`<img src="${j.img}" alt="Request photo" style="max-width:100%;height:auto;border-radius:8px"><button class="btn w" onclick="$('#modal').style.display='none'">Close</button>`)})}