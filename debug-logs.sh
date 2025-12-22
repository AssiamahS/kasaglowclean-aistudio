#!/bin/bash

# Debug log watcher for Wrangler
# Usage: ./debug-logs.sh

echo "🔍 Watching Wrangler logs..."
echo "Try your payment now and I'll show all the logs"
echo "Press Ctrl+C to stop"
echo ""

# Find the most recent wrangler log file
LOG_FILE=$(ls -t /Users/djsly/Library/Preferences/.wrangler/logs/wrangler-*.log 2>/dev/null | head -1)

if [ -z "$LOG_FILE" ]; then
  echo "❌ No Wrangler log files found"
  exit 1
fi

echo "📋 Reading: $LOG_FILE"
echo ""

# Watch the log file and filter for important events
tail -f "$LOG_FILE" | grep --line-buffered -E "(POST|GET|error|Error|PayPal|Stripe|payments)" | while read line; do
  echo "[$(date '+%H:%M:%S')] $line"
done
