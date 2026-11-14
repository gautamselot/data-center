# Backend Architecture

## Backend module responsibilities
| File | Responsibility |
|---|---|
| `src/config.js` | Environment configuration, press list, field lists |
| `src/db.js` | SQLite connection and query helpers |
| `src/migrate.js` | Create schema and upgrade existing databases |
| `src/seed.js` | Initial users, presses, department and workplaces |
| `src/util.js` | Time/date helpers, audit, password hashing, IDs and errors |
| `src/access.js` | Operator-module manager/workplace permission helpers |
| `src/state.js` | Build role-filtered `/api/state` response |
| `src/entries.js` | Transactional save of a press/date's two shifts and metadata |
| `src/backup.js` | SQLite snapshots, listing, deletion, retention schedule |
| `src/router.js` | Route registry, authentication, role gate, JSON/static response |
| `src/server.js` | Startup orchestration and HTTP listener |
| `src/routes/*.js` | API endpoint handlers grouped by feature |

## Route registration pattern
A route is registered as:

```js
route('POST', '/api/example', 'any', (user, body, response) => {
  // validate and perform action
  return { ok: 1 };
});
```

Role values implemented in `src/router.js`:
- `null`: public route; no signed-in user required.
- `'any'`: any authenticated active user.
- `'admin'`: user whose `role` is `admin`.
- `'super'`: user whose `super` flag is truthy.

Handlers may perform further authorization checks beyond the route-level gate.

## Router request handling
1. Exact method + URL path lookup in the route registry (query string removed for matching).
2. Request body collected up to 2 MB, then parsed as JSON.
3. Session cookie `dc_session` read and checked against `sessions` and active `users`.
4. Route-level role check.
5. Handler called with `(user, body, responseContext)`.
6. Handler can request a file response through `responseContext.file`.
7. Otherwise JSON is returned with `Cache-Control: no-store`.
8. Errors with `.c` return their status/message; other errors become HTTP 400 with a generic server-error prefix or database constraint message.

## Database helpers
- `q(sql, ...params)`: return all matching rows.
- `q1(sql, ...params)`: return first matching row.
- `ex(sql, ...params)`: execute write statement and return SQLite run metadata.
- `cols(table)`: return column names using `PRAGMA table_info`.

Prepared statements are used through these helpers for parameterized SQL values. Table names in the admin database viewer are selected from a fixed internal allowlist.

## Route modules
`src/routes/index.js` loads:
- `auth.js`
- `state.js`
- `entries.js`
- `targets.js`
- `users.js`
- `operators.js`
- `admin.js`
- `maintenance.js`

A new route module must be required from `src/routes/index.js` or it will not register.
