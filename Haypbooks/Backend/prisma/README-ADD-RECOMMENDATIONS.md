Summary of schema additions (per Grok AI recommendations)

What I added to `prisma/schema.prisma`:

1) Revenue recognition
- enum: `RevenueRecognitionPhaseStatus` (PENDING, POSTED, CANCELLED)
- model: `RevenueRecognitionPhase`
  - Linked to `RevenueRecognitionSchedule`
  - Tracks: phase number, percentage, amount, recognition date, status, optional `journalEntryId`
  - Indexes for schedule, journal entry, workspace
  - The existing `RevenueRecognitionSchedule` gains `phases` relation to normalize the `schedule` JSON

2) Standard costing & variance
- enum: `VarianceType` (PURCHASE_PRICE, LABOR, MATERIAL, OTHER)
- model: `StandardCostVersion` (item scoped, effective date, standard cost, notes)
- model: `VarianceJournal` (tracks variance amounts and optional linked `journalEntryId`)

3) Landed cost support
- enums: `LandedCostStatus`, `LandedCostLineType`
- models: `LandedCost`, `LandedCostLine`
  - Links landed cost lines (freight/duties/etc) to inventory cost layers and purchase orders

Why this approach
- Minimally invasive and backward compatible: adds normalized tables while leaving existing columns/flows intact.
- Enables workers to post phased recognition entries and variance posting logic without changing invoice/billing flows immediately.
- Supports accurate inventory valuation for importers by allocating landed costs to cost layers.

Recommended next steps (what I can do next)
1) Create a DB migration to add the new tables and enums (preferably via `prisma migrate dev` when your local Prisma toolchain supports it).
2) Implement a scheduled worker/service:
   - `rev-rec` worker that runs daily and posts `RevenueRecognitionPhase` entries whose `recognitionDate` <= now and status = PENDING. The worker should create a `JournalEntry` and store its id on the phase, and update `recognizedToDate` on the parent schedule.
   - `variance` hooks that create `VarianceJournal` entries on receipts/production runs and optionally auto-post JEs for routine variance types.
   - `landed-cost/allocation` service that allocates `LandedCostLine` amounts proportionally to `InventoryCostLayer.unitCost` and adjusts layers accordingly.
3) Add automated tests:
   - Unit tests for allocation, phase posting, variance calculations
   - An E2E migration/backfill test to safely convert any existing `schedule` JSON data into `RevenueRecognitionPhase` rows (if you want normalize existing schedules)
4) Add a small API surface if you'd like to view/manage phases: endpoints for listing phases by schedule and manual posting/reversal.

Notes on local `prisma` commands
- `npx prisma format`/`validate` might fail because your repo is using a Prisma version/config where `datasource.url` usage is flagged by the current CLI (see output when I ran commands). Please run `npx prisma format --schema prisma/schema.prisma` and `npx prisma validate` from the `Backend` folder in your environment and let me know if you'd like me to adjust the approach for migration files.

If you want, I can now:
- Create the SQL migration files under `prisma/migrations/` matching your repo style and include RLS policies (I can follow existing migration patterns), or
- Implement the rev-rec worker and unit tests (recommended next for revenue recognition), or
- Produce an automated script to backfill existing `RevenueRecognitionSchedule.schedule` JSON into `RevenueRecognitionPhase` rows.

Which of those would you like me to do next? I'm happy to implement the migration + worker + tests in sequence. 🚀