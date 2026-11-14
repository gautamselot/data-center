# API Catalogue

All endpoints below are registered in `src/routes/`. All non-public routes require a valid session. The route-level role is shown first; handlers may add finer checks.

## Authentication
| Method | Endpoint | Route gate | Purpose |
|---|---|---|---|
| POST | `/api/login` | Public | Sign in using ID or initials and password |
| POST | `/api/logout` | Any | Delete sessions for current user and clear cookie |
| GET | `/api/people` | Public | Return active users' initials, role and super flag |
| GET | `/api/me` | Any | Return current public user object |
| POST | `/api/password` | Any | Change own password (minimum five characters) |

## State and press production
| Method | Endpoint | Gate | Purpose |
|---|---|---|---|
| GET | `/api/state` | Any | Return role-shaped app data |
| POST | `/api/entry` | Any + press access | Save both shifts for one press/date and reasons |
| POST | `/api/entry/lock` | Admin | Toggle entry status between submitted and locked |
| POST | `/api/target` | Admin | Upsert date-specific press target |
| POST | `/api/default` | Admin | Change press default target |
| POST | `/api/targets/reset` | Admin | Delete targets matching a month prefix |

## Users and departments
| Method | Endpoint | Gate | Purpose |
|---|---|---|---|
| POST | `/api/users` | Super | Create account and return generated password |
| POST | `/api/users/reset` | Super | Reset account password and delete that user's sessions |
| POST | `/api/users/toggle` | Super | Toggle active state; cannot deactivate self |
| POST | `/api/users/press` | Super | Toggle HOD press assignment |
| POST | `/api/dept` | Super | Create department |
| POST | `/api/users/dept` | Super | Change user's department |
| POST | `/api/users/remark` | Any + manager check | Update operator/user remark for a managed department |

## Operator module
| Method | Endpoint | Gate | Purpose |
|---|---|---|---|
| POST | `/api/op/workplace` | Any + manager check | Create workplace in permitted department |
| POST | `/api/op/machine` | Any + manager check | Add machine to a workplace |
| POST | `/api/op/target` | Any + manager check | Set workplace target |
| POST | `/api/op/assign` | Any + manager check | Toggle operator/workplace assignment |
| POST | `/api/op/entry` | Any + operator role + assignment | Create/update operator's shift entry |
| POST | `/api/op/authorize` | Any + manager/supervisor check | Authorize or undo authorization, depending on role |

## Admin and maintenance
| Method | Endpoint | Gate | Purpose |
|---|---|---|---|
| POST | `/api/sample` | Super | Generate sample press entries for a month |
| POST | `/api/clear` | Super | Clear press entries and metadata |
| GET | `/api/db` | Super | Read-only table viewer; up to 300 latest rows/table |
| GET | `/api/backups` | Super | List backups and retention settings |
| POST | `/api/backup` | Super | Create manual snapshot |
| GET | `/api/backup/download` | Super | Download named backup |
| POST | `/api/backup/delete` | Super | Delete named backup |
| POST | `/api/purge/preview` | Super | Count rows in requested purge scope |
| POST | `/api/purge` | Super + confirmation | Purge selected press/operator entries in date range |
| POST | `/api/purge/all` | Super + confirmation | Purge all press and operator entries |

## API integration notes
- Frontend API calls are made through `public/js/core/api.js`.
- The endpoint catalogue is derived from the current ZIP; it does not describe undocumented endpoints that may exist in a running server outside this archive.
- `GET /api/people` is public and exposes active initials, role and super-admin indicator. This is visible in source and should be considered when reviewing the sign-in design.
