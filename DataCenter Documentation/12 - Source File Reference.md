# Source File Reference

## Root
| File | Role |
|---|---|
| `server.js` | Calls `src/server.start()` |
| `package.json` | Metadata, Node engine and npm scripts |
| `README.md` | Run guide, folder map and common edits |
| `DEPLOY.md` | Hosting, backups, restore and purge |
| `start.bat` | Windows launcher |
| `start-all.bat` | Windows all-in-one launcher; inspect before use |

## Backend
| File | Responsibility |
|---|---|
| `src/config.js` | Port, data path, backup retention, press config, field keys |
| `src/db.js` | Opens SQLite, exports `q`, `q1`, `ex`, `cols` |
| `src/migrate.js` | Schema creation and upgrades |
| `src/seed.js` | First-run records and default accounts |
| `src/util.js` | Date/time, audit, password hash/check, generated IDs, error helper |
| `src/access.js` | `isMgr`, `wpd` |
| `src/state.js` | Safe public user shape and role-shaped state |
| `src/entries.js` | Transactional press-entry save |
| `src/backup.js` | `snapshot`, `list`, `fileOf`, `remove`, `schedule` |
| `src/router.js` | Route registry, auth, role gate, static file serving |
| `src/server.js` | Startup and listener |
| `src/routes/auth.js` | Login, logout, people, me, password |
| `src/routes/state.js` | `/api/state` |
| `src/routes/entries.js` | Press save and lock |
| `src/routes/targets.js` | Press targets |
| `src/routes/users.js` | Accounts, department, HOD press access, remarks |
| `src/routes/operators.js` | Workplace, machine, target, assignment, operator entry and authorization |
| `src/routes/admin.js` | Sample data, clear entries, database viewer |
| `src/routes/maintenance.js` | Backup and purge |
| `src/routes/index.js` | Loads all route modules |

## Frontend
| File | Responsibility |
|---|---|
| `public/index.html` | Shell, CSS and ordered script includes |
| `public/js/app.js` | Login, app shell, state load, render/draw and startup |
| `public/js/core/api.js` | HTTP API helper and data load |
| `public/js/core/assets.js` | Shared logos/assets |
| `public/js/core/config.js` | Frontend form row labels and limits |
| `public/js/core/nav.js` | Role navigation, home tile metadata and `go()` |
| `public/js/core/state.js` | Shared browser state and press/report calculations |
| `public/js/core/time.js` | Time formatting/parsing |
| `public/js/core/util.js` | DOM, date, rounding and month helpers |
| `public/js/reports/models.js` | Press and cumulative report models |
| `public/js/reports/export.js` | Excel and printable HTML export |
| `public/js/views/home.js` | Home tiles |
| `public/js/views/dashboard.js` | Dashboard |
| `public/js/views/entry.js` | Press entry form |
| `public/js/views/reports.js` | Reports UI |
| `public/js/views/targets.js` | Target editor |
| `public/js/views/team.js` | Accounts and access |
| `public/js/views/audit.js` | Audit table |
| `public/js/views/database.js` | Database viewer |
| `public/js/views/operators.js` | Operator data entry, authorization and management |
| `public/js/views/roster.js` | Operator details |
| `public/js/views/maintenance.js` | Backup and purge UI |

## Assets and styles
- `public/css/`: `base.css`, `entry.css`, `home.css`, `maintenance.css`, `mobile.css`, `operators.css`, `reports.css`.
- `public/img/`: logo icon, wordmark, favicon and PWA icons.
- `public/manifest.webmanifest`, `public/sw.js`: PWA manifest and service worker.
