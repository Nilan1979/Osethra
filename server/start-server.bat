@echo off
cd /d G:\Coding\Osethra\server
echo Installing dependencies...
call npm install
echo.
echo Dependencies installed! Starting server...
echo.
call node app.js
