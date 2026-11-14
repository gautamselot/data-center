# Security and Reliability Review

> This section identifies review points visible in source. It is not a penetration test, and it does not prove the live deployment is exposed or vulnerable.

## Positive controls present in source
- Passwords are stored as salted `scrypt` hashes, not plaintext.
- Password comparisons use `crypto.timingSafeEqual`.
- Session tokens use 32 cryptographically random bytes.
- Session cookie is `HttpOnly` and `SameSite=Lax`.
- Cookie gets `Secure` when the request includes `X-Forwarded-Proto: https`.
- Login attempts are throttled after five failures for five minutes per supplied ID in the process memory.
- Backend routes enforce authentication and role checks.
- Sensitive maintenance/account routes use super-admin gate.
- SQL values are generally passed as prepared-statement parameters.
- Purges take a pre-purge snapshot and run deletions in a transaction.
- Database uses WAL mode and enables SQLite foreign keys.

## Review points to validate and improve
| Area | What source shows | Why it deserves review |
|---|---|---|
| Initial password | README says default password `12345`; seed creates initial users with that password | Change all initial credentials before network exposure; consider forced password change |
| Login throttling | In-memory counter per ID, resets on process restart and is not shared across instances | Not a durable rate limit; consider persistent or edge-level throttling |
| Public people endpoint | `/api/people` returns active initials, role and super flag without login | Confirm this disclosure is acceptable for the factory |
| Session lifecycle | Session expiry is 12 hours; logout deletes all sessions for that user | Confirm whether logging out one device should invalidate every device |
| Password change | `/api/password` updates password hash but does not delete existing sessions | Decide whether password change should revoke other sessions |
| CSRF | Cookie uses `SameSite=Lax`; no explicit CSRF token appears in supplied router | Review threat model and deployment origins; add explicit protection if needed |
| Transport | Server itself is plain HTTP; HTTPS relies on tunnel/reverse proxy | Ensure all remote access is through correctly configured HTTPS |
| Proxy trust | Secure cookie decision checks request header `x-forwarded-proto` | Ensure only trusted proxy can set/forward this header |
| Request parsing | Body is limited to 2 MB; malformed JSON falls into generic error handling | Consider clearer 400 response and request content-type validation |
| Input escaping | Views build HTML strings with interpolated values | Review escaping for any user-controlled strings rendered into HTML |
| Database relations | Many logical relations lack declared foreign keys | Orphaned records may be possible; consider constraints/migrations carefully |
| Audit retention | Audit endpoint state query returns latest 300 events | Confirm retention/export needs; no cleanup/retention policy is visible here |
| Backup location | Backups default beside live database | Configure off-machine copies; same-disk backup is not disaster recovery |
| ExcelJS CDN | Excel export loads library from cdnjs | Offline factory clients or blocked CDN may lose Excel export |

## Important implementation details
- `src/router.js` matches exact method + path. It does not show a general CORS policy or explicit CSRF token mechanism.
- `GET /api/db` redacts password hashes by truncating them, but still exposes a large amount of table data to super-admin users. This is intentionally gated; protect super-admin credentials.
- The server listens on `0.0.0.0`, so it binds all network interfaces. Firewall rules and network topology matter.
- `src/routes/auth.js` login throttling uses process-local memory.
- The public login people list returns `ini`, `role`, and `super` indicator for active accounts.
- `src/routes/auth.js` logout deletes all sessions for the current user, not only the current cookie's token.

## Suggested priority
1. Replace initial/default passwords and verify all super-admin accounts.
2. Confirm remote access is HTTPS-only and the reverse proxy is trusted/configured correctly.
3. Decide whether public initials/role listing is acceptable.
4. Review CSRF and HTML escaping in the context of the actual deployment.
5. Add restore drills and off-machine backup verification.
6. Decide desired session revocation behavior.
7. Consider explicit foreign-key constraints in a carefully tested migration.

Do not implement security changes blindly: first confirm the production topology and user workflow.
