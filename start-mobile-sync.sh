#!/bin/bash

# Script to start the regular mobile app sync process in the background
nohup ./sync-mobile-app.sh > mobile-sync.log 2>&1 &
echo $! > mobile-sync.pid
echo "Mobile app sync service started with PID $(cat mobile-sync.pid)"
