#!/bin/bash

if [ -f github-sync.pid ]; then
  PID=$(cat github-sync.pid)
  
  if ps -p $PID > /dev/null; then
    echo "Stopping GitHub auto-sync service (PID: $PID)..."
    kill $PID
    rm github-sync.pid
    echo "Auto-sync service stopped!"
  else
    echo "Auto-sync service is not running (stale PID file)"
    rm github-sync.pid
  fi
else
  echo "Auto-sync service is not running (no PID file found)"
fi