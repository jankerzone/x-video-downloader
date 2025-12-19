#!/bin/bash
nohup node bot.js > bot.log 2>&1 &
PID=$!
echo "Bot started with PID $PID"
disown

nohup node server.js > server.log 2>&1 &
PID_SERVER=$!
echo "Server started with PID $PID_SERVER"
disown
