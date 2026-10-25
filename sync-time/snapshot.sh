#!/bin/bash

# Get the directory where this script is saved
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SNAPSHOT_FILE="$SCRIPT_DIR/last-time-snapshot"

# Save the current time (epoch format) to the snapshot file
date +%s > "$SNAPSHOT_FILE"
echo "Time snapshot saved."