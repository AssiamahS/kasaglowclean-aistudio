#!/usr/bin/env bash
# One-shot migration for the recurring-appointments fields.
# Run from the repo root: bash migrate.sh
set -e
cd "$(dirname "$0")"
npx wrangler d1 execute kasaglow-submissions \
  --remote --yes \
  --file=sql/add_recurring_to_appointments.sql
echo ""
echo "✓ Migration complete. If you saw 'duplicate column name', it was already applied."
