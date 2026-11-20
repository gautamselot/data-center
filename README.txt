DATA CENTER - quick guide
START:   open a terminal in this folder and run:  node server.js     (or: npm start)
OPEN:    http://localhost:3000   (phones: the address printed in the terminal, or your tunnel link)
STOP:    Ctrl+C in the terminal
LOGIN:   choose your initials, enter password (default Data@987 - change it under My account)

ROLES:   Admin (GS) > Management > HOD > Operator
  Admin      : everything, plus Users, Add operators, Database, Backup and purge
  Management : Press report, Dashboard, Press wise report, Entry, Targets, Operators, Audit log
  HOD        : Dashboard, Entry (presses), Press report, Press wise report, Operators (own department)
  Operator   : one Data entry screen. Supervisors also get Authorize.

UPDATING: stop the server, copy these files over the old ones, KEEP your data folder, start again.
          The database upgrades itself on first start. Back up the data folder first.
BACKUP:  stop the server, copy the whole data folder.
