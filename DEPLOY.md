# Hosting Data Center on your server, backups and restore

The app is one Node.js process plus one database file (`data/datacenter.db`). Any always-on Windows or Linux machine can host it.

## A. Windows server (steps)
1. **Install Node.js 22 LTS** (installer from nodejs.org, keep "Add to PATH"). Check: `node -v` shows 22.13 or higher.
2. **Copy the project to a LOCAL drive**, for example `D:\DataCenter`. Do not run it from a network share, OneDrive or Google Drive: SQLite databases get corrupted there.
3. **Bring your existing data**: stop the laptop server, copy the laptop's `data` folder into `D:\DataCenter\data`. (Skip this to start empty.)
4. **Test it**: open a terminal in `D:\DataCenter`, run `node server.js`, then open `http://SERVER-IP:3000` from another PC.
5. **Open the firewall** (admin terminal):
   `netsh advfirewall firewall add rule name="Data Center" dir=in action=allow protocol=TCP localport=3000`
   If port 3000 is already used on that server, pick another: edit `tools\run-forever.bat` and remove `rem` before `set PORT=...`.
6. **Run it at startup and restart it if it crashes** (admin terminal):
   `schtasks /Create /TN "DataCenter" /TR "D:\DataCenter\tools\run-forever.bat" /SC ONSTART /RU SYSTEM /F`
   Start it now: `schtasks /Run /TN "DataCenter"`. Logs: `D:\DataCenter\logs\server.log`.
7. **Phones and other offices**: use the server's LAN address on the same network, or a VPN. For a public address use Cloudflare Tunnel on the server (`cloudflared`, a named tunnel with your domain, installed as a service), or a reverse proxy with HTTPS (see C).

Run **one** copy only. Two servers on the same database file will conflict. Turn off the laptop copy after moving.

## B. Linux server
```
sudo apt install -y nodejs          # must be Node 22.13+ (use NodeSource if apt is older)
sudo mkdir -p /opt/datacenter && sudo cp -r DataCenter/* /opt/datacenter/
```
`/etc/systemd/system/datacenter.service`:
```
[Unit]
Description=Data Center
After=network.target
[Service]
WorkingDirectory=/opt/datacenter
ExecStart=/usr/bin/node server.js
Environment=PORT=3000
Restart=always
[Install]
WantedBy=multi-user.target
```
`sudo systemctl enable --now datacenter`

## C. Putting it behind your web server (HTTPS, domain name)
Give the app its **own host name or port** (for example `datacenter.yourcompany.com`). It cannot live under a sub-path such as `/datacenter/`.
- **nginx**: `location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }`
- **IIS**: install URL Rewrite and Application Request Routing, add a reverse-proxy rule to `http://localhost:3000/{R:1}`, and allow the server variable `HTTP_X_FORWARDED_PROTO` set to `https`.
With `X-Forwarded-Proto: https` the app marks its sign-in cookie Secure automatically.

## D. Environment settings (optional)
`PORT` (default 3000), `DATA_DIR` (keep the database on another drive), `BACKUP_KEEP` (automatic daily backups kept, default 14).

## E. Updating the server
Stop it (`schtasks /End /TN "DataCenter"` and end the node.exe process), copy over only the changed files (never the `data` folder), then `schtasks /Run /TN "DataCenter"`. Changes in `public/` only need a browser refresh.

## F. Backups
- **Automatic**: one backup per day (and one at every start) in `data/backups`, newest 14 kept.
- **In the app**: sign in as GS, open **Backup and purge**. Back up now, download, delete.
- **Every purge makes a "Before purge" backup first.**
- **Off the machine** (important, a backup on the same disk does not survive a dead disk): edit `tools\copy-backups.bat` (set `DEST`), then schedule it daily:
  `schtasks /Create /TN "DataCenter backup copy" /TR "D:\DataCenter\tools\copy-backups.bat" /SC DAILY /ST 23:30 /RU SYSTEM /F`
- Each backup file is a complete database. You can open it with DB Browser for SQLite.

## G. Restore
1. Stop the server.
2. Copy the backup you want to `data\datacenter.db` (replace the old file) and **delete** `data\datacenter.db-wal` and `data\datacenter.db-shm` if they exist.
3. Start the server. Everything entered after that backup was made is gone, so pick the newest good one.
To undo a purge, restore the "Before purge" backup made just before it.

## H. Purge
GS only: **Backup and purge**. "Purge a selection" deletes press entries (all presses or one) or operator entries (all workplaces or one) in a date range. "Purge all" deletes every press and operator entry. Accounts, departments, workplaces, targets and presses are always kept. You must type `PURGE` or `PURGE ALL`, and the purge is written to the Audit log.
