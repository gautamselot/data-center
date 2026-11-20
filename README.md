# Data Center

Press production entry, reports and the operator module. Zero dependencies. Needs **Node.js 22.13+**.

## Run
- `node server.js`  (or double-click `start.bat`)
- While you are editing code: `npm run dev` restarts the server by itself when you save a file.
- Phone link (tunnel) too: `start-all.bat`
- Open http://localhost:3000. Sign in with initials. Default password `Data@987` (change it under My account).

## Folder map
```
DataCenter/
├─ server.js                 starts the server (one line)
├─ package.json              scripts: start, dev
├─ start.bat / start-all.bat
├─ data/                     YOUR DATABASE (created on first run). Never overwrite.
│  └─ backups/               automatic + manual + before-purge backups
├─ tools/                    run-forever.bat (service), copy-backups.bat (copy backups off the machine)
├─ DEPLOY.md                 hosting on a server, backup, restore, purge
├─ src/                      BACKEND
│  ├─ config.js              port, data folder, LIST OF PRESSES + default targets
│  ├─ db.js                  database connection + q / q1 / ex helpers
│  ├─ migrate.js             tables and upgrades (add new columns/tables here)
│  ├─ seed.js                first-run data (presses, starting users, Housing department)
│  ├─ util.js                time, audit log, passwords, errors
│  ├─ access.js              permission helpers (isMgr)
│  ├─ state.js               what each role receives from /api/state
│  ├─ entries.js             saves a press entry
│  ├─ backup.js              database snapshots + automatic daily backup
│  ├─ router.js              routing + serving the /public folder
│  ├─ server.js              start-up sequence
│  └─ routes/                ONE FILE PER AREA OF THE API
│     ├─ auth.js  state.js  entries.js  targets.js  users.js  operators.js  admin.js  maintenance.js (backup + purge)
│     └─ index.js            list of route files
└─ public/                   FRONTEND (what the browser loads)
   ├─ index.html             page shell: just links to the files below
   ├─ manifest.webmanifest, sw.js
   ├─ img/                   logos and app icons (replace the PNGs to change them)
   ├─ css/                   base, home, mobile, entry, reports, operators
   └─ js/
      ├─ core/               util, assets, config, time, state, api, nav
      ├─ reports/            models (report tables), export (Excel/print)
      ├─ views/              ONE FILE PER SCREEN: home, dashboard, entry, reports, targets,
      │                      team, audit, database, operators, roster, maintenance
      └─ app.js              header/nav/login/start-up
```

## Updating without re-uploading everything
Each file does one job, so send or replace **only the file that changed**. Your `data/` folder is never part of an update.
- Changed something in `public/` (screens, styles): save, refresh the browser (hold Shift + reload on a phone if it looks old). No restart.
- Changed something in `src/`: restart the server (automatic with `npm run dev`).
- The database upgrades itself on start (`src/migrate.js`).

## Where do I change...?
| I want to... | Edit |
|---|---|
| Fix/change a screen | `public/js/views/<screen>.js` |
| Change colours, spacing, phone layout | `public/css/*.css` (colours are variables at the top of `base.css`) |
| Change who sees which tab | `public/js/core/nav.js` (`TABS`) and, for the server, the role in the route (`src/routes/*`) |
| Change a report table | `public/js/reports/models.js` |
| Change the entry form rows or limits | `public/js/core/config.js` (`ROWS`, `LIM`) |
| Add/rename a press | `src/config.js` (`PRESSES`), restart. New presses appear everywhere automatically. Assign HODs in Team and access. |
| Change the 1/5 report rule (P10 excluded) | `SC` in `public/js/core/state.js` |
| Add a department / workplace / machine / target / operator | In the app: Team and access (super admin) and Operators (HOD) |
| Change the logo | replace `public/img/logo-icon.png` and `logo-wordmark.png` |

## Add a new screen (3 steps)
1. Create `public/js/views/mything.js`:
   ```js
   V.mything=()=>`<h1>My thing</h1><p class="sub">Hello ${S.u.name}</p>`;
   ```
2. Add `<script src="/js/views/mything.js"></script>` to `public/index.html` (before `app.js`).
3. In `public/js/core/nav.js` add `['mything','My thing']` to the roles that should see it, and a tile in `TI`.

## Add a new API call (3 steps)
1. In the right file in `src/routes/` (or a new one) add:
   ```js
   route('POST','/api/mything','any',(u,b)=>{ /* u = signed-in user, b = request body */ return {ok:1} });
   ```
   Roles: `null` public, `'any'` signed in, `'admin'`, `'super'` (GS only). Throw errors with `bad('message',403)`.
2. If it is a new file, add one `require` line in `src/routes/index.js`.
3. From a screen call `await api('/api/mything',{...})`, usually inside `run(async()=>{...})`.

## Add a database column or table
Add a line at the **end** of `migrate()` in `src/migrate.js`, e.g.
`if(!cols('users').includes('phone'))ex('ALTER TABLE users ADD COLUMN phone TEXT');`
Existing data is kept.

## Roles
Admin (GS) > Management > HOD > Operator.
- Admin (super): everything, plus Users, Add operators, Database, Backup and purge, departments, accounts.
- Management: Press report, Dashboard, Press wise report, Entry, Targets, Operators, Operator details, Audit log.
- HOD: Dashboard, Entry (presses), Press report, Press wise report; with a department also Operators and Operator details.
- Operator: one Data entry screen. Supervisors also get Authorize.

## Backup, restore, purge, hosting on a server
See **DEPLOY.md**. In short: GS opens **Backup and purge** in the app (backup now, download, purge a selection, purge all). A backup is also made automatically every day and before every purge.
