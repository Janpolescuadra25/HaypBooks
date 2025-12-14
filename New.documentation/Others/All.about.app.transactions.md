App Transactions in HaypBooks provides a single place to connect external sales and payment channels and automatically import activity into your books. The goal is to minimize manual entry by syncing transactions from platforms where you sell or receive payments. Below is a high‑level overview of common connectors and the data they are expected to bring in.

1. **Amazon Business Purchases**

   - Import expense transactions for business purchases from Amazon Business.
   - Map vendor, category, tax, and memo where available; support receipt links when provided.

2. **eBay Connector**

   - Import sales and related fees from eBay.
   - Map items, shipping, marketplace fees, taxes; support order‑level payouts.

3. **Shopify Connector**

   - Sync orders, refunds, fees, and payouts from Shopify.
   - Support order → invoice/sales‑receipt mapping; capture taxes, discounts, shipping.

4. **PayPal Connector**

   - Import PayPal transactions (payments, refunds, fees, transfers).
   - Classify by type; map counterparties; preserve transaction and reference IDs for audit.

5. **Squarespace Connector**

   - Import online store sales and refunds from Squarespace.
   - Handle gift cards and discounts where available.

6. **Square Connector**

   - Bring in POS payments, tips, refunds, fees, and bank deposits from Square.
   - Group payouts and reconcile deposit batches to the bank feed.

Connector UX

- A "Connect app" action starts OAuth or API key setup and selects the target HaypBooks company.
- Each connection shows status (Connected, Syncing, Needs attention) and last sync time.
- Per‑connector settings include start date, default accounts, tax handling, and SKU/category mapping.
- Syncs are incremental and idempotent. Re‑sync safely skips duplicates by source ID.

Posting model

- JSON‑first: raw payloads are stored for audit; normalization derives the accounting entries.
- CSV export is available for each sync batch; filenames are tokenized (e.g., {company}_{source}_{yyyymmdd}_{csvVersion}).
- Errors surface with row‑level details and a retry option; partial successes keep checkpointing.

Current capabilities (mock)

- Connectors list with status, last sync, and manual Sync.
- Staging table of postings by connector.
- Posting actions:
   - Preview shows derived DR/CR lines and indicates when the date will be adjusted to the next open period.
   - Post generates journals using simple mappings and records audit events.
   - Ignore marks a posting as non-posting with audit.
- Closed‑period guard: posting dates in a closed period are automatically normalized to the next open day.

RBAC (mock)

- Viewing connectors and postings, and running Preview requires the reports:read permission.
- Triggering Sync, Post, or Ignore requires the journal:write permission.
- When permissions are missing, actions are disabled in the UI and the server returns 403.

Mock GL mappings used for posting

- Sale (positive): DR 1010 Undeposited Funds, CR 4000 Sales Revenue
- Fee (any sign): DR 6050 Bank Service Charges, CR 1010 Undeposited Funds
- Payout: if positive, DR 1000 Cash, CR 1010 Undeposited Funds; if negative, reverse
- Time/Expense: if positive, DR 6000 Operating Expenses, CR 1000 Cash; if negative, reverse

Reconciliation

- Payouts flow to bank deposits and tie out to the bank feed.
- Fees are posted to expense accounts with source metadata for audit.

Notes

- This document describes the intended behavior for the App Transactions module in HaypBooks.
- Platform names above are used only to specify connector targets; no external brand language is used elsewhere in HaypBooks.

## Strategy alignment — how HaypBooks surfaces “App transactions”

HaypBooks follows a connector model that brings external activity into a review staging area before posting. At a high level:

1. Connector registration
   - Each connector defines its data domains (e.g., sales, refunds, fees, payouts) and the identity keys used for idempotency.
   - Credentials are collected via OAuth or API keys and are scoped to a single HaypBooks company.

2. First connection → App transactions surface
   - As soon as a connector is configured and the first sync is initiated, the App transactions area shows the connector with status and last sync time.
   - Sub‑tabs reflect the data types a connector provides (e.g., Sales, Expenses/Fees, Payouts).

3. Staging and review
   - Incoming payloads are stored JSON‑first. Normalization derives candidate accounting entries without mutating the ledger.
   - Users can review, map (items/categories/taxes/counterparties), and choose actions (Post, Ignore).

4. Posting and reconciliation
   - Orders post to invoices or sales receipts; fees post to expense accounts with source metadata; payouts aggregate to deposits that reconcile against the bank feed.
   - In the mock implementation, journals are posted directly with the mappings above; batch deposits and invoice/receipt surfaces are future work.

5. Operations and audit
   - Syncs are incremental and idempotent using source IDs and/or time windows with checkpoints.
   - CSV exports are built from JSON detail with a version token; filenames are tokenized for automation.
   - All actions (sync, map, post, ignore) leave audit events.

### Developer perspective (for HaypBooks connectors)

- Define connector schema: source identity, data domains, and minimal required fields per domain.
- Implement credential flow (OAuth/API key) and a sync runner that maintains cursors/checkpoints.
- Persist raw payloads; build a normalization layer that produces deterministic candidate journals.
- Provide mapping catalogs (items/SKUs, categories, taxes, counterparties) with idempotent upsert.
- Expose CSV exports sourced strictly from JSON detail; include CSV‑Version and filename tokens.
- Enforce RBAC and closed‑period guards for posting and voiding.


