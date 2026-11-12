@echo off
rem Aperçu local du site Yacht Research (pages + fonctions Cloudflare) sur http://localhost:8790
cd /d "%~dp0..\.."
"%~dp0node_modules\.bin\wrangler.cmd" pages dev . --port 8790 --compatibility-date=2024-09-01
