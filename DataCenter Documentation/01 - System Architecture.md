# System Architecture

## Context diagram

```mermaid
flowchart TB
    People["Factory users<br/>Admin / HOD / Operator / Supervisor"]
    Browser["Browser / mobile browser"]
    App["Data Center web application<br/>HTML + CSS + Vanilla JS"]
    Node["Node.js process<br/>built-in HTTP server + custom router"]
    SQLite[("SQLite database<br/>data/datacenter.db")]
    Backups[("SQLite backup files<br/>data/backups/*.db")]
    CDN["ExcelJS CDN<br/>cdnjs.cloudflare.com"]
    Tunnel["Optional network exposure<br/>LAN / VPN / Cloudflare Tunnel / reverse proxy"]

    People --> Browser
    Browser --> App
    App <-->|JSON API| Node
    Node <--> SQLite
    Node --> Backups
    App -. Excel export library .-> CDN
    Browser <-->|LAN / HTTPS proxy / tunnel| Tunnel
    Tunnel <--> Node
```

## Three application layers

| Layer | Location | Responsibility |
|---|---|---|
| Presentation | `public/` | Login, navigation, screens, reports, forms, styling and PWA assets |
| Application/server | `src/` | HTTP routing, authentication, permissions, validation, business rules and backup orchestration |
| Persistence | `data/datacenter.db` | Users, presses, targets, production entries, departments, workplaces, machines, sessions and audit events |

## Request lifecycle

```mermaid
sequenceDiagram
    actor User
    participant View as public/js/views/*
    participant API as public/js/core/api.js
    participant Router as src/router.js
    participant Route as src/routes/*
    participant Logic as src/*.js
    participant DB as SQLite

    User->>View: Submit a form / choose an action
    View->>API: api('/api/...', payload)
    API->>Router: HTTP request + JSON body + cookie
    Router->>Router: Match method/path
    Router->>DB: Resolve session from dc_session
    Router->>Router: Apply route-level role gate
    Router->>Route: Invoke handler(user, body, response)
    Route->>Logic: Validate / call shared business logic
    Logic->>DB: Prepared SQL query or transaction
    DB-->>Logic: Rows / change count
    Logic-->>Route: Result
    Route-->>Router: JSON result / cookie / file
    Router-->>API: HTTP response
    API-->>View: Parsed result or error
    View-->>User: Update UI / show toast
```

## Architectural characteristics
- Single Node.js process; deployment guide explicitly says to run one copy against a database file.
- The router is custom rather than Express or another framework.
- Route modules register themselves by calling `route(method, path, role, handler)`.
- The browser receives press configuration through a generated `/config.js` endpoint. The press list is maintained in `src/config.js`.
- Frontend screens are functions stored on the global `V` registry and return HTML strings.
- The database layer exposes small synchronous helpers: `q` (all rows), `q1` (one row), `ex` (write/run), and `cols` (table column names).
- SQLite uses WAL mode and foreign-key enforcement is enabled by migration SQL.

## Important external dependency
`public/index.html` loads ExcelJS 4.4.0 from cdnjs. The npm package declares zero dependencies, but Excel export therefore depends on browser access to that CDN. Printable HTML export has a fallback path if ExcelJS is unavailable.
