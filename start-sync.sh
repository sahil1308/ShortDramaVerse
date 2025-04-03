#!/bin/bash

# Start the auto-sync service in the background
echo "Starting GitHub auto-sync service..."
nohup node auto-sync.js > github-sync.log 2>&1 &

# Save the process ID
echo $! > github-sync.pid

echo "Auto-sync service started! (PID: $(cat github-sync.pid))"
echo "Logs are being written to github-sync.log"