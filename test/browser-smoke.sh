#!/usr/bin/env bash
# Browser smoke test for the Retail Loyalty & Rewards dashboard.
# Boots the CAP service, renders the dashboard in headless Chrome, and
# asserts the seeded demo data and KPI blocks are present in the DOM.
#
# Requirements: node 22+, google-chrome (headless), local db.sqlite deployed.
# Run: npm run test:smoke
set -euo pipefail

cd "$(dirname "$0")/.."

# Prefer a known-good Node 22 if the default PATH resolves to an older Node.
if ! node --version 2>/dev/null | grep -qE '^v(22|23|24)\.'; then
  NVM_NODE="/home/sri/.hermes/profiles/main/home/.nvm/versions/node/v22.23.1/bin"
  if [ -d "$NVM_NODE" ]; then export PATH="$NVM_NODE:$PATH"; fi
fi

PORT="${SMOKE_PORT:-4144}"
PID=""
cleanup() {
  [ -n "$PID" ] && kill "$PID" 2>/dev/null || true
}
trap cleanup EXIT

echo ">> Deploying seed data to db.sqlite"
node_modules/.bin/cds deploy --to sqlite:db.sqlite >/dev/null 2>&1

echo ">> Starting CAP service on :$PORT"
node_modules/.bin/cds serve --port "$PORT" >/tmp/smoke-server.log 2>&1 &
PID=$!

for i in $(seq 1 30); do
  if curl -sf "http://localhost:$PORT/odata/v4/loyalty/Customers" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "http://localhost:$PORT/odata/v4/loyalty/Customers" >/dev/null 2>&1; then
  echo "!! Service failed to start. Log tail:"; tail -20 /tmp/smoke-server.log; exit 1
fi

echo ">> Rendering dashboard in headless Chrome"
DOM=$(timeout 60 google-chrome --headless=new --disable-gpu --no-sandbox \
  --virtual-time-budget=8000 --dump-dom \
  "http://localhost:$PORT/loyalty/webapp/index.html" 2>/dev/null)

fail=0
check() {
  local label="$1" needle="$2"
  if echo "$DOM" | grep -qF "$needle"; then
    echo "  ✔ $label"
  else
    echo "  ✘ $label (missing: $needle)"
    fail=1
  fi
}

check "KPI: Total Customers rendered"    'id="totalCustomers"'
check "KPI: Points Issued rendered"      'id="pointsIssued"'
check "KPI: Points Redeemed rendered"    'id="pointsRedeemed"'
check "KPI: Available Points rendered"   'id="availablePoints"'
check "Live OData badge shown"           'Live OData'
check "Seeded customer Aarav Sharma"     'Aarav Sharma'
check "Seeded customer Ananya Reddy"     'Ananya Reddy'
check "Seeded customer Rohan Mehta"      'Rohan Mehta'
check "Seeded transaction rendered"      'Online · ₹6,500.00'
check "Seeded redemption rendered"       'Festival voucher'
check "Reward policy grid rendered"      'points per ₹100'

if [ "$fail" -eq 0 ]; then
  echo ">> SMOKE PASS"
  exit 0
else
  echo ">> SMOKE FAIL"
  exit 1
fi