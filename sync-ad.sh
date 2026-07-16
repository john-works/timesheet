#!/bin/bash
# AD/LDAP Auto-Sync Script
# Runs the Kimai LDAP sync command and logs output

APP_DIR="/var/www/html/timesheet"
LOG_DIR="/var/log/kimai"
LOG_FILE="$LOG_DIR/ldap-sync.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Rotate log if larger than 10MB
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt 10485760 ]; then
    mv "$LOG_FILE" "$LOG_FILE.$(date +%Y%m%d%H%M%S).bak"
    gzip "$LOG_FILE."*.bak 2>/dev/null
    # Keep only last 5 rotated logs
    ls -t "$LOG_DIR"/ldap-sync.log.*.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
fi

echo "========================================" >> "$LOG_FILE"
echo "LDAP Sync started: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"

cd "$APP_DIR"
php bin/console kimai:ldap:sync --skip-disabled 2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo "LDAP Sync finished: $(date '+%Y-%m-%d %H:%M:%S') (exit code: $EXIT_CODE)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

exit $EXIT_CODE
