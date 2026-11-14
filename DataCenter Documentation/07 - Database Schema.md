# Database Schema

## Database engine and lifecycle
- SQLite via Node's built-in `node:sqlite`.
- File: `data/datacenter.db` unless `DATA_DIR` overrides it.
- `src/db.js` creates the directory and opens the database when imported.
- `src/migrate.js` enables `journal_mode=WAL` and `foreign_keys=ON`.
- Migrations run at every startup and are intended to be repeat-safe.

## Tables

| Table | Primary key / uniqueness | Purpose |
|---|---|---|
| `users` | `id` | Accounts, role, hashed password, active flag, super flag, department, supervisor flag and remark |
| `presses` | `code` | Configured press metadata and default target |
| `hod_press` | `(user_id, press)` | HOD press access mapping |
| `targets` | `(date, press)` | Date-specific press target |
| `entries` | `(date, press, shift)` | Press shift production and hour categories |
| `entry_meta` | `(date, press)` | Reasons, entered-by, status, off-shift flags and timestamps |
| `audit_log` | autoincrement `id` | Who performed an action and when |
| `sessions` | `token` | Session token, user and expiry |
| `departments` | `name` | Department names |
| `workplaces` | autoincrement `id`; unique `(dept,name)` | Work areas and optional target |
| `machines` | autoincrement `id`; unique `(workplace_id,name)` | Machines belonging to a workplace |
| `op_workplace` | `(user_id,workplace_id)` | Operator/workplace assignment |
| `op_entries` | autoincrement `id`; unique `(date,shift,workplace_id,machine_id,operator)` | Operator shift output and authorization metadata |

## Entity relationship diagram

```mermaid
erDiagram
    USERS {
      TEXT id PK
      TEXT name
      TEXT ini
      TEXT role
      TEXT pw_hash
      INTEGER active
      INTEGER super
      TEXT dept
      INTEGER sup
      TEXT remark
    }
    PRESSES {
      TEXT code PK
      TEXT location
      TEXT size
      REAL default_target
    }
    HOD_PRESS {
      TEXT user_id PK
      TEXT press PK
    }
    TARGETS {
      TEXT date PK
      TEXT press PK
      REAL tons
    }
    ENTRIES {
      TEXT date PK
      TEXT press PK
      TEXT shift PK
      REAL inp
      REAL out
    }
    ENTRY_META {
      TEXT date PK
      TEXT press PK
      TEXT entered_by
      TEXT status
      INTEGER off_a
      INTEGER off_b
    }
    DEPARTMENTS {
      TEXT name PK
    }
    WORKPLACES {
      INTEGER id PK
      TEXT dept
      TEXT name
      REAL target
    }
    MACHINES {
      INTEGER id PK
      INTEGER workplace_id
      TEXT name
    }
    OP_WORKPLACE {
      TEXT user_id PK
      INTEGER workplace_id PK
    }
    OP_ENTRIES {
      INTEGER id PK
      TEXT date
      TEXT shift
      INTEGER workplace_id
      INTEGER machine_id
      TEXT operator
      REAL actual
      REAL target
      TEXT status
    }
    SESSIONS {
      TEXT token PK
      TEXT user_id
      INTEGER expires
    }
    AUDIT_LOG {
      INTEGER id PK
      TEXT at
      TEXT user_id
      TEXT action
    }

    USERS ||--o{ SESSIONS : owns
    USERS ||--o{ HOD_PRESS : assigned
    PRESSES ||--o{ HOD_PRESS : access
    PRESSES ||--o{ TARGETS : targeted
    PRESSES ||--o{ ENTRIES : recorded
    USERS ||--o{ ENTRY_META : entered_by
    DEPARTMENTS ||--o{ WORKPLACES : contains
    WORKPLACES ||--o{ MACHINES : contains
    USERS ||--o{ OP_WORKPLACE : assigned
    WORKPLACES ||--o{ OP_WORKPLACE : assigned_to
    WORKPLACES ||--o{ OP_ENTRIES : records
    MACHINES ||--o{ OP_ENTRIES : records
```

**Caution:** The diagram is conceptual. The migration SQL does not declare foreign-key constraints for most of these relationships. Several links are enforced by route logic rather than SQLite foreign keys. `entry_meta` is logically keyed to `(date, press)` but is not declared with a SQL foreign key to `entries`.

## Press entry fields
`src/config.js` defines `F`:
`inp`, `out`, `run`, `die`, `pow`, `man`, `log`, `brk`, `noo`, `oth`, `hc`, `dies`, `ord`.

`HF` defines the eight shift-hour categories:
`run`, `die`, `pow`, `man`, `log`, `brk`, `noo`, `oth`.

Database constraints on `entries`:
- shift must be `A` or `B`;
- non-negative checks on input, output and hour categories;
- `out <= inp`;
- the eight hour categories must total 12 hours within 0.005 tolerance;
- unique row per date, press and shift.

The API also validates the 12-hour total and output/input relationship before saving.

## Operator entry fields
- Date, shift (`A` or `B`), workplace, machine (or machine ID `0` when workplace has no machines), operator, actual output, target, status, entered time, authorization user/time.
- Actual output must be non-negative.
- One record per date/shift/workplace/machine/operator.
- An authorized record cannot be edited by the operator through the normal entry endpoint.

## Schema evolution history visible in migration code
The migration includes compatibility checks/additions for:
- `users.super`
- `entry_meta.reason_offa`, `reason_offb`
- operator role support in the `users` CHECK constraint (rebuilds the table if absent)
- departments, workplaces, machines, operator assignments and operator entries
- `entry_meta.off_a`, `off_b`
- `users.remark`

This is the migration logic present in the ZIP, not a full chronological changelog.
