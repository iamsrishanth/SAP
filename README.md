# Retail Loyalty & Rewards (SAP CAP)

Omni-channel retail customer loyalty and rewards system built on SAP Cloud Application
Programming Model (CAP), Node.js — OData V4 service, live dashboard, automated tests.

## Quick start

```bash
npm install
npm run deploy:local        # creates db.sqlite with seed data
npm run watch               # starts the service (default port 4004)
# open http://localhost:4004/loyalty/webapp/index.html
```

## What it does

- 4 entities: Customers, Transactions, Redemptions, RewardPolicies
- OData V4 at `/odata/v4/loyalty` with full CRUD
- Custom actions:
  - `recordPurchase` — Online = 2 pts / ₹100, Store = 1 pt / ₹100, floor-rounded
  - `redeemPoints` — validates balance, deducts, rejects over-redemption
- Automatic tier recalculation after every purchase/redemption
  (≥3000 Platinum · ≥1500 Gold · ≥500 Silver · else Bronze)
- Live dashboard with KPI cards, tier leaderboard, activity feeds, quick actions,
  error toasts, and demo-mode fallback when the service is offline

## Scripts

| Command | Purpose |
|---|---|
| `npm run watch` | Dev server with live reload |
| `npm run start` | Production server |
| `npm run build` | CDS build |
| `npm run deploy:local` | Deploy schema + seeds to `db.sqlite` |
| `npm test` | 13 API tests (in-memory DB) |
| `npm run test:unit` | Single test file |
| `npm run test:smoke` | Headless-Chrome dashboard smoke test (needs google-chrome) |

## Structure

```
db/schema.cds            domain model (CDS)
db/data/*.csv            seed data (6 customers, 6 txns, 3 redemptions, 3 policies)
srv/loyalty-service.cds  OData V4 service + actions
srv/loyalty-service.js   action handlers + tier engine
app/loyalty/webapp/      static dashboard (index.html, app.js, style.css)
test/                    API tests + browser smoke script
docs/                    deployment guide, test sheet, architecture/ERD diagrams
screenshots/             desktop/tablet/mobile renders, test results
doc.md                   full project documentation
```

## Accessibility review

- All form controls have visible `<label>` elements
- Toast notifications use `role="status" aria-live="polite"`
- Tables are semantic (`<thead>`/`<tbody>`, `<th>` column headers)
- Navigation is a real `<nav>` with an aria-label; links are keyboard-focusable
- Tier badges carry text labels (not color-only)
- Color contrast: dark navy `#073763` header with white text (≈11:1); muted text `#64748b`
  on white (≈4.7:1); error `#bb0000` (≈5.9:1)
- Focus-visible outline is browser-default and not suppressed
- Responsive: single-column stack below 900px, no horizontal overflow

## Deployment

Local: `npm run deploy:local && npm run watch`.
SAP BTP + HANA Cloud: see `docs/DEPLOYMENT.txt` and `HANA_Deployment_Guide.md`.

## Documentation

Full report with diagrams and screenshots: [doc.md](doc.md).
