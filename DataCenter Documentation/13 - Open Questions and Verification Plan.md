# Open Questions and Verification Plan

The source provides a strong technical map, but some operational/business decisions cannot be established from code alone.

## Questions for the project owner
1. Is the production server currently Windows, Linux, or a hosted Windows VPS?
2. Is the app accessed only on the factory LAN, through VPN, or from the public internet?
3. Is Cloudflare Tunnel actually used in production? If yes, where is it configured?
4. Are all initial seeded users/passwords still present in any live database?
5. Should a password change revoke all other active sessions?
6. Should public login initials and role listing remain visible?
7. Are the current roles and permissions still correct for the factory's real reporting hierarchy?
8. Are press production entries expected to be editable by Admin after locking, as currently implemented?
9. Are operator targets intended to be snapshotted at entry time, as currently implemented?
10. What are the required retention periods for audit records and backups?
11. Is Excel export expected to work when the factory internet connection is unavailable?
12. What is the approved off-machine backup destination and who tests restores?

## Verification plan

### A. Static source verification
- Compare the actual deployment folder to this ZIP (the live server may have newer files).
- Review `start-all.bat`, `start.bat` and both `tools/*.bat` before scheduling.
- Confirm generated `/config.js` matches configured presses.
- Confirm every frontend API call has a corresponding route.

### B. Functional tests
- Login with each role.
- Verify visible tabs and direct API access for each role.
- Test press entry with normal shifts, off shift, shortage reasons and invalid totals.
- Test locked entry behavior for Admin and HOD.
- Test target override, default target and Saturday behavior.
- Test operator assignment, machine requirement, pending entry, supervisor authorization and manager undo.
- Test report values against known production records.
- Test ExcelJS online and offline behavior.
- Test manual backup, download, restore on a copy, purge preview, purge and restore pre-purge snapshot.

### C. Operational tests
- Restart server and confirm migration is repeat-safe.
- Confirm one automatic backup is produced for the day.
- Confirm off-machine backup copy succeeds.
- Simulate restoring a copy in a non-production directory.
- Confirm service/task restarts after a controlled process stop.
- Confirm phone access and HTTPS behavior through the real network path.

## Evidence log template
| Date | Test | Environment | Expected | Actual | Result / notes |
|---|---|---|---|---|---|
| YYYY-MM-DD | Example: HOD cannot enter unassigned press | Test DB | HTTP 403 |  | Pending |

## Keep documentation current
Whenever code changes:
1. Update the relevant note.
2. Update API/table/permission maps if affected.
3. Add the test result to this note.
4. Record any behavior that is still uncertain.
