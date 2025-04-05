#!/bin/bash

# Script to stop the mobile app sync process
if [ -f mobile-sync.pid ]; then
  PID=$(cat mobile-sync.pid)
  echo "Stopping mobile app sync service with PID $PID"
  kill $PID
  rm mobile-sync.pid
  echo "Mobile app sync service stopped"
else
  echo "No mobile app sync service running"
fi
