# Developer Change Guide

## Trace a feature before editing
For every requested change, trace:
1. Which view renders the UI?
2. Which frontend helper/API call does it use?
3. Which backend route receives it?
4. Which business logic/helper validates or transforms it?
5. Which tables/columns are read or written?
6. Which roles can perform it?
7. Which reports or other screens consume the result?

## Common change map
| Requirement | Likely files to inspect |
|---|---|
| Change a screen | `public/js/views/<screen>.js` |
| Change global shell/login/startup | `public/js/app.js` |
| Change tab visibility | `public/js/core/nav.js` |
| Change shared API behavior | `public/js/core/api.js` |
| Change global frontend state/calculations | `public/js/core/state.js` |
| Change entry form fields/limits | `public/js/core/config.js`, `src/config.js`, `src/routes/entries.js`, `src/migrate.js` as applicable |
| Change press list/default targets | `src/config.js` and generated `/config.js` flow |
| Change report columns/calculations | `public/js/reports/models.js` |
| Change Excel/print behavior | `public/js/reports/export.js` |
| Add/change API endpoint | relevant `src/routes/*.js`; add route module to `src/routes/index.js` |
| Change database schema | append safe/repeatable migration in `src/migrate.js` |
| Change password/session behavior | `src/routes/auth.js`, `src/router.js`, `src/util.js` |
| Change permissions | `src/router.js`, route handler, `src/access.js`, `public/js/core/nav.js` |
| Change backup/purge | `src/backup.js`, `src/routes/maintenance.js`, `public/js/views/maintenance.js` |
| Change deployment | `DEPLOY.md`, `start*.bat`, `tools/*.bat`, `src/config.js` |

## Adding a screen
1. Add `public/js/views/<key>.js` and define `V.<key> = () => ...`.
2. Add its script tag in `public/index.html` before `app.js`.
3. Add the tab to appropriate role arrays in `public/js/core/nav.js`.
4. Add tile metadata in `TI` if it should appear on Home.
5. Check route access for every API action used by the screen.

## Adding an API endpoint
1. Add route in the correct `src/routes/*.js` module.
2. If new module, require it in `src/routes/index.js`.
3. Validate input server-side; never rely only on frontend validation.
4. Choose the narrowest route-level role.
5. Add handler-level checks for record ownership/department/assignment.
6. Audit consequential administrative changes.
7. Call through `api()` from frontend.
8. Test unauthenticated, wrong-role, valid-role and invalid-input cases.

## Database migration discipline
- Add changes at the end of `migrate()` using existence checks.
- Keep migrations repeat-safe.
- Avoid dropping/rebuilding tables unless migration preserves every relevant field and index.
- Test against a copy of the database.
- Back up production before schema changes.
- Keep data directory out of code deployment packages.

## Regression checklist
- Login/logout and session expiry
- Role-based navigation and backend access
- Admin, HOD, operator and supervisor cases
- Press entries for both shifts; off-shift; reason requirements; locked entries
- Targets and Saturday behavior
- Report totals, target comparisons, Excel and print export
- Operator assignment, machine selection, pending/authorized transitions
- Backup create/download/delete; purge preview/confirmation/restore
- Mobile layout and browser refresh/cache behavior
