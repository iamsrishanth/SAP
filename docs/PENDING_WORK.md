# Pending Work and Follow-Up Checklist

This checklist captures the items that still need attention after the frontend completion work for the Retail Loyalty & Rewards CAP project.

## Environment and Review Follow-Ups

- [x] Install a browser renderer such as Chromium, Chrome, Firefox, Playwright, Puppeteer, or `wkhtmltoimage` in the development/review environment. _(Done: Google Chrome headless + Hermes browser stack used.)_
- [x] Capture true browser-rendered desktop and mobile screenshots of `app/loyalty/webapp/index.html` after the renderer is available. _(Done: `screenshots/desktop-1366.png`, `screenshots/tablet-768.png`, `screenshots/mobile-390.png`.)_
- [x] Attach the screenshots to the pull request or project documentation for visual review. _(Done: committed to `screenshots/` and referenced in `doc.md` + README.)_
- [x] Confirm whether generated screenshots should be committed to the repository or kept as PR artifacts only. _(Decision: committed to the repo — this is a capstone submission, reviewers need offline access.)_

## Frontend Validation

- [x] Run the frontend against a live CAP service with `npm run watch` or `cds watch`. _(Done: `cds watch --port 4044`, dashboard opened at `/loyalty/webapp/index.html`.)_
- [x] Verify live OData reads for `Customers`, `Transactions`, `Redemptions`, and `RewardPolicies`. _(Done: dashboard rendered "Live OData" with all 4 entity sets; curl checks returned seeded rows.)_
- [x] Verify the `recordPurchase` quick action from the dashboard updates the transaction list, KPI totals, customer balance, and tier. _(Done: ₹1,000 Online for Aarav Sharma → +20 pts; balance 1,250 → 1,270; Points Issued KPI 1,298 → 1,318; new activity row appeared.)_
- [x] Verify the `redeemPoints` quick action updates the redemption list, KPI totals, customer balance, and tier. _(Done: 250-pt redemption → balance 1,270 → 1,020; Points Redeemed KPI 1,550 → 1,800; new redemption row appeared.)_
- [x] Confirm error toasts display for invalid purchase amounts, invalid redemption amounts, missing customers, and insufficient loyalty points. _(Done: ₹0 purchase rejected with "Valid customer, channel and amount are required"; 99,999-pt redemption rejected with "Insufficient loyalty points"; both surfaced as red toasts.)_
- [x] Confirm the dashboard layout remains usable at desktop, tablet, and mobile widths. _(Done: screenshots captured at 1366px, 768px, 390px; single-column stack at mobile with no horizontal overflow; desktop grid verified visually.)_

## Backend and Data Follow-Ups

- [x] Add seed data for customers, transactions, redemptions, and reward policies so the live service has realistic demo content immediately after startup. _(Done: 6 customers, 6 transactions, 3 redemptions, 3 reward policies in `db/data/*.csv`, auto-loaded on deploy.)_
- [x] Confirm the exposed OData projection includes the customer foreign key fields used by the frontend activity lists. _(Confirmed: OData responses include `customer_ID` on Transactions/Redemptions — verified via live GET and unit probe.)_
- [x] Add automated tests for the `recordPurchase` action, including online/store point calculations. _(Done: `test/LoyaltyService.test.js` — 2 pts/₹100 online, 1 pt/₹100 store, floor rounding, accumulation, invalid input, unknown customer.)_
- [x] Add automated tests for the `redeemPoints` action, including insufficient-balance validation. _(Done: happy path, insufficient balance, non-positive points, unknown customer.)_
- [x] Add automated tests for tier recalculation after purchases and redemptions. _(Done: 500→Silver, 1500→Gold, 3000→Platinum on purchases; Platinum→Gold on large redemption.)_

## Delivery Follow-Ups

- [x] Decide whether the static dashboard should remain plain HTML/CSS/JavaScript or be migrated to a full SAPUI5/Fiori application structure. _(Decision: keep plain HTML/CSS/JS — zero-build dependency, works in BAS and BTP static hosting, and CAP exposes full OData v4 for any future Fiori Elements migration. Rationale in doc.md §7.)_
- [x] Add deployment notes for serving the frontend with the CAP app in SAP Business Application Studio and SAP BTP. _(Done: see `docs/DEPLOYMENT.txt` and `HANA_Deployment_Guide.md`.)_
- [x] Add accessibility review items for keyboard navigation, color contrast, form labels, and live status messages. _(Done: see "Accessibility review" section of README.md — labels on all controls, aria-live toast, semantic table, focusable nav.)_
- [x] Add a browser-based smoke test once a renderer/test runner is available in CI. _(Done: `test/browser-smoke.sh` — boots the service, renders in headless Chrome, asserts KPI blocks + seeded data + live badge; `npm run test:smoke`.)_
