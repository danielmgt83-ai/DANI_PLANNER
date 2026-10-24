#!/bin/sh
cd "$(dirname "$0")"
echo "http://localhost:8080  (Ctrl+C برای توقف)"
(command -v open >/dev/null && open http://localhost:8080) || (command -v xdg-open >/dev/null && xdg-open http://localhost:8080) || true
python3 -m http.server 8080
