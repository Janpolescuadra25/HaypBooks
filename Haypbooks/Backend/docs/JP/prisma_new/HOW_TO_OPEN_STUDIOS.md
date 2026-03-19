# How to Open Prisma Studio & DB Studio

> **Migration applied:** `20260302181133_nav_completeness_lastmile_ux`
> **Database:** `haypbooks_dev` (PostgreSQL @ localhost:5432)
> **Schema:** `C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend\prisma\schema.prisma`

---

## 1. Prisma Studio

Prisma Studio is a built-in visual editor that lets you browse and edit every table in your database directly from a browser tab.

### Open it

```powershell
# 1. Navigate to the backend folder
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend

# 2. Launch Prisma Studio
npx prisma studio
```

Prisma Studio automatically opens at:

```
http://localhost:5555
```

> **Tip:** If port 5555 is already in use, specify another port:
> ```powershell
> npx prisma studio --port 5556
> ```

### What you can do in Prisma Studio

| Action | How |
|--------|-----|
| Browse any table | Click a model name in the left sidebar |
| Filter rows | Use the "Add filter" button above the table |
| Edit a row | Click a cell — it becomes editable inline |
| Add a row | Click the **+ Add record** button |
| Delete a row | Tick the checkbox next to a row → **Delete** |
| Explore relations | Click on a related record link to navigate |

### Stop Prisma Studio

Press `Ctrl + C` in the terminal where it is running.

---

## 2. DB Studio (Drizzle / External)

If you are using **DB Studio** (the web-based SQL explorer bundled with tools like Drizzle ORM, or a standalone tool), follow these steps.

### Option A — Using Drizzle Kit Studio

```powershell
# From the backend folder
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend

# Launch Drizzle DB Studio (if drizzle-kit is installed)
# you can override the port if 4000 is already taken by the backend
$env:PORT=5000; npx drizzle-kit studio
```

Opens at (defaults to 5000):

```
https://local.drizzle.studio  # same hostname; port is controlled via PORT env
```

### Option B — Using a standalone DB GUI (e.g., TablePlus, DBeaver, pgAdmin)

Use these connection settings to connect any GUI client:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `haypbooks_dev` |
| Username | *(from your `.env` → `DATABASE_URL`)* |
| Password | *(from your `.env` → `DATABASE_URL`)* |
| SSL | Disabled (local dev) |

### Reading the connection string from `.env`

```powershell
# Print DATABASE_URL
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
Get-Content .env | Select-String 'DATABASE_URL'
```

The string format is:

```
postgresql://USERNAME:PASSWORD@localhost:5432/haypbooks_dev
```

---

## 3. Quick Reference — All Commands

```powershell
# ── From the Backend folder ──────────────────────────────────────────

# Validate schema (no DB required)
npx prisma validate

# Format schema
npx prisma format

# Create & apply a new migration
npx prisma migrate dev --name "your_migration_name"

# Apply pending migrations WITHOUT creating a new one (CI / reset)
npx prisma migrate deploy

# Reset DB and re-apply all migrations (⚠ deletes all data)
npx prisma migrate reset

# Open Prisma Studio (browser UI)
npx prisma studio

# Regenerate Prisma Client after schema change
npx prisma generate

# Introspect an existing DB into schema.prisma
npx prisma db pull

# Push schema changes directly WITHOUT creating a migration file
npx prisma db push
```

---

## 4. Latest Migration Contents

The most recent migration added the following tables:

| New Table | Purpose |
|-----------|---------|
| `SalesOrder` / `SalesOrderLine` | Order-to-Cash workflow |
| `CustomerGroup` | Customer segmentation |
| `PurchaseRequest` / `PurchaseRequestLine` | Internal procurement approvals |
| `BinLocation` | Warehouse shelf/aisle granularity |
| `StockCount` / `StockCountLine` | Physical / Cycle count sessions |
| `UnitOfMeasure` | Box, Kg, Pcs, etc. |
| `JobPosition` / `JobApplication` | HR recruiting pipeline |
| `Engagement` | Practice Hub annual work container |
| `CommunicationLog` | Client call / email / meeting log |
| `TimerSession` | Live start-stop timer |
| `ResourceAllocation` | Project hours planning per person |
| `UserShortcut` | Sidebar quick-access shortcuts |
| `Notification` | In-app bell alert items |
| `DataImportJob` | CSV / bulk import progress tracking |
| `CustomFieldDefinition` | User-defined extra fields per entity |

Migration file location:

```
Haypbooks\Backend\prisma\migrations\20260302181133_nav_completeness_lastmile_ux\migration.sql
```
