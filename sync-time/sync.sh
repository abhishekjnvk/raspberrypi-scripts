#!/bin/bash

# Get the directory where this script is saved
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SNAPSHOT_FILE="$SCRIPT_DIR/last-time-snapshot"

# 1. Load time from the snapshot so SSL/TLS certificates and connections work
if [ -f "$SNAPSHOT_FILE" ]; then
    SAVED_TIME=$(cat "$SNAPSHOT_FILE")
    if [[ "$SAVED_TIME" =~ ^[0-9]+$ ]]; then
        date -s "@$SAVED_TIME"
        echo "Time restored from snapshot (Epoch: $SAVED_TIME)"
    else
        date -s "$SAVED_TIME"
        echo "Time restored from snapshot (String format)"
    fi
else
    echo "No time snapshot found."
fi

# 2. Wait a few seconds for network initialization, then sync via NTP
sleep 10
systemctl restart systemd-timesyncd 2>/dev/null || true
timedatectl set-ntp true
echo "NTP synchronization triggered."