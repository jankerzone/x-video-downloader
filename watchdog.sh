#!/bin/bash
DIR="/var/www/server.robsan.my.id/x"
cd $DIR

# Check if bot.js is running
if ! pgrep -f "node bot.js" > /dev/null; then
    echo "Bot not running. Starting..." >> watchdog.log
    nohup node bot.js > bot.log 2>&1 &
fi

# Check if server.js is running
if ! pgrep -f "node server.js" > /dev/null; then
    echo "Server not running. Starting..." >> watchdog.log
    nohup node server.js > server.log 2>&1 &
fi
