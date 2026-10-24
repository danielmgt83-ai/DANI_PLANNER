@echo off
cd /d "%~dp0"
echo آدرس: http://localhost:8080  (برای بستن، این پنجره را ببند)
start "" http://localhost:8080
python -m http.server 8080 || py -m http.server 8080
