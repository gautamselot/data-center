// Audit log.
V.aud=()=>`<h1>Audit log</h1><p class="sub">Entries, locks, targets and account changes.</p><div class="card tw"><table><tr><th>When</th><th>Who</th><th>Action</th></tr>${S.audit.map(a=>`<tr><td>${a.at}</td><td>${(usr(a.u)||{name:a.u}).name}</td><td>${a.t}</td></tr>`).join('')}</table></div>`;
