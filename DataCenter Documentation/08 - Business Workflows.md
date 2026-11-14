# Business Workflows

## A. Press production entry

```mermaid
flowchart TD
    A["User opens Entry screen"] --> B["Select date and press"]
    B --> C["Enter Shift A and Shift B values"]
    C --> D{"Shift marked off?"}
    D -->|Yes| E["Require reason for off shift"]
    D -->|No| F["Validate eight hour categories"]
    E --> F
    F --> G{"Each shift totals 12 hours<br/>and output ≤ input?"}
    G -->|No| X["Show validation error"]
    G -->|Yes| H{"Shortage / breakdown / other hours?"}
    H -->|Yes| I["Require reason"]
    H -->|No| J["POST /api/entry"]
    I --> J
    J --> K["Check press exists, access and lock state"]
    K --> L["saveEntry transaction"]
    L --> M["Upsert Shift A + Shift B"]
    M --> N["Upsert entry_meta + reasons"]
    N --> O["Audit event"]
```

Verified rules:
- Both shifts are submitted together.
- A shift marked off is normalized to 12 hours of `oth` in the server-side save path.
- Eight hour categories must sum to 12 hours.
- `out` cannot exceed `inp`.
- Reasons are required when log, breakdown or other hours are present; off-shift reasons are separately required.
- Admin can save a locked entry; a non-admin cannot.
- Non-admin press entry requires an assignment in `hod_press`.

## B. Press targets and reports
- Default press targets live in `presses.default_target`.
- Date-specific targets live in `targets`.
- The frontend target helper uses a date-specific target if present; otherwise it uses the default target, except Saturday defaults to zero.
- Admin can update date-specific targets, change defaults or reset a month's overrides.
- `pressModel()` creates one press's monthly report.
- `cumModel()` creates a cumulative press-wise report.
- Report models are reused for screen, Excel and printable HTML output.

## C. Operator setup and entry

```mermaid
flowchart TD
    A["Super admin creates account / department"] --> B["Admin or matching HOD creates workplace"]
    B --> C["Manager optionally adds machines"]
    C --> D["Manager sets workplace target"]
    D --> E["Manager assigns operator to workplace"]
    E --> F["Operator submits date + shift + actual output"]
    F --> G["Server checks operator role and assignment"]
    G --> H["Entry stored as pending"]
    H --> I["Supervisor / matching HOD / admin reviews"]
    I --> J["Authorized"]
    J --> K["Operator edit blocked"]
    I -->|Manager undo only| H
```

Verified rules:
- An operator must be assigned to the workplace.
- If a workplace has machines, the operator must choose one; if no machines exist, machine ID `0` is used.
- Operator output is rounded to an integer.
- The target value is copied from the workplace at entry time.
- Existing pending entry is upserted; authorized entry is locked from operator editing.
- A supervisor operator can authorize another operator's entry in the same department, but cannot authorize their own.
- Only an admin or matching HOD can undo an authorization.

## D. Account and access management
- Only super-admin can create/reset/toggle accounts, change departments and toggle HOD press assignments.
- New account role is normalized to `admin`, `operator` or `hod`.
- New operators must have a department.
- HOD creation initially assigns all configured presses in `PRESSES`; access can later be toggled.
- Password reset generates a temporary password and removes that user's sessions.
