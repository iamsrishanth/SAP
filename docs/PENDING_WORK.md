# Pending Work and Follow-Up Checklist

This checklist captures the items that still need attention after the frontend completion work for the Retail Loyalty & Rewards CAP project.

## Environment and Review Follow-Ups

- [ ] Install a browser renderer such as Chromium, Chrome, Firefox, Playwright, Puppeteer, or `wkhtmltoimage` in the development/review environment.
- [ ] Capture true browser-rendered desktop and mobile screenshots of `app/loyalty/webapp/index.html` after the renderer is available.
- [ ] Attach the screenshots to the pull request or project documentation for visual review.
- [ ] Confirm whether generated screenshots should be committed to the repository or kept as PR artifacts only.

## Frontend Validation

- [ ] Run the frontend against a live CAP service with `npm run watch` or `cds watch`.
- [ ] Verify live OData reads for `Customers`, `Transactions`, `Redemptions`, and `RewardPolicies`.
- [ ] Verify the `recordPurchase` quick action from the dashboard updates the transaction list, KPI totals, customer balance, and tier.
- [ ] Verify the `redeemPoints` quick action updates the redemption list, KPI totals, customer balance, and tier.
- [ ] Confirm error toasts display for invalid purchase amounts, invalid redemption amounts, missing customers, and insufficient loyalty points.
- [ ] Confirm the dashboard layout remains usable at desktop, tablet, and mobile widths.

## Backend and Data Follow-Ups

- [ ] Add seed data for customers, transactions, redemptions, and reward policies so the live service has realistic demo content immediately after startup.
- [ ] Confirm the exposed OData projection includes the customer foreign key fields used by the frontend activity lists.
- [ ] Add automated tests for the `recordPurchase` action, including online/store point calculations.
- [ ] Add automated tests for the `redeemPoints` action, including insufficient-balance validation.
- [ ] Add automated tests for tier recalculation after purchases and redemptions.

## Delivery Follow-Ups

- [ ] Decide whether the static dashboard should remain plain HTML/CSS/JavaScript or be migrated to a full SAPUI5/Fiori application structure.
- [ ] Add deployment notes for serving the frontend with the CAP app in SAP Business Application Studio and SAP BTP.
- [ ] Add accessibility review items for keyboard navigation, color contrast, form labels, and live status messages.
- [ ] Add a browser-based smoke test once a renderer/test runner is available in CI.
