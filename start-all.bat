@echo off
cd /d %~dp0
rem Opens two windows: the server and the Cloudflare tunnel (public link is printed in the tunnel window).
start "Data Center server" cmd /k node server.js
start "Cloudflare tunnel" cmd /k cloudflared tunnel --url http://localhost:3000
