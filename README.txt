DATA CENTER - quick guide
START:   open a terminal in this folder and run:  node server.js     (or: npm start)
OPEN:    http://localhost:3000   (phones: the address printed in the terminal, or your tunnel link)
STOP:    Ctrl+C in the terminal
LOGIN:   choose your initials, enter password (default 12345 - change it after first login)

ROLES:   Super admin (GS) > Admin > HOD > Operator
  Super admin : everything, plus Team and access, Database, departments, accounts
  Admin       : Dashboard, Entry, Reports, Operators, Targets, Audit log
  HOD         : Dashboard, Entry (presses), Reports, Operators (own department)
  Operator    : one Data entry screen. Supervisors also get Authorize.

UPDATING: stop the server, copy these files over the old ones, KEEP your data folder, start again.
          The database upgrades itself on first start. Back up the data folder first.
BACKUP:  stop the server, copy the whole data folder.
