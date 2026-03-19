all section of tab with a super deatiled per page.. 		
# Haypbooks v2 — Complete Page Specifications		
		
Super detailed reference document for developers. Each page includes: layout, buttons, tables, filters, modals, and accounting effects.		
		
---		
		
# 🏠 HOME		
		
## Dashboard		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏠 Dashboard                                    [Customize] [Full Screen]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                             │		
│  👋 Good morning, John!                                    December 16, 2024 │		
│                                                                             │		
│  📊 KEY METRICS (Row 1)                                                     │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Cash Balance│ AR          │ AP          │ Net Income   │                │		
│  │ $145,230    │ $45,890     │ $28,450     │ $89,340      │                │		
│  │ ↑ 5% vs LM  │ ↓ 3% vs LM  │ ↑ 8% vs LM  │ ↑ 12% vs LM  │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                             │		
│  📈 CHARTS (Row 2)                                                          │		
│  ┌─────────────────────────────────┬─────────────────────────────────┐     │		
│  │ 💰 Cash Flow (Last 30 Days)     │ 📊 Revenue vs Expenses          │     │		
│  │                                 │                                 │     │		
│  │ [Line chart showing daily       │ [Bar chart comparing monthly    │     │		
│  │  cash in/out]                   │  revenue and expenses]          │     │		
│  │                                 │                                 │     │		
│  └─────────────────────────────────┴─────────────────────────────────┘     │		
│                                                                             │		
│  📋 ACTION ITEMS (Row 3)                                                    │		
│  ┌─────────────────────────────────┬─────────────────────────────────┐     │		
│  │ ⚠️ Needs Attention              │ 📅 Upcoming                     │     │		
│  │                                 │                                 │     │		
│  │ • 8 overdue invoices ($12,340)  │ • 3 bills due tomorrow          │     │		
│  │ • 5 unreconciled transactions   │ • Payroll due Friday            │     │		
│  │ • 2 bank sync errors            │ • Tax filing due Dec 20         │     │		
│  │                                 │                                 │     │		
│  │ [View All →]                    │ [View Calendar →]               │     │		
│  └─────────────────────────────────┴─────────────────────────────────┘     │		
│                                                                             │		
│  📊 WIDGETS (Row 4 - Customizable)                                          │		
│  ┌─────────────────────────────────┬─────────────────────────────────┐     │		
│  │ 🏆 Top Customers (This Month)   │ 📦 Low Stock Alerts             │     │		
│  │                                 │                                 │     │		
│  │ 1. Acme Corp - $15,000          │ • Widget A (5 units)            │     │		
│  │ 2. XYZ Ltd - $12,500            │ • Product B (12 units)          │     │		
│  │ 3. Smith Co - $8,900            │ • Item C (8 units)              │     │		
│  │                                 │                                 │     │		
│  │ [View All →]                    │ [View All →]                    │     │		
│  └─────────────────────────────────┴─────────────────────────────────┘     │		
│                                                                             │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Header Elements		
| Element | Type | Description |		
|---------|------|-------------|		
| Page Title | Text | "Dashboard" |		
| Customize Button | Button | Opens widget customization modal |		
| Full Screen Button | Button | Toggles full-screen dashboard mode |		
| Greeting | Text | Dynamic greeting based on time of day |		
| Date | Text | Current date |		
		
### Key Metrics Cards		
| Metric | Calculation | Click Action |		
|--------|-------------|--------------|		
| Cash Balance | Sum of all bank account balances | Opens Banking → Bank Accounts |		
| AR (Accounts Receivable) | Sum of unpaid invoices | Opens Sales → Collections |		
| AP (Accounts Payable) | Sum of unpaid bills | Opens Expenses → Bills |		
| Net Income | Revenue - Expenses (YTD) | Opens Reports → Profit & Loss |		
		
### Action Buttons		
| Button | Location | Action |		
|--------|----------|--------|		
| [+ Create Invoice] | Quick Actions widget | Opens Invoice creation modal |		
| [+ Record Expense] | Quick Actions widget | Opens Expense creation modal |		
| [+ Add Bill] | Quick Actions widget | Opens Bill creation modal |		
| [View All →] | Each widget | Navigates to detailed page |		
| [Customize] | Header | Opens widget arrangement modal |		
		
### Widgets (Customizable)		
| Widget | Description | Default Position |		
|--------|-------------|------------------|		
| Key Metrics | Cash, AR, AP, Net Income | Row 1 |		
| Cash Flow Chart | Line chart of daily cash | Row 2 |		
| Revenue vs Expenses | Bar chart comparison | Row 2 |		
| Needs Attention | Alerts and warnings | Row 3 |		
| Upcoming | Calendar events, deadlines | Row 3 |		
| Top Customers | Revenue by customer | Row 4 |		
| Low Stock Alerts | Inventory warnings | Row 4 |		
| Recent Transactions | Last 10 transactions | Row 4 (optional) |		
| Project Status | Active project summary | Row 4 (optional) |		
		
### Customize Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Customize Dashboard                                     [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Drag widgets to rearrange:                                    │		
│                                                                 │		
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│		
│  │ Key Metrics     │  │ Cash Flow Chart │  │ Revenue Chart   ││		
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│		
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│		
│  │ Needs Attention │  │ Upcoming        │  │ Top Customers   ││		
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│		
│                                                                 │		
│  Available Widgets:                                            │		
│  ☑ Low Stock Alerts    ☑ Recent Transactions    ☐ Project Status│		
│  ☐ Team Activity       ☐ Sales Pipeline         ☐ Expense Trends│		
│                                                                 │		
│                                    [Reset Default] [Save Changes]│		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## All Transactions		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 All Transactions                                                         │		
│                                                                              │		
│  [+ New Transaction] [Export ▼] [Refresh]                                    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTERS                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search transactions...                                           │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Date Range: Dec 1 - Dec 16 ▼] [Type: All ▼] [Account: All ▼]      │   │		
│  │ [Status: All ▼] [Amount: All ▼] [Category: All ▼] [Tag: All ▼]    │   │		
│  │ [Customer/Vendor: All ▼] [More Filters ▼]        [Clear All]       │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total Count │ Money In    │ Money Out   │ Net         │                │		
│  │ 1,847       │ $342,890    │ -$198,450   │ $144,440    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TRANSACTION TABLE                                                        │		
│  ┌────┬────────┬──────────┬─────────────┬─────────┬─────────┬────────┬───┐│		
│  │ ☑  │ Type   │ Date     │ Description │ Account │ Category│ Amount │...││		
│  ├────┼────────┼──────────┼─────────────┼─────────┼─────────┼────────┼───┤│		
│  │ ☐  │ Invoice│ Dec 15   │ #1042 - Acme│ AR      │ Income  │$2,500  │ ⋮ ││		
│  │ ☐  │ Expense│ Dec 15   │ Office Depo │ Checking│ Rent    │-$1,200 │ ⋮ ││		
│  │ ☐  │ Bill   │ Dec 14   │ ABC Supply  │ AP      │ Supplies│-$850   │ ⋮ ││		
│  │ ☐  │ Payment│ Dec 14   │ Acme Corp   │ Checking│ AR      │$2,500  │ ⋮ ││		
│  │ ☐  │ Transfer│ Dec 13  │ To Savings  │ Checking│ Transfer│-$5,000 │ ⋮ ││		
│  └────┴────────┴──────────┴─────────────┴─────────┴─────────┴────────┴───┘│		
│                                                                              │		
│  📄 Showing 1-50 of 1,847 transactions                     [< Prev] [Next >]│		
│                                                                              │		
│  🎯 BULK ACTIONS (appears when items selected)                              │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 3 selected                                     [Edit] [Export] [Delete]│   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Header Buttons		
| Button | Action |		
|--------|--------|		
| [+ New Transaction] | Opens dropdown to create any transaction type |		
| [Export ▼] | Export to CSV, Excel, PDF |		
| [Refresh] | Reload transaction list |		
		
### Filter Options		
| Filter | Options | Description |		
|--------|---------|-------------|		
| Date Range | Today, This Week, This Month, This Quarter, This Year, Custom | Filter by transaction date |		
| Type | All, Invoice, Bill, Expense, Payment, Transfer, Journal, Credit Memo, Refund, Deposit, Check | Filter by transaction type |		
| Account | All, or specific account | Filter by GL account |		
| Status | All, Pending, Completed, Reconciled, Voided, Draft | Filter by status |		
| Amount | All, Ranges ($0-100, $100-500, etc.), Custom | Filter by amount |		
| Category | All, or specific category | Filter by income/expense category |		
| Tag | All, or specific tags | Filter by tags |		
| Customer/Vendor | All, or specific payee | Filter by customer or vendor |		
		
### Transaction Table Columns		
| Column | Description | Sortable |		
|--------|-------------|----------|		
| ☑ | Checkbox for selection | No |		
| Type | Transaction type icon and name | Yes |		
| Date | Transaction date | Yes |		
| Number | Transaction number (Invoice #, Bill #, etc.) | Yes |		
| Description | Transaction description or payee | No |		
| Account | GL account affected | Yes |		
| Category | Income/expense category | Yes |		
| Customer/Vendor | Related party | Yes |		
| Amount | Transaction amount | Yes |		
| Balance | Running balance (optional) | No |		
| Status | Transaction status | Yes |		
| Actions | View, Edit, Duplicate, Void, Delete | No |		
		
### Transaction Types & Icons		
| Type | Icon | Color |		
|------|------|-------|		
| Invoice | 📄 | Blue |		
| Bill | 🧾 | Orange |		
| Expense | 💳 | Red |		
| Payment Received | 💰 | Green |		
| Payment Made | 💸 | Red |		
| Transfer | 🔄 | Gray |		
| Journal Entry | 📝 | Purple |		
| Credit Memo | 📜 | Yellow |		
| Refund | 💵 | Red |		
| Deposit | 🏦 | Green |		
| Check | ✅ | Blue |		
| Sales Receipt | 🧾 | Green |		
		
### Row Actions Menu (⋮)		
| Action | Description |		
|--------|-------------|		
| View | Open transaction detail |		
| Edit | Modify transaction |		
| Duplicate | Create copy of transaction |		
| Print | Print transaction |		
| Send | Email to customer/vendor |		
| Void | Void transaction (keeps record) |		
| Delete | Delete transaction (audit logged) |		
		
### Accounting Effects		
| Transaction Type | Debit Account | Credit Account |		
|-----------------|---------------|----------------|		
| Invoice | Accounts Receivable | Sales Revenue |		
| Bill | Expense Account | Accounts Payable |		
| Expense | Expense Account | Bank Account |		
| Payment Received | Bank Account | Accounts Receivable |		
| Payment Made | Accounts Payable | Bank Account |		
| Transfer (From) | Destination Account | Source Account |		
| Journal Entry | Specified Accounts | Specified Accounts |		
		
---		
		
## Tasks		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  ✅ Tasks                                               [+ New Task]         │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 VIEWS                                                                    │		
│  [List View] [Board View] [Calendar View]                                    │		
│                                                                              │		
│  🔍 FILTERS                                                                  │		
│  [Status: All ▼] [Assignee: All ▼] [Due: All ▼] [Priority: All ▼]          │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ To Do (12)  │ In Progress │ Completed   │ Overdue (3) │                │		
│  │             │ (5)         │ (89)        │             │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TASK LIST                                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ ☐ Review bank reconciliation               Due: Today    🔴 High       ││		
│  │    Assigned: John Smith  |  Related: Bank Account ***1234              ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ Follow up on overdue invoice #1042       Due: Today    🟡 Medium     ││		
│  │    Assigned: Sarah Jones |  Related: Invoice #1042 - Acme Corp          ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ Process payroll for December             Due: Dec 20   🟡 Medium     ││		
│  │    Assigned: John Smith  |  Related: Payroll                             ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☑ Prepare 1099 forms                       Due: Dec 31   🟢 Low        ││		
│  │    Assigned: Sarah Jones |  Related: Year-End Prep        ✓ Completed  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Task Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  New Task                                                 [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Task Title *                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Enter task title...                                     │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Description                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Add details or instructions...                          │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Due Date                    Priority                          │		
│  ┌─────────────────┐        ┌─────────────────┐               │		
│  │ Dec 20, 2024 📅 │        │ Medium        ▼ │               │		
│  └─────────────────┘        └─────────────────┘               │		
│                                                                 │		
│  Assigned To                 Related To                        │		
│  ┌─────────────────┐        ┌─────────────────┐               │		
│  │ John Smith    ▼ │        │ Select...     ▼ │               │		
│  └─────────────────┘        └─────────────────┘               │		
│                                                                 │		
│  Reminders                                                      │		
│  ☑ Email me 1 day before due                                   │		
│  ☑ Email me on due date                                        │		
│                                                                 │		
│                                    [Cancel]  [Create Task]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Task Actions		
| Button | Action |		
|--------|--------|		
| [+ New Task] | Opens new task modal |		
| [Complete] | Mark task as done |		
| [Edit] | Modify task details |		
| [Delete] | Remove task |		
| [Reassign] | Change assignee |		
		
---		
		
## Notifications		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔔 Notifications                               [Mark All Read] [Settings]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 FILTERS                                                                  │		
│  [All] [Unread (23)] [Payments] [Bills] [System] [Tasks]                    │		
│                                                                              │		
│  📋 NOTIFICATION LIST                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ 💰 Payment Received                                        2 hours ago   ││		
│  │    Acme Corp paid Invoice #1042 - $2,500                                ││		
│  │    [View Invoice] [Send Thank You]                          🔵 Unread    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ⚠️ Overdue Invoice                                         5 hours ago   ││		
│  │    Invoice #1040 from XYZ Ltd is 5 days overdue ($1,200)               ││		
│  │    [View Invoice] [Send Reminder]                           🔵 Unread    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 🏦 Bank Sync Error                                         1 day ago     ││		
│  │    Unable to sync with Bank of America ***4521                          ││		
│  │    [Fix Now] [Dismiss]                                      🔵 Unread    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ✅ Reconciliation Complete                                 1 day ago     ││		
│  │    Operating Account ***1234 reconciled for November                     ││		
│  │    [View Report]                                            ⚪ Read     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 📅 Upcoming Bill Due                                       2 days ago   ││		
│  │    Bill #B-89 to ABC Supply is due tomorrow ($850)                      ││		
│  │    [View Bill] [Pay Now]                                    ⚪ Read     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 Showing 1-20 of 47 notifications                        [< Prev] [Next >]│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Notification Types		
| Type | Icon | Description |		
|------|------|-------------|		
| Payment Received | 💰 | Customer payment received |		
| Invoice Overdue | ⚠️ | Invoice past due date |		
| Bill Due | 📅 | Bill payment upcoming |		
| Bank Sync Error | 🏦 | Bank connection issue |		
| Reconciliation | ✅ | Reconciliation status |		
| Task Reminder | ✅ | Task due soon |		
| System Update | 🔧 | System maintenance/updates |		
| Approval Required | 📝 | Awaiting your approval |		
| Document Received | 📎 | Document uploaded |		
		
### Notification Actions		
| Button | Action |		
|--------|--------|		
| [View] | Navigate to related item |		
| [Dismiss] | Remove notification |		
| [Mark as Read] | Mark as read |		
| [Take Action] | Perform related action |		
		
---		
		
## Business Health		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💓 Business Health                                     [Export Report]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 OVERALL HEALTH SCORE                                                     │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │                                                                      │   │		
│  │                    ╭──────────────╮                                 │   │		
│  │                   ╱                ╲                                │   │		
│  │                  │     85/100      │                                │   │		
│  │                  │   ★★★★☆        │                                │   │		
│  │                   ╲                ╱                                │   │		
│  │                    ╰──────────────╯                                 │   │		
│  │                                                                      │   │		
│  │                      HEALTHY                                        │   │		
│  │                                                                      │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📈 HEALTH METRICS                                                           │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                       │ │		
│  │  💰 CASH FLOW HEALTH                          📊 Score: 92/100        │ │		
│  │  ████████████████████████████████████████░░░░ Excellent              │ │		
│  │  • Cash reserves: 4.2 months of expenses                             │ │		
│  │  • Cash flow trend: Improving (+15% vs last quarter)                 │ │		
│  │                                                                       │ │		
│  │  📥 RECEIVABLES HEALTH                        📊 Score: 78/100        │ │		
│  │  ████████████████████████████████████░░░░░░░░ Good                   │ │		
│  │  • Days Sales Outstanding: 32 days (Target: 30)                      │ │		
│  │  • Overdue AR: $12,340 (8% of total AR)                              │ │		
│  │                                                                       │ │		
│  │  📤 PAYABLES HEALTH                           📊 Score: 88/100        │ │		
│  │  ██████████████████████████████████████████░░ Excellent              │ │		
│  │  • Days Payable Outstanding: 28 days                                 │ │		
│  │  • No overdue bills in the last 30 days                              │ │		
│  │                                                                       │ │		
│  │  📈 PROFITABILITY                             📊 Score: 82/100        │ │		
│  │  ███████████████████████████████████████░░░░░ Good                   │ │		
│  │  • Gross Margin: 45%                                                 │ │		
│  │  • Net Margin: 18%                                                   │ │		
│  │  • Trend: Improving (+3% vs last quarter)                            │ │		
│  │                                                                       │ │		
│  │  📦 INVENTORY HEALTH                          📊 Score: 75/100        │ │		
│  │  ██████████████████████████████████░░░░░░░░░░ Good                   │ │		
│  │  • Inventory Turnover: 8x per year                                   │ │		
│  │  • Low Stock Items: 5 products                                       │ │		
│  │                                                                       │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ⚠️ ATTENTION AREAS                                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ • 8 overdue invoices totaling $12,340                    [Take Action] │ │		
│  │ • Cash runway projected to decline in 60 days             [View Plan] │ │		
│  │ • 3 vendors with upcoming payment due dates            [View Bills]  │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Health Metrics Explained		
| Metric | Calculation | Score Weight |		
|--------|-------------|--------------|		
| Cash Flow Health | Cash reserves / Monthly expenses | 25% |		
| Receivables Health | DSO, Overdue %, Collection rate | 20% |		
| Payables Health | DPO, On-time payment % | 20% |		
| Profitability | Gross margin, Net margin, Trend | 20% |		
| Inventory Health | Turnover, Low stock % (if applicable) | 15% |		
		
### Score Thresholds		
| Score | Rating | Color |		
|-------|--------|-------|		
| 90-100 | Excellent | 🟢 Green |		
| 75-89 | Good | 🟢 Green |		
| 60-74 | Fair | 🟡 Yellow |		
| 40-59 | Needs Attention | 🟠 Orange |		
| 0-39 | Critical | 🔴 Red |		
		
---		
		
## Cash Snapshot		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💵 Cash Snapshot                                       [Refresh] [Export]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 TOTAL CASH POSITION                                                      │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │                                                                      │   │		
│  │           💵 Total Cash: $145,230                                    │   │		
│  │           ↑ $12,450 vs last week                                     │   │		
│  │                                                                      │   │		
│  │    Bank Accounts: $138,730    Cash Accounts: $500    Credit: $6,000 │   │		
│  │                                                                      │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  🏦 BANK ACCOUNTS                                                            │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ Account                    Balance         Status      Last Sync      │ │		
│  ├───────────────────────────────────────────────────────────────────────┤ │		
│  │ Operating Account ***1234  $85,230         ✅ Active   2 hours ago    │ │		
│  │ Savings Account ***5678    $45,000         ✅ Active   1 hour ago     │ │		
│  │ Money Market ***9012       $8,500          ✅ Active   3 hours ago    │ │		
│  │ Credit Card ***3456        -$6,000         ✅ Active   4 hours ago    │ │		
│  │ Petty Cash                  $500           📝 Manual   N/A            │ │		
│  ├───────────────────────────────────────────────────────────────────────┤ │		
│  │ TOTAL                      $145,230                                   │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📈 7-DAY CASH FORECAST                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                      │ │		
│  │  Day        Starting    Inflows    Outflows   Ending                 │ │		
│  │  ─────────────────────────────────────────────────────                │ │		
│  │  Today      $145,230    +$5,000    -$3,200    $147,030               │ │		
│  │  Tomorrow   $147,030    +$2,500    -$8,500    $141,030               │ │		
│  │  Dec 18     $141,030    +$0        -$1,200    $139,830               │ │		
│  │  Dec 19     $139,830    +$15,000   -$4,500    $150,330               │ │		
│  │  Dec 20     $150,330    +$0        -$12,000   $138,330               │ │		
│  │  Dec 21     $138,330    +$8,900    -$2,300    $144,930               │ │		
│  │  Dec 22     $144,930    +$3,500    -$5,000    $143,430               │ │		
│  │                                                                      │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 UPCOMING CASH FLOWS                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ MONEY COMING IN                                                       │ │		
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │		
│  │ │ Invoice #1043 - Acme Corp          $5,000      Due: Today        │  │ │		
│  │ │ Invoice #1044 - XYZ Ltd            $2,500      Due: Tomorrow     │  │ │		
│  │ │ Invoice #1045 - Smith Co           $15,000     Due: Dec 19       │  │ │		
│  │ │ Expected Total: $45,890                         [View All AR →]   │  │ │		
│  │ └─────────────────────────────────────────────────────────────────┘  │ │		
│  │                                                                       │ │		
│  │ MONEY GOING OUT                                                       │ │		
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │		
│  │ │ Bill #B-90 - Office Rent           -$3,200    Due: Today        │  │ │		
│  │ │ Bill #B-91 - Insurance             -$8,500    Due: Tomorrow     │  │ │		
│  │ │ Payroll                            -$12,000   Due: Dec 20       │  │ │		
│  │ │ Expected Total: $28,450                         [View All AP →]   │  │ │		
│  │ └─────────────────────────────────────────────────────────────────┘  │ │		
│  │                                                                       │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Cash Position Components		
| Component | Description |		
|-----------|-------------|		
| Bank Accounts | All checking and savings balances |		
| Cash Accounts | Petty cash, cash on hand |		
| Credit Available | Available credit on lines/credit cards |		
| Incoming | Expected payments from AR |		
| Outgoing | Expected payments for AP |		
		
---		
		
# 🏢 ORGANIZATION *(Enterprise)*		
		
## All Entities		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏢 All Entities                                      [+ Add Entity]          │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 CONSOLIDATED SUMMARY                                                     │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Entities    │ Total AR    │ Total AP    │ Net Income   │                │		
│  │ 3 Active    │ $145,890    │ $89,450     │ $234,560     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 ENTITY LIST                                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Entity Name              Country    Currency    Status    Fiscal Year   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ⭐ Acme Corporation       USA        USD         Active    Jan - Dec    ││		
│  │    Primary Entity                        Revenue: $500K  [View] [Edit]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 🏢 Acme UK Ltd           UK         GBP         Active    Apr - Mar    ││		
│  │    Subsidiary                            Revenue: £200K  [View] [Edit]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 🏢 Acme GmbH             Germany    EUR         Active    Jan - Dec    ││		
│  │    Subsidiary                            Revenue: €150K  [View] [Edit]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Entity Card Details		
| Field | Description |		
|-------|-------------|		
| Entity Name | Legal name of the company |		
| Country | Country of incorporation |		
| Currency | Functional currency |		
| Status | Active, Inactive |		
| Fiscal Year | Fiscal year end |		
| Tax ID | Company tax identification |		
| Entity Type | Parent, Subsidiary, Branch |		
		
### Add Entity Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add New Entity                                           [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Entity Name *                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Enter legal entity name...                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Entity Type *                Country *                         │		
│  ┌─────────────────────┐     ┌─────────────────────┐          │		
│  │ Subsidiary        ▼ │     │ United States     ▼ │          │		
│  └─────────────────────┘     └─────────────────────┘          │		
│                                                                 │		
│  Currency *                   Fiscal Year End *                 │		
│  ┌─────────────────────┐     ┌─────────────────────┐          │		
│  │ USD               ▼ │     │ December          ▼ │          │		
│  └─────────────────────┘     └─────────────────────┘          │		
│                                                                 │		
│  Tax ID                       Parent Entity                     │		
│  ┌─────────────────────┐     ┌─────────────────────┐          │		
│  │ Enter Tax ID...     │     │ Acme Corporation ▼ │          │		
│  └─────────────────────┘     └─────────────────────┘          │		
│                                                                 │		
│  Address                                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Street Address                                          │   │		
│  │ City, State, ZIP                                        │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Create Entity]    │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Inter-Company Transactions		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔄 Inter-Company Transactions                          [+ New IC Entry]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 FILTERS                                                                  │		
│  [From Entity: All ▼] [To Entity: All ▼] [Type: All ▼] [Date: This Month ▼]│		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┐                               │		
│  │ Total IC    │ Due From    │ Due To      │                               │		
│  │ Transactions│ Entities    │ Entities    │                               │		
│  │ 45          │ $125,000    │ $125,000    │                               │		
│  └─────────────┴─────────────┴─────────────┘                               │		
│                                                                              │		
│  📋 TRANSACTION LIST                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ From Entity    │ To Entity    │ Type    │ Amount    │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ Acme Corp      │ Acme UK      │ Loan    │ $50,000   │ [View]  ││		
│  │ Dec 14 │ Acme GmbH      │ Acme Corp    │ Service │ €15,000   │ [View]  ││		
│  │ Dec 12 │ Acme Corp      │ Acme UK      │ Expense │ $8,500    │ [View]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 INTER-COMPANY BALANCES                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Entity Pair                        Balance         Status              ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Acme Corp ↔ Acme UK               $75,000         Due from UK          ││		
│  │ Acme Corp ↔ Acme GmbH              €25,000         Due to GmbH         ││		
│  │ Acme UK ↔ Acme GmbH                £5,000          Due from UK         ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### IC Transaction Types		
| Type | Description | Accounting |		
|------|-------------|------------|		
| Loan | Inter-company loan | Due From/To Affiliates |		
| Service | Management fee, services | IC Revenue/Expense |		
| Expense | Shared expense allocation | IC Expense Allocation |		
| Transfer | Cash transfer | IC Payable/Receivable |		
| Royalty | IP royalty payment | IC Royalty Expense |		
		
### Accounting Effects		
| Entry | From Entity | To Entity |		
|-------|-------------|-----------|		
| Loan | Debit: Due From Affiliate | Debit: Cash |		
| | Credit: Cash | Credit: Due To Affiliate |		
| Service | Debit: IC Expense | Debit: Cash/AR |		
| | Credit: Due To Affiliate | Credit: IC Revenue |		
		
---		
		
## Consolidation		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📊 Consolidation                                [Run Consolidation]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 CONSOLIDATION SETTINGS                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Period: [December 2024 ▼]                                           │   │		
│  │ Currency: [USD ▼] (Reporting currency)                              │   │		
│  │ Entities: ☑ Acme Corp  ☑ Acme UK  ☑ Acme GmbH                      │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 CONSOLIDATED FINANCIALS                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                        Acme Corp   Acme UK   Acme GmbH  Eliminations   ││		
│  │                         USD        GBP→USD   EUR→USD    (USD)          ││		
│  │ Revenue               $500,000    $250,000   $175,000   ($50,000)      ││		
│  │ Inter-Company Rev      50,000      25,000     15,000   ($90,000)      ││		
│  │ External Revenue      $450,000    $225,000   $160,000       -    $835,000││		
│  │                                                                        ││		
│  │ Expenses              $350,000    $180,000   $120,000   ($40,000)      ││		
│  │ Inter-Company Exp      40,000      20,000     10,000   ($70,000)      ││		
│  │ External Expenses     $310,000    $160,000   $110,000       -  $580,000││		
│  │                                                                        ││		
│  │ Net Income            $140,000     $65,000    $50,000   ($10,000) $245,000││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🔄 ELIMINATION ENTRIES                                                      │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ #    │ Description              │ Debit      │ Credit     │ Status    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ EL-1 │ IC Loan Elimination      │ Due to: $75K│ Due from: $75K│ ✓ Auto ││		
│  │ EL-2 │ IC Revenue/Expense       │ IC Rev: $90K│ IC Exp: $90K  │ ✓ Auto ││		
│  │ EL-3 │ IC Payable/Receivable    │ IC Pay: $125K│ IC Rec: $125K│ ✓ Auto ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 REPORTS                                                                  │		
│  [Consolidated P&L] [Consolidated Balance Sheet] [Elimination Report]       │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Elimination Types		
| Type | Description | Auto/Manual |		
|------|-------------|-------------|		
| IC Receivables/Payables | Offset inter-company balances | Auto |		
| IC Revenue/Expense | Eliminate internal sales | Auto |		
| IC Loans | Eliminate inter-company loans | Auto |		
| Unrealized Profit | Inventory profit in IC sales | Manual |		
| Dividends | IC dividend eliminations | Manual |		
		
---		
		
## Locations & Divisions		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📍 Locations & Divisions                        [+ Add Location]           │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [Locations] [Divisions]                                                     │		
│                                                                              │		
│  📍 LOCATIONS                                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Location Name       Address                    Status    Transactions   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 🏢 Headquarters     123 Main St, New York      Active    1,234         ││		
│  │ 🏭 West Coast       456 Ocean Ave, Los Angeles Active    567           ││		
│  │ 🏬 Midwest          789 Central, Chicago       Active    234           ││		
│  │ 🌐 Remote           N/A                        Active    89            ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 LOCATION PERFORMANCE                                                     │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Location        Revenue      Expenses     Net Income    % of Total     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Headquarters    $350,000     $200,000     $150,000      60%            ││		
│  │ West Coast      $150,000     $100,000     $50,000       20%            ││		
│  │ Midwest         $75,000      $50,000      $25,000       10%            ││		
│  │ Remote          $25,000      $15,000      $10,000       10%            ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Departments		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏢 Departments                                   [+ Add Department]         │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 DEPARTMENT LIST                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Department       Manager        Employees    Budget      Actual        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sales            John Smith     12           $500,000    $485,000      ││		
│  │ Engineering      Sarah Jones    25           $800,000    $780,000      ││		
│  │ Marketing        Mike Brown     8            $300,000    $320,000      ││		
│  │ Operations       Lisa Wang      15           $400,000    $390,000      ││		
│  │ Finance          Tom Davis      5            $200,000    $195,000      ││		
│  │ HR               Amy Chen       3            $150,000    $145,000      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 DEPARTMENT EXPENSES (This Month)                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                                                                          ││		
│  │  Sales        ████████████████████████████████████████  $485,000       ││		
│  │  Engineering  ██████████████████████████████████████████████ $780,000  ││		
│  │  Marketing    ████████████████████  $320,000                            ││		
│  │  Operations   ████████████████████████████  $390,000                    ││		
│  │  Finance      █████████████  $195,000                                   ││		
│  │  HR           ███████████  $145,000                                     ││		
│  │                                                                          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
*(Continuing with all other sections...)*		
		
---		
		
# 🏦 BANKING & TREASURY		
		
## Bank Accounts		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏦 Bank Accounts                               [+ Add Bank Account]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 TOTAL BALANCE                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │                                                                      │   │		
│  │   💵 Total Cash Balance: $145,230                                    │   │		
│  │   Bank Accounts: $144,730  |  Cash Accounts: $500                    │   │		
│  │                                                                      │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  🏦 BANK ACCOUNT CARDS                                                       │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  ┌─────────────────────┐  ┌─────────────────────┐                    │ │		
│  │  │ 🏦 Operating        │  │ 🏦 Savings          │                    │ │		
│  │  │ Bank of America     │  │ Chase Bank          │                    │ │		
│  │  │ ****1234            │  │ ****5678            │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ $85,230.00          │  │ $45,000.00          │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ ✅ Synced 2 hrs ago │  │ ✅ Synced 1 hr ago  │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ [View] [Reconcile]  │  │ [View] [Reconcile]  │                    │ │		
│  │  └─────────────────────┘  └─────────────────────┘                    │ │		
│  │                                                                        │ │		
│  │  ┌─────────────────────┐  ┌─────────────────────┐                    │ │		
│  │  │ 💳 Credit Card      │  │ 💵 Petty Cash       │                    │ │		
│  │  │ Amex ****3456       │  │ Main Office         │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ -$6,000.00          │  │ $500.00             │                    │ │		
│  │  │ Credit Limit: $50K  │  │                     │                    │ │		
│  │  │                     │  │ 📝 Manual tracking  │                    │ │		
│  │  │ ✅ Synced 4 hrs ago │  │                     │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ [View] [Pay Down]   │  │ [View] [Adjust]     │                    │ │		
│  │  └─────────────────────┘  └─────────────────────┘                    │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 RECENT ACTIVITY (All Accounts)                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Account         │ Description        │ Amount     │ Balance   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ Operating       │ Deposit - Acme     │ +$2,500    │ $85,230   ││		
│  │ Dec 15 │ Operating       │ Check #1023        │ -$1,200    │ $82,730   ││		
│  │ Dec 14 │ Savings         │ Transfer In        │ +$5,000    │ $45,000   ││		
│  │ Dec 14 │ Credit Card     │ Shell Oil          │ -$85       │ -$6,000   ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Account Types		
| Type | Icon | Description |		
|------|------|-------------|		
| Checking | 🏦 | Operating checking accounts |		
| Savings | 🏦 | Savings accounts |		
| Money Market | 🏦 | Money market accounts |		
| Credit Card | 💳 | Credit card accounts |		
| Line of Credit | 💳 | Lines of credit |		
| Petty Cash | 💵 | Cash on hand |		
| Trust Account | 🔒 | Client trust accounts |		
		
### Add Bank Account Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Bank Account                                          [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  How would you like to add this account?                        │		
│                                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 🔗 Connect Bank Automatically                           │   │		
│  │    Link your bank for automatic transaction import      │   │		
│  │    [Search Banks...]                                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 📝 Add Manually                                         │   │		
│  │    Enter account details and import transactions later  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Account Name *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., Operating Account                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Account Type *               Currency *                        │		
│  ┌─────────────────────┐     ┌─────────────────────┐          │		
│  │ Checking          ▼ │     │ USD               ▼ │          │		
│  └─────────────────────┘     └─────────────────────┘          │		
│                                                                 │		
│  Opening Balance *             As of Date *                     │		
│  ┌─────────────────────┐     ┌─────────────────────┐          │		
│  │ $ 0.00             │     │ Dec 16, 2024      📅│          │		
│  └─────────────────────┘     └─────────────────────┘          │		
│                                                                 │		
│                                    [Cancel]  [Add Account]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Bank Connection Flow		
```		
Step 1: Search for Bank		
┌─────────────────────────────────────────────────────────────────┐		
│  🔍 Search for your bank...                              [X]    │		
│                                                                 │		
│  Popular Banks:                                                 │		
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │		
│  │ Chase       │ │ Bank of     │ │ Wells       │              │		
│  │             │ │ America     │ │ Fargo       │              │		
│  └─────────────┘ └─────────────┘ └─────────────┘              │		
│                                                                 │		
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │		
│  │ Citi        │ │ US Bank     │ │ PNC         │              │		
│  └─────────────┘ └─────────────┘ └─────────────┘              │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
		
Step 2: Bank Login (Secure Third-Party)		
┌─────────────────────────────────────────────────────────────────┐		
│  🔐 Connect to Bank of America                            [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  This connection is secured by Plaid/Finicity                  │		
│                                                                 │		
│  Username *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │                                                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Password *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ••••••••••••••••••••••••••                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                              [Back]         [Connect]           │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
		
Step 3: Select Accounts		
┌─────────────────────────────────────────────────────────────────┐		
│  Select accounts to connect                              [X]    │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  We found 3 accounts at Bank of America:                       │		
│                                                                 │		
│  ☑ Business Checking ****1234                                  │		
│  │  Type: Checking    Balance: $85,230                        │		
│  │  ┌─────────────────────────────────────────────────────┐   │		
│  │  │ Account Name: [Operating Account                  ] │   │		
│  │  └─────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ☑ Business Savings ****5678                                   │		
│  │  Type: Savings    Balance: $45,000                         │		
│  │  ┌─────────────────────────────────────────────────────┐   │		
│  │  │ Account Name: [Savings Account                    ] │   │		
│  │  └─────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ☐ Business Credit Card ****3456                               │		
│  │  Type: Credit Card    Balance: -$6,000                     │		
│                                                                 │		
│                              [Back]        [Connect Selected]   │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Action | Debit | Credit |		
|--------|-------|--------|		
| Add Account with Opening Balance | Bank Account | Opening Balance Equity |		
| Adjust Balance Up | Bank Account | Gain on Cash |		
| Adjust Balance Down | Loss on Cash | Bank Account |		
		
---		
		
## Bank Feeds → For Review		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏦 Bank Feeds > For Review                            [Refresh] [Import]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🏦 SELECT ACCOUNT                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Operating ***1234 (12)] [Savings ***5678 (3)] [Credit Card (5)]   │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 STATUS                                                                   │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ For Review  │ Matched     │ Added       │ Excluded    │                │		
│  │ 20          │ 45          │ 234         │ 5           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  🤖 AI SUGGESTIONS                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 💡 We found 8 potential matches (confidence > 90%)                  │   │		
│  │ [Accept All Matches]  [Review Individually]                         │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📋 TRANSACTIONS FOR REVIEW                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date  │ Description       │ Amount   │ Suggestion      │ Actions        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ ACME CORP PYMT    │ +$2,500  │ Match Inv #1042 │[Match][Add][Exc]││		
│  │       │                   │          │ 98% confidence  │                ││		
│  │       │                   │          │ ┌──────────────────────────────┐││		
│  │       │                   │          │ │ Potential Match:             │││		
│  │       │                   │          │ │ Invoice #1042 - Acme Corp    │││		
│  │       │                   │          │ │ Amount: $2,500  Date: Dec 14 │││		
│  │       │                   │          │ │ [Confirm Match] [Find Other] │││		
│  │       │                   │          │ └──────────────────────────────┘││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ SHELL OIL 4521    │ -$85.00  │ Expense: Auto   │[Add][Exc][Split]││		
│  │       │                   │          │ AI Category: Auto Expense      ││		
│  │       │                   │          │ ┌──────────────────────────────┐││		
│  │       │                   │          │ │ Add as Expense:              │││		
│  │       │                   │          │ │ Vendor: [Shell Oil        ] │││		
│  │       │                   │          │ │ Category: [Auto Expense ▼  ] │││		
│  │       │                   │          │ │ [Create Rule] [Add]         │││		
│  │       │                   │          │ └──────────────────────────────┘││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14│ TRANSFER TO SAV   │ -$5,000  │ Transfer        │[Match][Add][Exc]││		
│  │       │                   │          │ 100% confidence │                ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14│ OFFICE DEPOT      │ -$234.00 │ Match Bill #B-89│[Match][Add][Exc]││		
│  │       │                   │          │ 95% confidence  │                ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 BULK ACTIONS                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 4 selected          [Batch Match] [Batch Add] [Exclude]             │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Transaction Actions		
| Action | Description | Accounting Effect |		
|--------|-------------|-------------------|		
| **Match** | Link to existing transaction | No new entry (links existing) |		
| **Add** | Create new transaction | Creates new journal entry |		
| **Exclude** | Remove from accounting | No entry (personal/non-business) |		
| **Split** | Divide into multiple categories | Creates split entry |		
		
### Match Transaction Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Match Transaction                                         [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Bank Transaction:                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 15  │ ACME CORP PYMT    │ +$2,500                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  🔍 Search for matching transaction:                            │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Search by customer, invoice #, amount...                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  💡 Potential Matches:                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ○ Invoice #1042 - Acme Corp    $2,500    Dec 14   98%  │   │		
│  │ ○ Invoice #1038 - Acme Corp    $2,500    Nov 28   75%  │   │		
│  │ ○ Payment from Acme Corp       $2,500    Dec 15   90%  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Selected Match:                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Invoice #1042 - Acme Corp                               │   │		
│  │ Date: Dec 14, 2024                                      │   │		
│  │ Amount: $2,500                                          │   │		
│  │ Status: Open → Will be marked as Paid                   │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Confirm Match]    │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Add Transaction Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Transaction                                           [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Bank Transaction:                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 15  │ SHELL OIL 4521    │ -$85.00                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Transaction Type:                                              │		
│  ○ Expense    ○ Income    ○ Transfer                          │		
│                                                                 │		
│  Vendor/Payee *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Shell Oil                              [+ Add New]      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Category *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Auto Expense                                           │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Date *                        Description                      │		
│  ┌─────────────────────┐      ┌─────────────────────────────┐ │		
│  │ Dec 15, 2024      📅│      │ Gas - Company Vehicle       │ │		
│  └─────────────────────┘      └─────────────────────────────┘ │		
│                                                                 │		
│  💳 Billable to Customer                                        │		
│  ☐ Bill to: [Select Customer ▼]                                │		
│                                                                 │		
│  📎 Attachment                                                   │		
│  [Upload Receipt] or drag and drop                              │		
│                                                                 │		
│  🔄 Create Rule for Future                                      │		
│  ☐ When "SHELL OIL" appears, categorize as "Auto Expense"      │		
│                                                                 │		
│                                    [Cancel]  [Add Transaction]   │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects - Add as Expense		
| Account | Debit | Credit |		
|---------|-------|--------|		
| Auto Expense | $85.00 | |		
| Bank Account | | $85.00 |		
		
---		
		
*(This is a very long document. Should I continue with the remaining sections? I can create the complete document as a PDF or Word file for your reference.)*		
		
---		
		
		
		
# Haypbooks v2 — Complete Page Specifications (Continued)		
		
Continuing from Banking & Treasury → Bank Feeds...		
		
---		
		
## Bank Feeds → AI Categorization		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🤖 AI Categorization                                   [Train AI] [Settings] │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 AI PERFORMANCE                                                           │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Accuracy    │ Auto-Cat    │ Time Saved  │ Rules Learned│                │		
│  │ 94%         │ 2,340/mo    │ 45 hrs/mo   │ 287 rules   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 ACCURACY TREND (Last 6 Months)                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  100%├─────────────────────────────────────────────────────────────   │ │		
│  │   95%│        ╭───╮                                                    │ │		
│  │   90%│   ╭────╯   ╰────╮                                              │ │		
│  │   85%│───╯              ╰────                                         │ │		
│  │   80%│                                                                │ │		
│  │      └─────────────────────────────────────────────────────────────   │ │		
│  │        Jul    Aug    Sep    Oct    Nov    Dec                         │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ⚙️ CATEGORIZATION SETTINGS                                                  │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Auto-categorize incoming transactions:                                │ │		
│  │  ┌───────────────────────────────────────────────────────────────┐   │ │		
│  │  │ ● On (Recommended)    ○ Off    ○ Review Mode Only            │   │ │		
│  │  └───────────────────────────────────────────────────────────────┘   │ │		
│  │                                                                        │ │		
│  │  Confidence threshold for auto-accept:                                │ │		
│  │  ┌───────────────────────────────────────────────────────────────┐   │ │		
│  │  │ ████████████████████████████████████░░░░░░░░░░  80%           │   │ │		
│  │  │ Auto-accept if confidence ≥ 80%                                 │   │ │		
│  │  └───────────────────────────────────────────────────────────────┘   │ │		
│  │                                                                        │ │		
│  │  ☑ Email me when low-confidence transactions need review             │ │		
│  │  ☐ Weekly AI performance summary                                      │ │		
│  │                                                                        │ │		
│  │                                              [Save Settings]           │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 PENDING REVIEW (Low Confidence)                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date  │ Description       │ Amount   │ AI Suggestion    │ Confidence   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ UBER *TRIP        │ -$45.00  │ Travel Expense   │ 78% ⚠️      ││		
│  │ Dec 15│ AMZN MKTP         │ -$234.00 │ Office Supplies  │ 72% ⚠️      ││		
│  │ Dec 14│ PAYPAL *TRANSFER  │ +$500.00 │ Income           │ 65% ⚠️      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 QUICK ACTIONS                                                            │		
│  [Accept All High Confidence (8)]  [Review All (3)]  [Train AI with More]  │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### AI Learning Rules Table		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🧠 LEARNED RULES                                      [+ Add Custom Rule]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 Search rules...                                    [Filter: All ▼]       │		
│                                                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Rule                         │ Category         │ Uses │ Conf. │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Contains "UBER"              │ Travel Expense   │ 47   │ 95%   │ [⋮]   ││		
│  │ Contains "AMAZON" OR "AMZN"  │ Office Supplies  │ 89   │ 92%   │ [⋮]   ││		
│  │ Contains "SHELL"             │ Auto Expense     │ 34   │ 97%   │ [⋮]   ││		
│  │ Contains "OFFICE DEPOT"      │ Office Supplies  │ 56   │ 98%   │ [⋮]   ││		
│  │ Amount = $1,200 AND Monthly  │ Rent Expense     │ 12   │ 100%  │ [⋮]   ││		
│  │ Vendor = "Acme Corp"         │ Sales Income     │ 156  │ 99%   │ [⋮]   ││		
│  │ Contains "PAYPAL"            │ Needs Review     │ 23   │ -     │ [⋮]   ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 Showing 1-7 of 287 rules                                 [< Prev] [Next>]│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add Custom Rule Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Categorization Rule                                  [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Rule Name *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., Client Meals Rule                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Conditions (When to apply):                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Transaction [Description ▼] [Contains ▼] [          ]  │   │		
│  │                                        [+ Add Condition]│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Additional Filters (Optional):                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Amount: [☐] [equals ▼] [$     ]                         │   │		
│  │ Bank Account: [☐] [Select Account ▼]                    │   │		
│  │ Day of Month: [☐] [equals ▼] [     ]                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Action (What to do):                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Set Category: [Meals & Entertainment ▼]                 │   │		
│  │ Set Vendor: [Optional ▼]                                │   │		
│  │ Set Customer (if billable): [Optional ▼]                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  🔄 Apply to past transactions:                                 │		
│  ☐ Also apply this rule to past 30 days of transactions        │		
│                                                                 │		
│                                    [Cancel]  [Create Rule]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### AI Categorization Logic		
		
| Trigger | AI Action | Learning Source |		
|---------|-----------|-----------------|		
| New bank transaction | Analyze description | Past user categorizations |		
| Similar description found | Suggest category | Pattern matching |		
| Same vendor | Suggest same category | Vendor history |		
| Same amount + recurring | Suggest recurring category | Amount patterns |		
| Low confidence | Queue for review | Threshold setting |		
		
### Accounting Effects		
| Action | Debit | Credit |		
|--------|-------|--------|		
| Auto-categorize Expense | Expense Account | Bank Account |		
| Auto-categorize Income | Bank Account | Income Account |		
| User correction | Corrects entry | Learns for future |		
		
---		
		
## Bank Feeds → Smart Matching		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔗 Smart Matching                                     [Run Matching]         │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 MATCHING SUMMARY                                                         │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Auto-Matched│ Suggested   │ Unmatched   │ Multiple    │                │		
│  │ 89          │ 12          │ 5           │ 3           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 AUTO-MATCHED (High Confidence)                                           │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Bank Transaction             │ Matched To           │ Confidence       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ ACME CORP $2,500   │ Invoice #1042        │ ✅ 100% [Accept] ││		
│  │ Dec 14 │ TRANSFER $5,000    │ Transfer #TR-123     │ ✅ 100% [Accept] ││		
│  │ Dec 13 │ PAYMENT $1,200     │ Payment #P-89        │ ✅ 98%  [Accept] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 SUGGESTED MATCHES (Needs Review)                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Bank Transaction             │ Potential Matches    │ Actions          ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ OFFICE DEPOT $234   │ ○ Bill #B-89 (95%)   │ [Confirm] [Find] ││		
│  │        │                     │ ○ Bill #B-92 (75%)   │                  ││		
│  │        │                     │ ○ Create New Bill    │                  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14 │ SHELL OIL $85       │ ○ Expense #E-45 (90%)│ [Confirm] [Find] ││		
│  │        │                     │ ○ Create New Expense │                  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 MULTIPLE MATCHES (Ambiguous)                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Bank Transaction             │ Possible Matches                       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 12 │ ACME $5,000         │ ⚠️ Multiple invoices with similar amount││		
│  │        │                     │ ○ Invoice #1038 - $4,800 (Dec 10)       ││		
│  │        │                     │ ○ Invoice #1042 - $5,000 (Dec 14)       ││		
│  │        │                     │ ○ Payment from Acme - $5,000 (Dec 11)   ││		
│  │        │                     │ [Select Match] [Create New]             ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 UNMATCHED TRANSACTIONS                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Bank Transaction             │ Actions                                ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 11 │ MISC PAYMENT $150   │ [Search] [Add as Income] [Exclude]     ││		
│  │ Dec 10 │ ATM WITHDRAWAL $200 │ [Add as Cash Withdrawal] [Transfer]    ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 BULK ACTIONS                                                            │		
│  [Accept All Auto-Matched (89)]  [Export Match Report]                      │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Matching Logic		
| Match Factor | Weight | Description |		
|--------------|--------|-------------|		
| Exact Amount | 40% | Transaction amount matches exactly |		
| Date Proximity | 25% | Within ±7 days of transaction |		
| Payee Match | 25% | Name similarity to customer/vendor |		
| Reference Number | 10% | Check/invoice number in description |		
		
### Match Status Icons		
| Icon | Status | Description |		
|------|--------|-------------|		
| ✅ | Perfect Match | 100% confidence, auto-accepted |		
| 🟢 | High Confidence | 90-99%, one-click accept |		
| 🟡 | Medium Confidence | 70-89%, review recommended |		
| 🟠 | Multiple Matches | Several options available |		
| 🔴 | No Match | No similar transaction found |		
		
### Manual Match Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Manual Match                                              [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Bank Transaction:                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Date: Dec 15, 2024                                      │   │		
│  │ Description: ACME CORP PAYMENT                          │   │		
│  │ Amount: $5,000.00                                       │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  🔍 Search Transactions:                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Type to search invoices, bills, payments...             │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Filter By:                                                     │		
│  [Invoices] [Bills] [Payments] [Transfers] [All]               │		
│                                                                 │		
│  Available Transactions:                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ○ Invoice #1042 - Acme Corp    $5,000   Dec 14  [Match] │   │		
│  │ ○ Invoice #1038 - Acme Corp    $4,800   Dec 10  [Match] │   │		
│  │ ○ Payment - Acme Corp          $5,000   Dec 11  [Match] │   │		
│  │ ○ Credit Memo - Acme Corp      $500     Dec 08  [Match] │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Selected Match:                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Invoice #1042 - Acme Corp                               │   │		
│  │ Amount: $5,000.00 | Status: Open                        │   │		
│  │ After match: Invoice will be marked as PAID             │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Confirm Match]    │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects - Matching		
| Scenario | Effect |		
|----------|--------|		
| Match to Invoice | Invoice marked PAID, creates payment link |		
| Match to Bill | Bill marked PAID, creates payment link |		
| Match to Transfer | Links both sides of transfer |		
| No match - Add as new | Creates new transaction entry |		
		
---		
		
## Bank Feeds → Bank Rules		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 Bank Rules                                         [+ Create Rule]       │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 RULES OVERVIEW                                                           │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Active Rules│ This Month  │ Time Saved  │ Accuracy    │                │		
│  │ 24          │ 234 applied │ 12 hours    │ 98%         │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search rules...        [Bank: All ▼] [Status: Active ▼]         │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📋 RULES LIST                                                               │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ # │ Rule Name          │ Conditions         │ Action          │ Status ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 1 │ Office Rent         │ Amount = $1,200    │ Categorize:     │ ✅ On  ││		
│  │   │                     │ Day = 1-5          │ Rent Expense    │        ││		
│  │   │                     │ Acct = Operating   │ Vendor: ABC Prop│        ││		
│  │   │                     │                    │ [Edit] [Delete] │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 2 │ Uber/Rideshare      │ Desc contains      │ Categorize:     │ ✅ On  ││		
│  │   │                     │ "UBER" OR "LYFT"   │ Travel Expense  │        ││		
│  │   │                     │                    │ [Edit] [Delete] │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 3 │ Amazon Purchases     │ Desc contains      │ Categorize:     │ ✅ On  ││		
│  │   │                     │ "AMAZON" OR "AMZN" │ Office Supplies │        ││		
│  │   │                     │ Amount < $500      │ [Edit] [Delete] │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 4 │ PayPal Income        │ Desc contains      │ Categorize:     │ ⏸️ Off ││		
│  │   │                     │ "PAYPAL"           │ Review Required │        ││		
│  │   │                     │ Amount > $0        │ [Edit] [Delete] │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 5 │ Auto Transfer        │ Desc contains      │ Mark as:        │ ✅ On  ││		
│  │   │                     │ "TRANSFER TO SAV"  │ Transfer to     │        ││		
│  │   │                     │                    │ Savings Acct    │        ││		
│  │   │                     │                    │ [Edit] [Delete] │        ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📤 IMPORT/EXPORT                                                            │		
│  [Export Rules] [Import Rules]                                               │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Create Rule Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Create Bank Rule                                         [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Rule Name *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., Monthly Office Rent                               │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Apply to Bank Account:                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ All Bank Accounts                                     ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  WHEN a transaction matches these conditions:                   │		
│                                                                 │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ [Description ▼] [Contains ▼] [                    ] [X]    ││		
│  │ [+ Add Condition]                                          ││		
│  │                                                            ││		
│  │ Condition Logic:                                           ││		
│  │ ○ Match ALL conditions (AND)                               ││		
│  │ ○ Match ANY condition (OR)                                 ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  Available Conditions:                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ • Description contains / starts with / equals           │   │		
│  │ • Amount equals / greater than / less than / between    │   │		
│  │ • Transaction type (debit/credit)                        │   │		
│  │ • Date is (specific date / day of month / day of week)  │   │		
│  │ • Bank account is                                        │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  THEN do this:                                                  │		
│                                                                 │		
│  Transaction Type:                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Expense                                               ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Category *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Office Rent                                           ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Vendor/Payee:                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ABC Properties                                        ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Tags:                                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Monthly] [Recurring]                                  ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Billable to Customer:                                          │		
│  ☐ Bill to [Select Customer ▼]                                 │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  ☐ Apply this rule to past transactions (last 90 days)         │		
│                                                                 │		
│                                    [Cancel]  [Create Rule]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Condition Types		
| Condition | Operators | Example |		
|-----------|-----------|---------|		
| Description | Contains, Starts with, Ends with, Equals, Doesn't contain | Contains "UBER" |		
| Amount | Equals, Not equal, Greater than, Less than, Between | Between $100-$500 |		
| Transaction Type | Is, Is not | Is Debit |		
| Date | Is, Is not, Before, After | Is 1st of month |		
| Day of Month | Is, Is between | Is 1-5 |		
| Day of Week | Is, Is not | Is Friday |		
| Bank Account | Is, Is not | Is Operating Account |		
		
### Action Types		
| Action | Description |		
|--------|-------------|		
| Categorize | Set category/account |		
| Set Vendor | Assign vendor/payee |		
| Set Customer | Assign for billing |		
| Add Tags | Apply tracking tags |		
| Transfer | Mark as transfer |		
| Exclude | Exclude from books |		
| Split | Split into multiple categories |		
| Review | Flag for manual review |		
		
---		
		
## Reconciliation		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  ✅ Reconciliation                                           [New Reconcile]  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🏦 SELECT ACCOUNT                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Operating ***1234] [Savings ***5678] [Credit Card ***3456]        │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 RECONCILIATION STATUS                                                    │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Last Reconciled│ Statement │ Difference │ Status      │                │		
│  │ Nov 30, 2024   │ Dec 2024  │ $0.00      │ ✅ Ready    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 RECENT RECONCILIATIONS                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Statement Date │ Statement Balance│ Book Balance  │ Difference│ Status ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Nov 30, 2024   │ $82,450.00       │ $82,450.00    │ $0.00     │ ✅ Done││		
│  │ Oct 31, 2024   │ $78,230.00       │ $78,230.00    │ $0.00     │ ✅ Done││		
│  │ Sep 30, 2024   │ $75,890.00       │ $75,890.00    │ $0.00     │ ✅ Done││		
│  │ Aug 31, 2024   │ $72,100.00       │ $72,100.00    │ $0.00     │ ✅ Done││		
│  │ Jul 31, 2024   │ $68,500.00       │ $68,495.00    │ $5.00     │ ⚠️ Diff││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 UNRECONCILED TRANSACTIONS                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ 12 transactions need to be reconciled                    [View All →]   ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Reconciliation Workflow Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Reconcile Account: Operating ***1234                     [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  STEP 1: Enter Statement Information                            │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Statement Date: [Dec 31, 2024 📅]                           ││		
│  │ Statement Ending Balance: [$ 85,230.00    ]                 ││		
│  │                                                             ││		
│  │ Starting Balance: $82,450.00 (from last reconciliation)    ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  STEP 2: Match Transactions                                     │		
│                                                                 │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Statement Balance:           $85,230.00                    ││		
│  │ Cleared Deposits:            +$12,450.00                   ││		
│  │ Cleared Withdrawals:         -$9,670.00                    ││		
│  │ ─────────────────────────────────────────                 ││		
│  │ Calculated Balance:          $85,230.00                    ││		
│  │ Difference:                  $0.00  ✅                      ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  📋 DEPOSITS AND CREDITS                                        │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ ☑ Dec 15 │ Deposit - Acme Corp      │ +$2,500.00          ││		
│  │ ☑ Dec 14 │ Transfer from Savings    │ +$5,000.00          ││		
│  │ ☑ Dec 10 │ Payment - XYZ Ltd        │ +$1,200.00          ││		
│  │ ☐ Dec 08 │ Deposit - Misc           │ +$350.00   ⚠️ Not on││		
│  │                                                             ││		
│  │ Total Deposits Cleared: $8,700.00 / $9,050.00              ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  📋 CHECKS AND PAYMENTS                                        │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ ☑ Dec 15 │ Check #1023 - Rent        │ -$1,200.00         ││		
│  │ ☑ Dec 14 │ ACH - ABC Supply          │ -$850.00           ││		
│  │ ☑ Dec 12 │ Check #1024 - Insurance   │ -$2,500.00         ││		
│  │ ☐ Dec 10 │ Debit - Shell Oil         │ -$85.00   ⚠️ Not on││		
│  │                                                             ││		
│  │ Total Payments Cleared: -$4,550.00 / -$4,635.00            ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ⚠️ TRANSACTIONS IN BOOKS BUT NOT ON STATEMENT                 │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ • Dec 08 - Deposit $350 (not cleared)                      ││		
│  │ • Dec 10 - Shell Oil $85 (not cleared)                     ││		
│  │                                                             ││		
│  │ [Add Missing Transaction] [Leave Uncleared]                ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│                            [Save & Continue Later] [Finish Now] │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Reconciliation Status Icons		
| Icon | Status | Description |		
|------|--------|-------------|		
| ✅ | Reconciled | Transaction matched and cleared |		
| ⏳ | Pending | Awaiting reconciliation |		
| ⚠️ | Discrepancy | Difference found |		
| ❌ | Voided | Voided transaction |		
		
### Accounting Effects		
| Action | Effect |		
|--------|--------|		
| Mark as Cleared | Flags transaction as reconciled |		
| Add Missing Transaction | Creates new entry to match statement |		
| Adjust Difference | Creates adjustment entry |		
| Complete Reconciliation | Locks transactions for the period |		
		
---		
		
## Transfers		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔄 Transfers                                            [+ New Transfer]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 QUICK STATS                                                              │		
│  ┌─────────────┬─────────────┬─────────────┐                               │		
│  │ This Month  │ Pending     │ Scheduled   │                               │		
│  │ $25,000     │ 2 transfers │ 3 upcoming  │                               │		
│  └─────────────┴─────────────┴─────────────┘                               │		
│                                                                              │		
│  📋 TRANSFER LIST                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ From Account      │ To Account        │ Amount    │ Status      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Operating ***1234│ Savings ***5678   │ $5,000    │ ✅ Complete ││		
│  │ Dec 14│ Savings ***5678  │ Operating ***1234 │ $2,500    │ ✅ Complete ││		
│  │ Dec 16│ Operating ***1234│ Credit Card ***345│ $2,000    │ ⏳ Pending  ││		
│  │ Dec 20│ Operating ***1234│ Savings ***5678   │ $10,000   │ 📅 Scheduled││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📅 SCHEDULED TRANSFERS                                                      │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Description           │ Amount    │ Frequency    │ Actions    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 20th   │ Savings Transfer      │ $10,000   │ Monthly      │ [Edit][Del]││		
│  │ 15th   │ Tax Savings           │ $5,000    │ Monthly      │ [Edit][Del]││		
│  │ 1st    │ Investment Account    │ $2,500    │ Monthly      │ [Edit][Del]││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Transfer Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  New Transfer                                              [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Transfer From *                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Operating Account ***1234                   $85,230.00  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Transfer To *                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Savings Account ***5678                     $45,000.00  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Amount *                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 5,000.00                                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Date *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Memo                                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Monthly savings transfer                                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  🔄 Make this recurring:                                        │		
│  ☐ Repeat every [Monthly ▼] on day [15 ▼]                     │		
│                                                                 │		
│                                    [Cancel]  [Transfer Now]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Transfer Out | Transfer Account (To) | Bank Account (From) |		
| Transfer In | Bank Account (To) | Transfer Account (From) |		
| Multi-Currency | Bank Account (To) | Bank Account (From) + FX Gain/Loss |		
		
---		
		
## Cash Accounts		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💵 Cash Accounts                                       [+ Add Cash Account]  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 CASH OVERVIEW                                                            │		
│  ┌─────────────┬─────────────┬─────────────┐                               │		
│  │ Total Cash  │ Accounts    │ Last Count  │                               │		
│  │ $2,500.00   │ 3 accounts  │ Dec 15      │                               │		
│  └─────────────┴─────────────┴─────────────┘                               │		
│                                                                              │		
│  📋 CASH ACCOUNT CARDS                                                       │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  ┌─────────────────────┐  ┌─────────────────────┐                    │ │		
│  │  │ 💵 Petty Cash       │  │ 💵 Cash Register    │                    │ │		
│  │  │ Main Office         │  │ Store Location      │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ $500.00             │  │ $1,500.00           │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ Last Count: Dec 15  │  │ Last Count: Dec 14  │                    │ │		
│  │  │ Variance: $0.00     │  │ Variance: +$5.00    │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ [Count] [Adjust]    │  │ [Count] [Adjust]    │                    │ │		
│  │  └─────────────────────┘  └─────────────────────┘                    │ │		
│  │                                                                        │ │		
│  │  ┌─────────────────────┐                                              │ │		
│  │  │ 💵 Cash on Hand     │                                              │ │		
│  │  │ Field Operations    │                                              │ │		
│  │  │                     │                                              │ │		
│  │  │ $500.00             │                                              │ │		
│  │  │                     │                                              │ │		
│  │  │ Last Count: Dec 10  │                                              │ │		
│  │  │ Variance: -$10.00   │                                              │ │		
│  │  │                     │                                              │ │		
│  │  │ [Count] [Adjust]    │                                              │ │		
│  │  └─────────────────────┘                                              │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 RECENT CASH TRANSACTIONS                                                 │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ Account      │ Type     │ Description      │ Amount    │ Balance││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Petty Cash  │ Addition │ Replenish        │ +$200.00  │ $500.00││		
│  │ Dec 14│ Petty Cash  │ Expense  │ Office supplies  │ -$45.00   │ $300.00││		
│  │ Dec 12│ Petty Cash  │ Expense  | Delivery tip     │ -$10.00   │ $345.00││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Cash Count Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Cash Count: Petty Cash                                  [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Book Balance: $500.00                                          │		
│  Last Count: Dec 15, 2024                                       │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  COUNT DETAILS                                                  │		
│                                                                 │		
│  Bills:                                                         │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ $100 x [  0  ] = $0.00                                      ││		
│  │ $50  x [  2  ] = $100.00                                    ││		
│  │ $20  x [ 10  ] = $200.00                                    ││		
│  │ $10  x [  8  ] = $80.00                                     ││		
│  │ $5   x [  4  ] = $20.00                                     ││		
│  │ $2   x [  0  ] = $0.00                                      ││		
│  │ $1   x [ 15  ] = $15.00                                     ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  Coins:                                                         │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Quarters x [  40 ] = $10.00                                 ││		
│  │ Dimes    x [  30 ] = $3.00                                  ││		
│  │ Nickels  x [  20 ] = $1.00                                  ││		
│  │ Pennies  x [ 100 ] = $1.00                                  ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Total Counted:                          $430.00            ││		
│  │ Book Balance:                           $500.00            ││		
│  │ Variance:                               -$70.00   ⚠️       ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  Notes for Variance:                                            │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ e.g., Missing receipt for delivery                          ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│                 [Cancel]  [Save Count & Create Adjustment]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Action | Debit | Credit |		
|--------|-------|--------|		
| Cash Addition | Cash Account | Bank Account or Expense |		
| Cash Expense | Expense Account | Cash Account |		
| Variance (Shortage) | Cash Over/Short Loss | Cash Account |		
| Variance (Overage) | Cash Account | Cash Over/Short Income |		
		
---		
		
## Payments		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💳 Payments                                            [+ Receive] [+ Pay]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [Receive Payments (AR)] [Make Payments (AP)]                                │		
│                                                                              │		
│  📊 PAYMENTS OVERVIEW (AR)                                                   │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Received    │ Pending     │ This Month  │ Avg. Time   │                │		
│  │ Today: $5K  │ $45,890     │ $89,450     │ 32 days     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 RECENT PAYMENTS RECEIVED                                                 │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ Customer     │ Invoice   │ Method    │ Amount    │ Actions      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Acme Corp   │ #1042     │ ACH       │ $2,500    │ [View][Print]││		
│  │ Dec 14│ XYZ Ltd     │ #1040     │ Check     │ $1,200    │ [View][Print]││		
│  │ Dec 13│ Smith Co    │ #1038     │ Credit    │ $8,500    │ [View][Print]││		
│  │ Dec 12│ Brown Inc   │ Multiple  │ Wire      │ $15,000   │ [View][Print]││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 PAYMENTS TO RECEIVE                                                      │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Customer      │ Invoice   │ Due Date  │ Amount    │ Overdue   │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Acme Corp     │ #1041     │ Dec 20    │ $5,200    │ -         │ [Remind]││		
│  │ XYZ Ltd       │ #1039     │ Dec 10    │ $3,500    │ 6 days    │ [Remind]││		
│  │ Smith Co      │ #1036     │ Dec 05    │ $2,800    │ 11 days   │ [Remind]││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Receive Payment Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Receive Payment                                          [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Customer *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Acme Corp                               Balance: $7,700 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Date *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Method *                                               │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Cash    ○ Check    ○ Credit Card    ○ ACH    ○ Other  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Deposit To *                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Operating Account ***1234                              ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Reference #                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., Check number or confirmation                     │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Amount Received *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 2,500.00                                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  Outstanding Invoices:                                          │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ ☑ Invoice #1042    Dec 14   $2,500   [Apply $2,500]        ││		
│  │ ☐ Invoice #1041    Dec 10   $5,200   [Apply $0.00]         ││		
│  │                                                             ││		
│  │ Total to Apply: $2,500.00 / $7,700.00                      ││		
│  │ Remaining Credit: $0.00                                     ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ☐ Send receipt to customer                                    │		
│                                                                 │		
│                                    [Cancel]  [Save Payment]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Make Payment Modal (AP)		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Make Payment                                              [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Vendor *                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ABC Supply                              Balance: $3,500 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Date *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Method *                                               │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Check    ○ ACH    ○ Credit Card    ○ Cash    ○ Wire   │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Pay From *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Operating Account ***1234                              ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Check # (if applicable)                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 1025                                                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Amount to Pay *                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 3,500.00                                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  Outstanding Bills:                                             │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ ☑ Bill #B-89      Dec 14   $850     [Apply $850]          ││		
│  │ ☑ Bill #B-90      Dec 12   $1,200   [Apply $1,200]        ││		
│  │ ☑ Bill #B-91      Dec 10   $1,450   [Apply $1,450]        ││		
│  │                                                             ││		
│  │ Total to Apply: $3,500.00 / $3,500.00                      ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ☐ Print check                                                  │		
│  ☐ Send remittance advice                                       │		
│                                                                 │		
│                                    [Cancel]  [Save Payment]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Payment Type | Debit | Credit |		
|--------------|-------|--------|		
| Receive Payment | Bank Account | Accounts Receivable |		
| Make Payment | Accounts Payable | Bank Account |		
| Payment Discount (AR) | Sales Discount | A/R |		
| Payment Discount (AP) | A/P | Purchase Discount |		
		
---		
		
## Cash Position		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💵 Cash Position                                       [Export] [Refresh]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 CURRENT POSITION                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                                                                          ││		
│  │           ┌──────────────────────────────────────────────┐              ││		
│  │           │                                              │              ││		
│  │           │     💵 TOTAL CASH POSITION                   │              ││		
│  │           │                                              │              ││		
│  │           │            $145,230.00                       │              ││		
│  │           │     ↑ $12,450 vs last week                   │              ││		
│  │           │                                              │              ││		
│  │           └──────────────────────────────────────────────┘              ││		
│  │                                                                          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 CASH BREAKDOWN                                                           │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Bank Accounts                          $138,730   (95.5%)            │ │		
│  │  ████████████████████████████████████████████████████████████████     │ │		
│  │                                                                        │ │		
│  │  Cash Accounts                          $500       (0.3%)             │ │		
│  │  ████                                                                  │ │		
│  │                                                                        │ │		
│  │  Credit Card (Available)                $44,000    (available)        │ │		
│  │  ██████████████████████████████████████████████████████████████████   │ │		
│  │  Credit Card (Used)                     -$6,000    (12% utilized)     │ │		
│  │  ████████████████                                                       │ │		
│  │                                                                        │ │		
│  │  Line of Credit (Available)             $100,000   (available)        │ │		
│  │  ████████████████████████████████████████████████████████████████████ │ │		
│  │  Line of Credit (Used)                  $0         (0% utilized)      │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 LIQUIDITY METRICS                                                        │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Current Ratio│ Quick Ratio │ Cash Ratio  │ Runway      │                │		
│  │ 2.5          │ 1.8         │ 0.95        │ 4.2 months  │                │		
│  │ ✅ Healthy   │ ✅ Healthy  │ ✅ Healthy  │ ✅ Good     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 ACCOUNT DETAILS                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Account Type │ Account Name       │ Balance    │ Available   │ Status  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Checking     │ Operating ***1234  │ $85,230    │ $85,230     │ ✅      ││		
│  │ Checking     │ Payroll ***9876    │ $15,000    │ $15,000     │ ✅      ││		
│  │ Savings      │ Reserve ***5678    │ $38,500    │ $38,500     │ ✅      ││		
│  │ Credit Card  │ Amex ***3456       │ -$6,000    │ $44,000     │ ✅      ││		
│  │ Line Credit  │ LOC ***7890        │ $0         │ $100,000    │ ✅      ││		
│  │ Cash         │ Petty Cash         │ $500       │ $500        │ ✅      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Treasury *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏛️ Treasury                                            [Treasury Dashboard]  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [Cash Pooling] [FX Management] [Investments] [Credit Facilities]            │		
│                                                                              │		
│  📊 CASH POOLING                                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                                                                          ││		
│  │  Master Account: Operating ***1234                                      ││		
│  │  Total Pooled Cash: $145,230                                            ││		
│  │                                                                          ││		
│  │  ┌────────────────────────────────────────────────────────────────┐    ││		
│  │  │                                                                  │    ││		
│  │  │    Entity           Account           Balance    Pool Status   │    ││		
│  │  │    ─────────────────────────────────────────────────────────   │    ││		
│  │  │    Acme Corp        Operating         $85,230    Master        │    ││		
│  │  │    Acme Corp        Payroll           $15,000    Zero-Bal      │    ││		
│  │  │    Acme UK Ltd      UK Operating      £12,500    Sub-Pool      │    ││		
│  │  │    Acme GmbH        DE Account        €8,900     Sub-Pool      │    ││		
│  │  │                                                                  │    ││		
│  │  │    Interest Optimization: +$2,340 this month                    │    ││		
│  │  │                                                                  │    ││		
│  │  └────────────────────────────────────────────────────────────────┘    ││		
│  │                                                                          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 FX MANAGEMENT                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                                                                          ││		
│  │  Currency Exposure Summary:                                              ││		
│  │  ┌─────────────────────────────────────────────────────────────────┐   ││		
│  │  │ Currency   │ Position    │ USD Equiv   │ Risk     │ Hedge      │   ││		
│  │  │ GBP        │ £125,000    │ $158,750    │ Medium   │ 50% Hedged │   ││		
│  │  │ EUR        │ €89,000     │ $96,000     │ Low      │ 30% Hedged │   ││		
│  │  │ JPY        │ ¥5,000,000  │ $33,500     │ Low      │ Unhedged  │   ││		
│  │  └─────────────────────────────────────────────────────────────────┘   ││		
│  │                                                                          ││		
│  │  FX Gain/Loss YTD: +$5,230                                              ││		
│  │                                                                          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 INVESTMENTS                                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                                                                          ││		
│  │  Investment Portfolio:                                                   ││		
│  │  ┌─────────────────────────────────────────────────────────────────┐   ││		
│  │  │ Investment        │ Amount    │ Rate   │ Maturity  │ Interest   │   ││		
│  │  │ Money Market      │ $50,000   │ 4.5%   │ Open      │ $187.50/mo │   ││		
│  │  │ CD - 6 Month      │ $25,000   │ 5.0%   │ Mar 2025  │ $104.17/mo │   ││		
│  │  │ T-Bills           │ $30,000   │ 4.8%   │ Jan 2025  │ $120.00/mo │   ││		
│  │  │                                                          ─────────│   ││		
│  │  │ Total Portfolio   │ $105,000  │        │           │ $411.67/mo │   ││		
│  │  └─────────────────────────────────────────────────────────────────┘   ││		
│  │                                                                          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 CREDIT FACILITIES                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │                                                                          ││		
│  │  ┌─────────────────────────────────────────────────────────────────┐   ││		
│  │  │ Facility          │ Limit     │ Used      │ Available │ Rate    │   ││		
│  │  │ Revolving LOC     │ $100,000  │ $0        │ $100,000  │ Prime+1 │   ││		
│  │  │ Term Loan         │ $250,000  │ $125,000  │ $125,000  │ 6.5%    │   ││		
│  │  │ Equipment Loan    │ $50,000   │ $35,000   │ $15,000   │ 5.75%   │   ││		
│  │  └─────────────────────────────────────────────────────────────────┘   ││		
│  │                                                                          ││		
│  │  Covenant Compliance: ✅ All covenants met                              ││		
│  │                                                                          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Cash Forecasting *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📈 Cash Forecasting                                     [Run Forecast]       │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 FORECAST SETTINGS                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Forecast Period: [13 Weeks ▼]    Starting: [Dec 16, 2024 📅]        │   │		
│  │ Scenario: [Base Case ▼]          Refresh: [Auto ▼]                  │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📈 13-WEEK CASH FORECAST CHART                                              │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  $200K├──────────────────────────────────────────────────────────    │ │		
│  │        │     ╭──────────────────────────────────────────────╮        │ │		
│  │  $150K│─────╯                                                ╰──────  │ │		
│  │        │                                              ╭──────╮        │ │		
│  │  $100K│──────────────────────────────────────────────╯      ╰──────  │ │		
│  │        │         ╭──────╮                                    ╭────── │ │		
│  │   $50K│─────────╯      ╰────────────────────────────────────╯       │ │		
│  │        │   ╭──────╮                                              ╭─── │ │		
│  │    $0  │───╯      ╰──────────────────────────────────────────────╯─    │ │		
│  │        └────────────────────────────────────────────────────────────   │ │		
│  │         W1   W2   W3   W4   W5   W6   W7   W8   W9  W10  W11  W12  W13│ │		
│  │                                                                        │ │		
│  │  ── Actual    ── Forecast    ── Minimum Cash Required ($25K)          │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 WEEKLY FORECAST DETAILS                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Week  │ Starting │ Beginning │ Inflows  │ Outflows │ Ending  │ Status ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ W1    │ Dec 16   │ $145,230  │ $25,000  │ $18,500  │ $151,730│ ✅     ││		
│  │ W2    │ Dec 23   │ $151,730  │ $15,000  │ $28,000  │ $138,730│ ✅     ││		
│  │ W3    │ Dec 30   │ $138,730  │ $45,000  │ $22,000  │ $161,730│ ✅     ││		
│  │ W4    │ Jan 06   │ $161,730  │ $20,000  │ $35,000  │ $146,730│ ✅     ││		
│  │ W5    │ Jan 13   │ $146,730  │ $18,000  │ $42,000  │ $122,730│ ⚠️     ││		
│  │ W6    │ Jan 20   │ $122,730  │ $22,000  │ $38,000  │ $106,730│ ⚠️     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 INFLOW SOURCES (This Week)                                               │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Source                    │ Amount    │ Probability │ Confidence       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ AR Collections            │ $18,500   │ High        │ Based on history ││		
│  │ Expected Invoice Payments │ $5,000    │ Medium      │ 3 invoices due   ││		
│  │ Other Income              │ $1,500    │ Low         │ Miscellaneous    ││		
│  │ Total Inflows             │ $25,000   │             │                  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 OUTFLOW SOURCES (This Week)                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Category                  │ Amount    │ Due Date   │ Flexibility       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Payroll                   │ $12,000   │ Dec 20     │ None              ││		
│  │ Rent                      │ $3,200    │ Dec 15     │ None              ││		
│  │ Vendor Payments           │ $2,300    │ Various    │ Moderate          ││		
│  │ Operating Expenses        │ $1,000    │ Various    │ High              ││		
│  │ Total Outflows            │ $18,500   │            │                   ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  ⚠️ ALERTS                                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ ⚠️ Week 5: Cash projected to drop below 2x monthly expenses         │   │		
│  │ ⚠️ Week 8: Large payment of $50,000 due (loan repayment)            │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
*(Continuing with remaining sections...)*		
		
---		
		
# 💰 SALES		
		
## Overview		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💰 Sales Overview                                                           │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 KEY METRICS                                                              │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total AR    │ Overdue     │ This Month  │ Avg. Days   │                │		
│  │ $45,890     │ $12,340     │ $89,450     │ 32 days     │                │		
│  │ ↓ 3%        │ ⚠️ 8 items  │ ↑ 12%       │ Target: 30  │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📈 REVENUE TREND (Last 12 Months)                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  $100K├──────────────────────────────────────────────────────────    │ │		
│  │        │                                    ╭────────────╮          │ │		
│  │   $80K│─────────────────────────────────────╯            ╰──────    │ │		
│  │        │                  ╭────────────╮                           │ │		
│  │   $60K│─────────────────╯            ╰─────────────────────────    │ │		
│  │        │        ╭──────╮                                          │ │		
│  │   $40K│─────────╯      ╰────────────────────────────────────────  │ │		
│  │        │   ╭──────╮                                          ╭─── │ │		
│  │   $20K│───╯      ╰────────────────────────────────────────────╯─    │ │		
│  │        └──────────────────────────────────────────────────────────   │ │		
│  │         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 INVOICE STATUS                                                           │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Draft (5)      Sent (23)      Paid (89)      Overdue (8)            │ │		
│  │  ████████       ████████████   ████████████████████████  ██████████  │ │		
│  │  $8,500         $45,890        $125,450        $12,340                │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  🏆 TOP CUSTOMERS (This Month)                                               │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ Customer          │ Revenue    │ Invoices │ Avg. Payment Time        │ │		
│  ├───────────────────────────────────────────────────────────────────────┤ │		
│  │ 1. Acme Corp      │ $25,000    │ 5        │ 28 days                  │ │		
│  │ 2. XYZ Ltd        │ $18,500    │ 3        │ 35 days                  │ │		
│  │ 3. Smith Co       │ $12,000    │ 2        │ 42 days                  │ │		
│  │ 4. Brown Inc      │ $8,900     │ 4        │ 25 days                  │ │		
│  │ 5. Johnson LLC    │ $6,500     │ 1        │ 30 days                  │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 ACTIONS NEEDED                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔴 8 overdue invoices totaling $12,340                  [View All]  │   │		
│  │ 🟡 5 draft invoices ready to send                       [View All]  │   │		
│  │ 🟢 3 quotes expiring this week                          [View All]  │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  ⚡ QUICK ACTIONS                                                            │		
│  [+ New Invoice] [+ New Quote] [+ New Customer] [Send Reminders]            │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Customers		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  👥 Customers                                   [+ Add Customer] [Import]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search customers...                                               │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Status: All ▼] [Balance: All ▼] [Type: All ▼] [Tag: All ▼]        │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total       │ Active      │ With Balance│ New This Mo │                │		
│  │ 145         │ 132         │ 23          │ 5           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 CUSTOMER LIST                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ ☑ │ Name         │ Contact      │ Balance   │ Open Inv │ Status│Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ Acme Corp    │ John Doe     │ $7,700    │ 3        │ Active│  ⋮   ││		
│  │   │ acme.com      │ john@acme   │           │          │       │      ││		
│  │   │ Net 30, Credit│ $10,000     │           │          │       │      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ XYZ Ltd      │ Sarah Jones  │ $3,500    │ 2        │ Active│  ⋮   ││		
│  │   │ xyz.com       │ sarah@xyz   │           │          │       │      ││		
│  │   │ Net 15        │ $0          │           │          │       │      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ Smith Co     │ Mike Smith   │ $0        │ 0        │ Active│  ⋮   ││		
│  │   │ smithco.com   │ mike@smith  │           │          │       │      ││		
│  │   │ Due on Receipt│ $5,000      │           │          │       │      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 Showing 1-25 of 145 customers                           [< Prev] [Next >]│		
│                                                                              │		
│  🎯 SELECTED: 0 customers    [Email] [Export] [Add Tag] [Archive]           │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add/Edit Customer Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Customer                                             [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  📋 CUSTOMER INFO                                               │		
│                                                                 │		
│  Display Name *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Acme Corporation                                        │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Company Name                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Acme Corporation, Inc.                                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Customer Type *                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Business ▼]    ○ Individual                           │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Email                         Phone                            │		
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │		
│  │ billing@acme.com        │   │ (555) 123-4567              │ │		
│  └─────────────────────────┘   └─────────────────────────────┘ │		
│                                                                 │		
│  Website                        Tax ID                          │		
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │		
│  │ www.acme.com            │   │ 12-3456789                  │ │		
│  └─────────────────────────┘   └─────────────────────────────┘ │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📍 BILLING ADDRESS                                             │		
│                                                                 │		
│  Street Address                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 123 Business Park Drive                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  City                    State           ZIP                    │		
│  ┌───────────────────┐   ┌───────────┐   ┌───────────────┐    │   │		
│  │ New York          │   │ NY      ▼│   │ 10001         │    │   │		
│  └───────────────────┘   └───────────┘   └───────────────┘    │   │		
│                                                                 │		
│  Country                                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ United States                                         ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ☐ Same as shipping address                                    │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💳 PAYMENT & BILLING                                           │		
│                                                                 │		
│  Payment Terms *               Currency                         │		
│  ┌─────────────────────┐       ┌─────────────────────┐        │		
│  │ Net 30            ▼ │       │ USD               ▼ │        │		
│  └─────────────────────┘       └─────────────────────────────┘│		
│                                                                 │		
│  Opening Balance               As of Date                       │		
│  ┌─────────────────────┐       ┌─────────────────────┐        │		
│  │ $ 0.00              │       │ Dec 16, 2024      📅│        │		
│  └─────────────────────┘       └─────────────────────┘        │		
│                                                                 │		
│  Credit Limit                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 10,000.00                                             │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Preferred Payment Method                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [None ▼]    Options: ACH, Check, Credit Card, Wire      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  🏷️ ADDITIONAL INFO                                             │		
│                                                                 │		
│  Tags                                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [VIP] [Enterprise] [+]                                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Notes                                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Key account - priority support                          │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Attachments                                                    │		
│  [Upload Files]                                                 │		
│                                                                 │		
│                                    [Cancel]  [Save Customer]    │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Customer Actions Menu (⋮)		
| Action | Description |		
|--------|-------------|		
| View | View customer details and history |		
| Edit | Modify customer information |		
| New Invoice | Create invoice for this customer |		
| New Quote | Create quote for this customer |		
| Receive Payment | Record payment from customer |		
| Send Statement | Email account statement |		
| Add Note | Add internal note |		
| Archive | Archive (hide from active list) |		
| Delete | Delete customer (if no transactions) |		
		
---		
		
## Invoices		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📄 Invoices                                     [+ New Invoice] [Import]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search invoices...                                                │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Status: All ▼] [Customer: All ▼] [Date: This Month ▼]             │   │		
│  │ [Amount: All ▼] [Due Date: All ▼] [Overdue: All ▼]                 │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total AR    │ Draft       │ Overdue     │ Paid This Mo│                │		
│  │ $45,890     │ $8,500      │ $12,340     │ $89,450     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (125)] [Draft (5)] [Sent (23)] [Overdue (8)] [Paid (89)]              │		
│                                                                              │		
│  📋 INVOICE LIST                                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ #    │ Date   │ Customer    │ Due Date  │ Amount  │ Status    │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 1043 │ Dec 15 │ Acme Corp   │ Jan 14    │ $5,200  │ Sent      │   ⋮    ││		
│  │      │        │             │           │         │ Viewed 2x │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 1042 │ Dec 14 │ XYZ Ltd     │ Jan 13    │ $2,500  │ Paid      │   ⋮    ││		
│  │      │        │             │ Dec 14    │         │ ✅ Paid   │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 1041 │ Dec 10 │ Smith Co    │ Dec 10    │ $3,500  │ Overdue   │   ⋮    ││		
│  │      │        │             │ 6 days    │         │ ⚠️ 6 days │ [Remind]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ 1040 │ Dec 08 │ Brown Inc   │ Jan 07    │ $8,900  │ Draft     │   ⋮    ││		
│  │      │        │             │           │         │ 📝 Draft  │ [Send] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 Showing 1-25 of 125 invoices                           [< Prev] [Next >]│		
│                                                                              │		
│  🎯 SELECTED: 0 invoices    [Send] [Print] [Export] [Void]                  │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Invoice Status Icons		
| Status | Icon | Color | Description |		
|--------|------|-------|-------------|		
| Draft | 📝 | Gray | Not yet sent |		
| Sent | 📧 | Blue | Sent to customer |		
| Viewed | 👁️ | Blue | Customer opened |		
| Partial | 💳 | Yellow | Partially paid |		
| Paid | ✅ | Green | Fully paid |		
| Overdue | ⚠️ | Red | Past due date |		
| Voided | ❌ | Gray | Cancelled |		
		
### New Invoice Page		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📄 New Invoice                                          [Save Draft] [Send]  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  ┌─────────────────────────────────────┬────────────────────────────────┐  │		
│  │ FROM:                               │ BILL TO:                        │  │		
│  │ Acme Corporation, Inc.              │ [Select Customer ▼]             │  │		
│  │ 123 Business Park Drive             │                                 │  │		
│  │ New York, NY 10001                  │ Customer details appear here    │  │		
│  │                                     │ after selection                 │  │		
│  │                                     │                                 │  │		
│  │                                     │ [Edit Customer]                 │  │		
│  └─────────────────────────────────────┴────────────────────────────────┘  │		
│                                                                              │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Invoice #     │ Invoice Date │ Due Date    │ Terms          │ PO #    │ │		
│  │ 1044          │ Dec 16, 2024 │ Jan 15, 2025│ Net 30       ▼│          │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 LINE ITEMS                                                               │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Description           │ Qty │ Rate     │ Amount   │ Tax    │ Actions   │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ [Product/Service ▼]   │ [1] │ [$0.00] │ $0.00   │ [Tax ▼]│ [X]       │ │		
│  │ [Description...]      │     │          │          │        │           │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Consulting Services   │ 10  │ $150.00  │ $1,500.00│ Taxable│ [X]       │ │		
│  │ Monthly consulting    │     │          │          │        │           │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Software License      │ 1   │ $500.00  │ $500.00  │ Exempt │ [X]       │ │		
│  │ Annual subscription   │     │          │          │        │           │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ [+ Add Line] [+ Add Section] [+ Add Subtotal]                          │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ┌──────────────────────────────────────┬─────────────────────────────────┐│		
│  │                                      │ Subtotal:       $2,000.00       ││		
│  │ Customer Message:                    │ Discount:       -$0.00          ││		
│  │ ┌────────────────────────────────┐   │ ─────────────────────           ││		
│  │ │ Thank you for your business!   │   │ Tax (8%):       $160.00        ││		
│  │ │ Payment is due within 30 days. │   │ ─────────────────────           ││		
│  │ └────────────────────────────────┘   │ TOTAL:          $2,160.00       ││		
│  │                                      │                                 ││		
│  │ Memo (Internal):                     │ Amount Due:     $2,160.00       ││		
│  │ ┌────────────────────────────────┐   │                                 ││		
│  │ │ Internal notes (not visible)   │   │ [Apply Credit]                  ││		
│  │ └────────────────────────────────┘   │                                 ││		
│  └──────────────────────────────────────┴─────────────────────────────────┘│		
│                                                                              │		
│  📎 ATTACHMENTS                                                              │		
│  │ [Upload Files] or drag and drop                                          │		
│                                                                              │		
│  💳 PAYMENT OPTIONS                                                          │		
│  │ ☐ Include payment link                                                   │		
│  │ ☐ Accept credit card payments (3.5% fee)                                │		
│  │ ☐ Accept ACH payments (1% fee, max $10)                                 │		
│                                                                              │		
│  📧 DELIVERY OPTIONS                                                         │		
│  │ ☑ Send via email to: billing@acme.com                                   │		
│  │ ☐ Attach PDF                                                             │		
│  │ ☐ Send copy to me                                                        │		
│                                                                              │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                              │		
│  [Save Draft] [Save & New] [Preview] [Print]              [Send Invoice]    │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Invoice Actions Menu (⋮)		
| Action | Description |		
|--------|-------------|		
| View | View invoice details |		
| Edit | Modify invoice |		
| Send | Email to customer |		
| Print | Print PDF |		
| Copy | Duplicate invoice |		
| Receive Payment | Record payment |		
| Apply Credit | Apply credit memo |		
| Void | Void invoice |		
| Delete | Delete draft invoice |		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Create Invoice | Accounts Receivable | Sales Revenue |		
| | | Sales Tax Payable (if taxable) |		
| Receive Payment | Bank Account | Accounts Receivable |		
| Discount | Sales Discount | Accounts Receivable |		
| Void Invoice | Sales Revenue | Accounts Receivable |		
		
---		
		
*(Due to the extensive nature of this document, I'll continue with the remaining sections. Should I proceed with Quotes, Sales Orders, Payment Links, and the rest of the Sales section, followed by Expenses, Projects, Time, Inventory, Payroll, Accounting, Reports, Taxes, Compliance, Automation, Accountant Workspace, Financial Services, Apps & Integrations, and Settings?)*		
		
---		
		
# Haypbooks v2 — Complete Page Specifications (Continued)		
		
Continuing from Sales → Invoices...		
		
---		
		
## Quotes & Estimates		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📝 Quotes & Estimates                               [+ New Quote] [Import]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Open Quotes │ Accepted    │ Expired     │ Win Rate     │                │		
│  │ $125,000    │ $45,000     │ $8,500      │ 68%          │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (45)] [Draft (8)] [Sent (15)] [Accepted (12)] [Expired (5)] [Declined (5)]│		
│                                                                              │		
│  📋 QUOTE LIST                                                               │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ #    │ Date   │ Customer    │ Expires   │ Amount  │ Status    │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Q-89 │ Dec 15 │ Acme Corp   │ Dec 30    │ $25,000 │ Sent      │   ⋮    ││		
│  │      │        │             │ 14 days left│       │ Viewed 3x │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Q-88 │ Dec 12 │ XYZ Ltd     │ Dec 26    │ $15,000 │ Accepted  │   ⋮    ││		
│  │      │        │             │           │         │ ✅ Inv #1042│ [Convert]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Q-87 │ Dec 10 │ Smith Co    │ Dec 20    │ $8,500  │ Expiring  │   ⋮    ││		
│  │      │        │             │ 4 days left│        │ ⚠️ Soon   │ [Remind]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Q-86 │ Dec 05 │ Brown Inc   │ Dec 19    │ $12,000 │ Expired   │   ⋮    ││		
│  │      │        │             │ Yesterday  │        │ ❌ Expired │ [Renew] │		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Quote Page		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📝 New Quote                                    [Save Draft] [Send]         │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  ┌─────────────────────────────────────┬────────────────────────────────┐  │		
│  │ FROM:                               │ QUOTE TO:                       │  │		
│  │ Acme Corporation, Inc.              │ [Select Customer ▼]             │  │		
│  │ 123 Business Park Drive             │                                 │  │		
│  │ New York, NY 10001                  │                                 │  │		
│  └─────────────────────────────────────┴────────────────────────────────┘  │		
│                                                                              │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Quote #      │ Quote Date   │ Expiration │ Terms          │ PO #      │ │		
│  │ Q-90         │ Dec 16, 2024 │ Jan 15, 2025│ Net 30       ▼│           │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 LINE ITEMS                                                               │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Description           │ Qty │ Rate     │ Amount   │ Tax    │ Actions   │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Website Development   │ 1   │ $15,000.00│ $15,000.00│ Taxable│ [X]       │ │		
│  │ Full website redesign │     │          │          │        │           │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ SEO Services          │ 6   │ $500.00  │ $3,000.00│ Taxable│ [X]       │ │		
│  │ Monthly SEO for 6 mo  │     │          │          │        │           │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ [+ Add Line] [+ Add Section]                                           │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ┌──────────────────────────────────────┬─────────────────────────────────┐│		
│  │                                      │ Subtotal:       $18,000.00      ││		
│  │ Customer Message:                    │ Discount:       -$0.00          ││		
│  │ ┌────────────────────────────────┐   │ ─────────────────────           ││		
│  │ │ Thank you for considering our  │   │ Tax (8%):       $1,440.00       ││		
│  │ │ proposal. Valid for 30 days.   │   │ ─────────────────────           ││		
│  │ └────────────────────────────────┘   │ TOTAL:          $19,440.00      ││		
│  │                                      │                                 ││		
│  │ Deposit Required:                    │                                 ││		
│  │ ┌────────────────────────────────┐   │                                 ││		
│  │ │ 50% deposit required to begin  │   │                                 ││		
│  │ └────────────────────────────────┘   │                                 ││		
│  └──────────────────────────────────────┴─────────────────────────────────┘│		
│                                                                              │		
│  📧 DELIVERY OPTIONS                                                         │		
│  │ ☑ Send via email to: [customer email]                                   │		
│  │ ☐ Request online acceptance                                             │		
│  │ ☐ Require signature                                                     │		
│                                                                              │		
│  [Save Draft] [Preview] [Print]                           [Send Quote]       │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Quote Actions Menu (⋮)		
| Action | Description |		
|--------|-------------|		
| View | View quote details |		
| Edit | Modify quote |		
| Send | Email to customer |		
| Convert to Invoice | Create invoice from quote |		
| Create Sales Order | Create order from quote |		
| Copy | Duplicate quote |		
| Mark Accepted | Manually mark as accepted |		
| Mark Declined | Mark as declined |		
| Expire | Mark as expired |		
| Delete | Delete draft quote |		
		
### Accounting Effects		
| Action | Effect |		
|--------|--------|		
| Create Quote | No accounting entry (non-posting) |		
| Convert to Invoice | Creates invoice with AR entry |		
| Mark Accepted | Updates status, no entry |		
		
---		
		
## Sales Orders		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 Sales Orders                                [+ New Sales Order]          │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Open Orders │ Fulfilled   │ Pending Ship│ Backordered │                │		
│  │ 15          │ 89          │ 8           │ 3 items     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (104)] [Open (15)] [Partially Fulfilled (5)] [Fulfilled (84)]         │		
│                                                                              │		
│  📋 SALES ORDER LIST                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ SO # │ Date   │ Customer    │ Ship By   │ Amount  │ Status    │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ SO-15│ Dec 15 │ Acme Corp   │ Dec 20    │ $5,200  │ Open      │   ⋮    ││		
│  │      │        │ 5 items     │           │         │ 📦 Ready  │ [Ship] ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ SO-14│ Dec 14 │ XYZ Ltd     │ Dec 18    │ $3,500  │ Partial   │   ⋮    ││		
│  │      │        │ 3 of 5 shipped│         │         │ 🚚 In Transit│      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ SO-13│ Dec 12 │ Smith Co    │ Dec 17    │ $8,900  │ Fulfilled │   ⋮    ││		
│  │      │        │ All shipped │           │         │ ✅ Done   │ [Invoice]│		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Sales Order Fulfillment Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Fulfill Sales Order: SO-15                              [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Customer: Acme Corp                                            │		
│  Ship To: 123 Business Park Drive, New York, NY 10001          │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📦 ITEMS TO FULFILL                                            │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Item          │ Ordered │ Available │ To Ship │ Backorder   ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Widget A      │ 10      │ 10        │ [10]    │ ☐          ││		
│  │ Widget B      │ 5       │ 3         │ [3]     │ ☑ 2        ││		
│  │ Gadget C      │ 2       │ 2         │ [2]     │ ☐          ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  📍 SHIPMENT DETAILS                                            │		
│                                                                 │		
│  Ship Date *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Shipping Method *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ UPS Ground                                           ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Tracking Number                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Enter tracking number...                                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Shipping Cost                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 0.00                                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ☐ Email tracking to customer                                  │		
│  ☐ Create invoice after fulfillment                            │		
│                                                                 │		
│                 [Cancel]  [Partial Ship]  [Ship All]            │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Action | Debit | Credit |		
|--------|-------|--------|		
| Create Sales Order | No entry (non-posting) | |		
| Fulfill (Ship) | Cost of Goods Sold | Inventory |		
| Create Invoice | Accounts Receivable | Sales Revenue |		
		
---		
		
## Payment Links		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔗 Payment Links                                      [+ Create Link]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Active Links│ Total Collected│ Pending │ Avg. Time  │                │		
│  │ 12          │ $45,890        │ $12,500 │ 2.5 days   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┴───────────────┘│		
│                                                                              │		
│  📋 PAYMENT LINK LIST                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Link Name       │ Created  │ Amount   │ Collected│ Status   │ Actions  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Consulting Fee  │ Dec 15   │ $2,500   │ $2,500   │ Paid     │   ⋮     ││		
│  │ for Acme        │          │          │ ✅ 1 pay │          │          ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Project Deposit │ Dec 12   │ $5,000   │ $0       │ Active   │   ⋮     ││		
│  │ Smith Project   │          │          │ 0 pays   │ 🔗 Share │ [Copy]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Custom Amount   │ Dec 10   │ Variable │ $1,200   │ Active   │   ⋮     ││		
│  │ General Payment │          │          │ 3 pays   │ 🔗 Share │ [Copy]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Create Payment Link Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Create Payment Link                                      [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Link Name *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., Project Deposit - Smith Co                        │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Link Type *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Fixed Amount    ○ Variable Amount    ○ Item List      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Amount *                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 5,000.00                                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Description                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 50% deposit for website project                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Customer (Optional)                                            │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Smith Co                                             ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Options                                                │		
│  ☑ Credit Card (2.9% + $0.30)                                  │		
│  ☑ ACH Bank Transfer (1%, max $10)                             │		
│  ☐ PayPal                                                      │		
│                                                                 │		
│  Expiration                                                     │		
│  ○ Never expire                                                 │		
│  ○ Expire after: [30] days                                     │		
│  ○ Expire on: [Select Date 📅]                                 │		
│                                                                 │		
│  Limit Uses                                                     │		
│  ☐ Limit to [1] payment(s)                                     │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  Your Payment Link:                                             │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ https://pay.haypbooks.com/pl_abc123xyz                  │   │		
│  │                                          [Copy] [QR Code]│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Create Link]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Action | Debit | Credit |		
|--------|-------|--------|		
| Create Link | No entry | |		
| Payment Received | Bank Account (less fees) | Sales Revenue |		
| | Credit Card Fee Expense | |		
		
---		
		
## Recurring Invoices		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔄 Recurring Invoices                          [+ New Recurring Invoice]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Active      │ Monthly $   │ Next Run    │ Total Runs  │                │		
│  │ 8 templates │ $12,500/mo  │ Dec 20      │ 156 this yr │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 RECURRING INVOICE LIST                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Template Name   │ Customer  │ Amount   │ Frequency│ Next Run │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Monthly Retainer│ Acme Corp │ $2,500   │ Monthly  │ Dec 20   │   ⋮    ││		
│  │ Consulting      │           │          │ Day 20   │ ⏳ 4 days│ [Pause]││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Software License│ XYZ Ltd   │ $500     │ Monthly  │ Jan 01   │   ⋮    ││		
│  │ SaaS Monthly    │           │          │ 1st      │ ✅ Active│        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Quarterly Audit │ Smith Co  │ $3,000   │ Quarterly│ Jan 15   │   ⋮    ││		
│  │ Audit Services  │           │          │          │ ✅ Active│        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Annual Support  │ Brown Inc │ $12,000  │ Yearly   │ Mar 01   │   ⋮    ││		
│  │ Maintenance     │           │          │          │ ⏸️ Paused│ [Resume]│		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Create Recurring Invoice Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  New Recurring Invoice                                    [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Template Name *                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., Monthly Retainer - Acme Corp                      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Customer *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Acme Corporation                                       ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  🔄 SCHEDULE                                                    │		
│                                                                 │		
│  Frequency *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Monthly ▼]  Options: Daily, Weekly, Monthly, Yearly    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Run On                                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Day [20] of each month                                │   │		
│  │ ○ Last day of each month                                │   │		
│  │ ○ Every [2] weeks on [Monday ▼]                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Start Date *               End Date                           │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Jan 01, 2025      📅│    │ ○ Never    ○ On: [📅]       │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Max Occurrences                                                │		
│  ☐ Stop after [12] invoices                                    │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📋 INVOICE DETAILS                                             │		
│                                                                 │		
│  Line Items:                                                    │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Description         │ Qty │ Rate     │ Amount              ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Monthly Retainer    │ 1   │ $2,500.00│ $2,500.00          ││		
│  │ Consulting Services │     │          │                     ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ [+ Add Line]                                                ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  Total: $2,500.00                                               │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  ⚙️ OPTIONS                                                     │		
│                                                                 │		
│  ☑ Send invoice automatically                                  │		
│  │   Email to: billing@acme.com                                │		
│  │                                                             │		
│  ☐ Create as draft (review before sending)                     │		
│  ☑ Include payment link                                        │		
│  ☐ Add late payment reminder                                   │		
│                                                                 │		
│                                    [Cancel]  [Create Template]  │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Action | Debit | Credit |		
|--------|-------|--------|		
| Create Template | No entry (template only) | |		
| Generate Invoice | Accounts Receivable | Sales Revenue |		
| | | Sales Tax Payable |		
		
---		
		
## Products & Services		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📦 Products & Services                          [+ Add Product/Service]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search products...        [Type: All ▼] [Category: All ▼]       │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Products    │ Services    │ Bundles     │ Total Items │                │		
│  │ 45          │ 23          │ 5           │ 73          │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (73)] [Products (45)] [Services (23)] [Bundles (5)] [Inactive (12)]   │		
│                                                                              │		
│  📋 PRODUCT/SERVICE LIST                                                     │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ ☑ │ Type │ Name        │ SKU    │ Category  │ Price   │ Stock │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ 📦   │ Widget Pro  │ WGT-001│ Products  │ $150.00 │ 234   │   ⋮   ││		
│  │   │      │ Premium widget│      │           │         │ ✅    │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ 📦   │ Gadget Basic│ GDT-002│ Products  │ $85.00  │ 12    │   ⋮   ││		
│  │   │      │ Standard gadget │    │           │         │ ⚠️ Low│ [Reorder]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ ⚙️   │ Consulting  │ SVC-001│ Services  │ $150.00 │ N/A   │   ⋮   ││		
│  │   │      │ Hourly consulting│    │           │ /hr     │       │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ 📦   │ Website Pkg │ BND-001│ Bundle    │ $5,000  │ N/A   │   ⋮   ││		
│  │   │      │ 5-page website   │    │           │         │       │       ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add Product/Service Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Product/Service                                      [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Type *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Inventory Item    ○ Service    ○ Non-Inventory Item   │   │		
│  │    (Track stock)       (No stock)   (No stock tracking) │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📋 BASIC INFO                                                  │		
│                                                                 │		
│  Name *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Widget Pro                                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  SKU / Item Code                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ WGT-001                                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Category *                Subcategory                          │		
│  ┌─────────────────────┐   ┌─────────────────────────────┐    │   │		
│  │ Products          ▼ │   │ Electronics               ▼ │    │   │		
│  └─────────────────────┘   └─────────────────────────────┘    │   │		
│                                                                 │		
│  Description                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Premium quality widget with advanced features           │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💰 PRICING                                                     │		
│                                                                 │		
│  Sales Price *              Cost Price                          │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ $ 150.00            │    │ $ 75.00                     │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Income Account *           Expense Account                     │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Sales Income      ▼ │    │ Cost of Goods Sold        ▼ │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Taxable                                                        │		
│  ☑ This item is taxable                                        │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📦 INVENTORY (for Inventory Items)                             │		
│                                                                 │		
│  Opening Stock *            Reorder Point                       │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ 100                 │    │ 20                          │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Inventory Asset Account    Preferred Vendor                    │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Inventory Assets  ▼ │    │ ABC Supply               ▼ │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Warehouse Location                                             │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Main Warehouse                                       ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📷 IMAGE                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │                                                         │   │		
│  │          [Upload Image]                                 │   │		
│  │                                                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Save Product]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Item Type | Sales Entry | Purchase Entry |		
|-----------|-------------|----------------|		
| Inventory | Debit: AR, Credit: Sales | Debit: Inventory, Credit: AP |		
| Service | Debit: AR, Credit: Sales | Debit: Expense, Credit: AP |		
| Non-Inventory | Debit: AR, Credit: Sales | Debit: Expense, Credit: AP |		
		
---		
		
## Revenue		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💰 Revenue                                            [Export] [Refresh]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 REVENUE SUMMARY                                                          │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ This Month  │ Last Month  │ This Quarter│ This Year   │                │		
│  │ $89,450     │ $78,230     │ $234,560    │ $985,340    │                │		
│  │ ↑ 14%       │             │ ↑ 8%        │ ↑ 12%       │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📈 REVENUE TREND (Last 12 Months)                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  $120K├──────────────────────────────────────────────────────────    │ │		
│  │        │                                        ╭──────────╮         │ │		
│  │  $100K│─────────────────────────────────────────╯          ╰─────   │ │		
│  │        │                           ╭─────────╮                      │ │		
│  │   $80K│────────────────────────────╯         ╰──────────────────   │ │		
│  │        │              ╭──────╮                                     │ │		
│  │   $60K│──────────────╯      ╰──────────────────────────────────   │ │		
│  │        └──────────────────────────────────────────────────────────   │ │		
│  │         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 REVENUE BY CATEGORY                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Product Sales        ████████████████████████████████  $54,230 (61%)│ │		
│  │  Services             ████████████████████              $28,450 (32%)│ │		
│  │  Subscriptions        ███████                           $5,340  (6%) │ │		
│  │  Other                ███                               $1,430  (1%) │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 REVENUE BY CUSTOMER (Top 10)                                            │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ Customer         │ This Month │ YTD       │ % of Total │ Trend       │ │		
│  ├───────────────────────────────────────────────────────────────────────┤ │		
│  │ Acme Corp        │ $25,000    │ $125,000  │ 12.7%      │ ↑ 15%       │ │		
│  │ XYZ Ltd          │ $18,500    │ $89,000   │ 9.0%       │ ↑ 8%        │ │		
│  │ Smith Co         │ $12,000    │ $67,000   │ 6.8%       │ → 0%        │ │		
│  │ Brown Inc        │ $8,900     │ $52,000   │ 5.3%       │ ↑ 22%       │ │		
│  │ Johnson LLC      │ $6,500     │ $45,000   │ 4.6%       │ ↓ 5%        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 RECENT REVENUE TRANSACTIONS                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ Type    │ Customer   │ Description      │ Amount    │ Reference ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Invoice│ Acme Corp  │ Invoice #1043   │ $5,200    │ [View]    ││		
│  │ Dec 14│ Invoice│ XYZ Ltd    │ Invoice #1042   │ $2,500    │ [View]    ││		
│  │ Dec 13│ Payment│ Smith Co   │ Payment for Inv │ $8,500    │ [View]    ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Revenue Recognition		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📅 Revenue Recognition (ASC 606)                        [New Arrangement]  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 RECOGNITION SUMMARY                                                      │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Deferred    │ Recognized  │ This Month  │ Upcoming    │                │		
│  │ Revenue     │ YTD         │ Recognized  │ Recognition │                │		
│  │ $45,000     │ $234,560    │ $18,500     │ $12,000     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [Arrangements] [Schedules] [Deferred Revenue] [Reports]                     │		
│                                                                              │		
│  📋 REVENUE ARRANGEMENTS                                                     │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Contract    │ Customer  │ Total   │ Recognized│ Deferred│ Status│Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ CTR-001     │ Acme Corp │ $50,000 │ $30,000   │ $20,000 │ Active│  ⋮  ││		
│  │ Software License         │         │           │         │       │     ││		
│  │ 12-month license         │         │           │         │       │     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ CTR-002     │ XYZ Ltd   │ $25,000 │ $12,500   │ $12,500 │ Active│  ⋮  ││		
│  │ Implementation Project   │         │           │         │       │     ││		
│  │ 6-month project          │         │           │         │       │     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ CTR-003     │ Smith Co  │ $15,000 │ $15,000   │ $0      │ Done  │  ⋮  ││		
│  │ Annual Support           │         │           │         │       │     ││		
│  │ ✅ Fully recognized      │         │           │         │       │     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📅 UPCOMING RECOGNITION SCHEDULE                                            │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Contract  │ Customer  │ Amount   │ Performance Obligation    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 31 │ CTR-001   │ Acme Corp │ $4,167   │ Monthly license revenue   ││		
│  │ Dec 31 │ CTR-002   │ XYZ Ltd   │ $2,083   │ Implementation milestone  ││		
│  │ Jan 31 │ CTR-001   │ Acme Corp │ $4,167   │ Monthly license revenue   ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  [Run Recognition] [View Schedule] [Export]                                  │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Initial Invoice (Deferred) | Accounts Receivable | Deferred Revenue |		
| Monthly Recognition | Deferred Revenue | Sales Revenue |		
| Straight-line Adjustment | Deferred Revenue | Revenue (or contra) |		
		
---		
		
## Collections		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📥 Collections                                        [Send All Reminders]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 COLLECTIONS SUMMARY                                                      │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total AR    │ Overdue     │ 30+ Days    │ 60+ Days    │                │		
│  │ $45,890     │ $12,340     │ $5,200      │ $1,500      │                │		
│  │             │ ⚠️ 8 invoices│ ⚠️ 3 invoices│ 🔴 1 invoice│                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 AGING BUCKETS                                                            │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Current      1-30 Days    31-60 Days   61-90 Days   90+ Days        │ │		
│  │  ██████████   ████████     ████         ██           █               │ │		
│  │  $33,550      $5,200       $3,500       $2,340       $1,300          │ │		
│  │  73%          11%          8%           5%           3%               │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 OVERDUE INVOICES                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Invoice │ Customer  │ Due Date │ Days Over│ Amount  │ Last Contact│Act ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ #1041   │ Smith Co  │ Dec 10  │ 6 days   │ $3,500  │ Never       │[⋯] ││		
│  │         │           │         │          │         │             │[Remind]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ #1038   │ XYZ Ltd   │ Dec 05  │ 11 days  │ $2,800  │ Dec 08      │[⋯] ││		
│  │         │           │         │          │         │ Email sent  │[Call]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ #1035   │ Brown Inc │ Nov 28  │ 18 days  │ $2,500  │ Dec 01      │[⋯] ││		
│  │         │           │         │          │         │ 2 reminders │[Escalate]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ #1028   │ Johnson   │ Nov 15  │ 31 days  │ $1,500  │ Nov 20      │[⋯] ││		
│  │         │           │         │          │         │ 3 reminders │[WriteOff]│		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 BULK ACTIONS                                                            │		
│  [Send Reminders (4)] [Print Statements] [Export Aging] [Create Payment Plan]│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Send Reminder Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Send Payment Reminder                                    [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Customer: Smith Co                                             │		
│  Invoice: #1041                                                 │		
│  Amount Due: $3,500                                             │		
│  Days Overdue: 6                                                │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  Reminder Type:                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Friendly Reminder (1st)                                │   │		
│  │ ○ Second Notice (2nd)                                    │   │		
│  │ ○ Final Notice (3rd)                                     │   │		
│  │ ○ Collection Letter                                      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Send To:                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ☑ billing@smithco.com (Billing)                         │   │		
│  │ ☐ mike@smithco.com (Primary Contact)                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Email Subject:                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Friendly Reminder: Invoice #1041 from Acme Corp          │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Message:                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Hi Smith Co Team,                                       │   │		
│  │                                                          │   │		
│  │ This is a friendly reminder that Invoice #1041 for      │   │		
│  │ $3,500.00 was due on December 10, 2024.                 │   │		
│  │                                                          │   │		
│  │ [View Invoice & Pay Online]                              │   │		
│  │                                                          │   │		
│  │ If you have any questions, please don't hesitate to     │   │		
│  │ reach out.                                               │   │		
│  │                                                          │   │		
│  │ Thank you!                                               │   │		
│  │ Acme Corp                                                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ☐ Attach invoice PDF                                          │		
│  ☐ Include payment link                                        │		
│  ☑ Schedule for: [Now ▼]                                       │		
│                                                                 │		
│                                    [Cancel]  [Send Reminder]    │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
*(Continuing with EXPENSES & PROCUREMENT...)*		
		
---		
		
# 💸 EXPENSES & PROCUREMENT		
		
## Overview		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💸 Expenses Overview                                                        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 KEY METRICS                                                              │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total AP    │ Overdue     │ This Month  │ Avg. Days   │                │		
│  │ $28,450     │ $5,200      │ $45,890     │ 28 days     │                │		
│  │ ↓ 5%        │ ⚠️ 3 bills  │ ↑ 8%        │ Target: 30  │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📈 SPENDING TREND (Last 12 Months)                                         │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  $60K ├──────────────────────────────────────────────────────────    │ │		
│  │        │         ╭──────╮         ╭──────╮                          │ │		
│  │  $50K │─────────╯      ╰─────────╯      ╰──────────────────────    │ │		
│  │        │  ╭──────╮                          ╭──────╮                │ │		
│  │  $40K │──╯      ╰──────────────────────────╯      ╰────────────    │ │		
│  │        │                                                          │ │		
│  │  $30K ├──────────────────────────────────────────────────────────    │ │		
│  │        └──────────────────────────────────────────────────────────   │ │		
│  │         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 EXPENSE BY CATEGORY                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Payroll         ████████████████████████████████████████  $18,500  │ │		
│  │  Rent            ██████████████████                        $6,200   │ │		
│  │  Software        ██████████████                            $4,800   │ │		
│  │  Marketing       ██████████                                $3,200   │ │		
│  │  Office          ████████                                  $2,500   │ │		
│  │  Travel          ██████                                    $1,800   │ │		
│  │  Other           ████                                      $1,200   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 BILLS STATUS                                                             │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Draft (3)     Open (15)     Partial (2)    Paid (45)    Overdue (3) │ │		
│  │  █████         ████████████  ████           ████████████████████ ████│ │		
│  │  $2,500        $28,450       $3,500         $89,000       $5,200     │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 ACTIONS NEEDED                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔴 3 overdue bills totaling $5,200                      [View All]  │   │		
│  │ 🟡 5 bills due this week                                [View All]  │   │		
│  │ 🟢 3 pending approvals                                   [View All]  │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  ⚡ QUICK ACTIONS                                                            │		
│  [+ New Bill] [+ New Expense] [+ Pay Bills] [1099 Review]                    │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Vendors		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏢 Vendors                                        [+ Add Vendor] [Import]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search vendors...        [Status: All ▼] [1099: All ▼]          │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total       │ Active      │ Open Balance│ 1099 Vendors│                │		
│  │ 89          │ 78          │ $28,450     │ 12          │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 VENDOR LIST                                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ ☑ │ Name          │ Contact     │ Balance  │ 1099   │ Status │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ ABC Supply    │ John Doe    │ $3,500   │ ☐ No   │ Active │   ⋮   ││		
│  │   │ abcsupply.com  │ john@abc   │ 2 bills  │        │        │       ││		
│  │   │ Net 30         │             │          │        │        │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ Tech Services │ Jane Smith  │ $0       │ ☑ Yes  │ Active │   ⋮   ││		
│  │   │ techserv.com   │ jane@tech  │ Paid up  │        │        │       ││		
│  │   │ Due on Receipt │             │          │        │        │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ☐ │ Office Depot  │ -           │ $850     │ ☐ No   │ Active │   ⋮   ││		
│  │   │ officedepot.com│            │ 1 bill   │        │        │       ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add Vendor Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Vendor                                               [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  📋 VENDOR INFO                                                 │		
│                                                                 │		
│  Display Name *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ABC Supply Company                                      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Company Name                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ABC Supply Company, Inc.                                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Email                        Phone                             │		
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │		
│  │ ap@abcsupply.com        │   │ (555) 987-6543              │ │		
│  └─────────────────────────┘   └─────────────────────────────┘ │		
│                                                                 │		
│  Website                      Vendor ID                         │		
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │		
│  │ www.abcsupply.com       │   │ VEN-001                     │ │		
│  └─────────────────────────┘   └─────────────────────────────┘ │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📍 ADDRESS                                                     │		
│                                                                 │		
│  Street Address                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 456 Industrial Park Blvd                                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  City                    State           ZIP                    │		
│  ┌───────────────────┐   ┌───────────┐   ┌───────────────┐    │   │		
│  │ Chicago           │   │ IL      ▼│   │ 60601         │    │   │		
│  └───────────────────┘   └───────────┘   └───────────────┘    │   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💳 PAYMENT & BILLING                                           │		
│                                                                 │		
│  Payment Terms *               Currency                         │		
│  ┌─────────────────────┐       ┌─────────────────────┐        │		
│  │ Net 30            ▼ │       │ USD               ▼ │        │		
│  └─────────────────────┘       └─────────────────────┘        │		
│                                                                 │		
│  Opening Balance               As of Date                       │		
│  ┌─────────────────────┐       ┌─────────────────────┐        │		
│  │ $ 0.00              │       │ Dec 16, 2024      📅│        │		
│  └─────────────────────┘       └─────────────────────┘        │		
│                                                                 │		
│  Default Expense Account                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Office Supplies                                      ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📋 1099 INFORMATION                                            │		
│                                                                 │		
│  1099 Eligible                                                  │		
│  ┑ ☐ Yes, this vendor is eligible for 1099 reporting          │		
│  │                                                              │		
│  │ Tax ID Type        Tax ID                                   │		
│  │ ┌─────────────┐    ┌─────────────────────────────────────┐ │		
│  │ │ EIN       ▼│    │ 12-3456789                          │ │		
│  │ └─────────────┘    └─────────────────────────────────────┘ │		
│  │                                                              │		
│  │ 1099 Type                                                   │		
│  │ ┌─────────────────────────────────────────────────────────┐│		
│  │ │ NEC (Nonemployee Compensation)                       ▼ ││		
│  │ └─────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  🏷️ ADDITIONAL INFO                                             │		
│                                                                 │		
│  Tags                                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Supplies] [Preferred] [+]                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Notes                                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Primary supplier for office materials                   │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Save Vendor]      │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Add Vendor with Opening Balance | Expense/Purchases | Accounts Payable |		
		
---		
		
## Bills		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🧾 Bills                                               [+ New Bill] [Import]  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search bills...                                                  │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Status: All ▼] [Vendor: All ▼] [Date: This Month ▼]              │   │		
│  │ [Due Date: All ▼] [Amount: All ▼] [Overdue: All ▼]                │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total AP    │ Draft       │ Overdue     │ Due This Wk │                │		
│  │ $28,450     │ $2,500      │ $5,200      │ $8,500      │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (68)] [Draft (3)] [Open (15)] [Partial (2)] [Paid (45)] [Overdue (3)] │		
│                                                                              │		
│  📋 BILL LIST                                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ #    │ Date   │ Vendor      │ Due Date  │ Amount  │ Status    │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ B-92 │ Dec 15 │ ABC Supply  │ Jan 14    │ $3,500  │ Open      │   ⋮    ││		
│  │      │        │             │           │         │           │ [Pay]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ B-91 │ Dec 12 │ Tech Corp   │ Dec 20    │ $8,500  │ Due Soon  │   ⋮    ││		
│  │      │        │             │ 4 days    │         │ ⚠️ Dec 20 │ [Pay]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ B-90 │ Dec 10 │ Office Dep  │ Dec 10    │ $1,200  │ Overdue   │   ⋮    ││		
│  │      │        │             │ 6 days    │         │ 🔴 Overdue│ [Pay]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ B-89 │ Dec 08 │ XYZ Ltd     │           │ $850    │ Draft     │   ⋮    ││		
│  │      │        │             │           │         │ 📝 Review │[Approve]│		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 SELECTED: 0 bills    [Batch Pay] [Print Checks] [Export] [Void]         │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Bill Page		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🧾 New Bill                                          [Save Draft] [Save & Approve]│		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  ┌─────────────────────────────────────┬────────────────────────────────┐  │		
│  │ FROM:                               │ BILL TO:                        │  │		
│  │ Acme Corporation, Inc.              │ [Select Vendor ▼]               │  │		
│  │ 123 Business Park Drive             │                                 │  │		
│  │ New York, NY 10001                  │ Vendor details appear here      │  │		
│  │                                     │ after selection                 │  │		
│  │                                     │                                 │  │		
│  │                                     │ Terms: Net 30                   │  │		
│  └─────────────────────────────────────┴────────────────────────────────┘  │		
│                                                                              │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Bill #      │ Bill Date   │ Due Date    │ Terms          │ PO #      │ │		
│  │ B-93        │ Dec 16, 2024│ Jan 15, 2025│ Net 30       ▼│           │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 LINE ITEMS                                                               │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Description           │ Qty │ Rate     │ Amount   │ Account  │ Actions │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ [Product/Service ▼]   │ [1] │ [$0.00] │ $0.00   │ [Exp Acct▼]│ [X]    │ │		
│  │ [Description...]      │     │          │          │           │         │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Office Supplies       │ 10  │ $25.00   │ $250.00  │ Office Sup│ [X]     │ │		
│  │ Paper and pens        │     │          │          │           │         │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Computer Equipment    │ 2   │ $500.00  │ $1,000.00│ Equipment │ [X]     │ │		
│  │ Monitors              │     │          │          │           │         │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ [+ Add Line]                                                          │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ┌──────────────────────────────────────┬─────────────────────────────────┐│		
│  │                                      │ Subtotal:       $1,250.00       ││		
│  │ Vendor Message:                      │ Discount:       -$0.00          ││		
│  │ ┌────────────────────────────────┐   │ ─────────────────────           ││		
│  │ │ Thank you for your service!    │   │ Tax:            $100.00        ││		
│  │ │ Please send invoice to AP.     │   │ ─────────────────────           ││		
│  │ └────────────────────────────────┘   │ TOTAL:          $1,350.00       ││		
│  │                                      │                                 ││		
│  │ Memo (Internal):                     │ Amount Due:     $1,350.00       ││		
│  │ ┌────────────────────────────────┐   │                                 ││		
│  │ │ Internal notes                 │   │                                 ││		
│  │ └────────────────────────────────┘   │                                 ││		
│  └──────────────────────────────────────┴─────────────────────────────────┘│		
│                                                                              │		
│  📎 ATTACHMENTS                                                              │		
│  │ [Upload Invoice PDF] or drag and drop                                    │		
│                                                                              │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                              │		
│  [Save Draft] [Save & New] [Preview]                      [Save & Approve]   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Create Bill | Expense Account | Accounts Payable |		
| | (or Inventory Asset) | |		
| Pay Bill | Accounts Payable | Bank Account |		
| Early Payment Discount | Accounts Payable | Purchase Discount Income |		
		
---		
		
## Bill Payments		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💸 Bill Payments                                     [+ Pay Bills]           │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Paid Today  │ This Week   │ This Month  │ Total YTD   │                │		
│  │ $0          │ $12,500     │ $45,890     │ $523,450    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [Recent Payments] [Scheduled Payments] [Print Checks]                       │		
│                                                                              │		
│  📋 RECENT PAYMENTS                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Vendor      │ Bills Paid   │ Method  │ Amount   │ Actions    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ ABC Supply  │ B-88, B-89   │ ACH     │ $3,500   │ [View][Print]│		
│  │        │             │              │ Ref#1234│          │            ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14 │ Tech Corp   │ B-87         │ Check   │ $2,500   │ [View][Print]│		
│  │        │             │              │ Chk#1023│          │            ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 12 │ Office Dep  │ B-85, B-86   │ Credit  │ $1,200   │ [View]     ││		
│  │        │             │              │ Amex    │          │            ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📅 SCHEDULED PAYMENTS                                                       │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Vendor      │ Amount    │ Method    │ Status    │ Actions     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 20 │ Payroll     │ $12,000   │ ACH       │ Scheduled │ [Edit][Cancel]│		
│  │ Dec 22 │ Insurance   │ $3,500    │ Check     │ Scheduled │ [Edit][Cancel]│		
│  │ Dec 25 │ Rent        │ $5,000    │ ACH       │ Scheduled │ [Edit][Cancel]│		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Pay Bills Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Pay Bills                                                [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Payment Account *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Operating Account ***1234                    $85,230.00 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Date *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Method *                                               │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● ACH/EFT    ○ Check    ○ Credit Card    ○ Cash        │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Starting Check # (if Check)                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 1025                                                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  SELECT BILLS TO PAY:                                           │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ ☑ │ Vendor      │ Bill # │ Due Date │ Amount  │ Discount  ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ ☑ │ ABC Supply  │ B-92   │ Jan 14   │ $3,500  │ -$0.00   ││		
│  │ ☑ │ Tech Corp   │ B-91   │ Dec 20   │ $8,500  │ -$85.00  ││		
│  │ ☑ │ Office Dep  │ B-90   │ Dec 10   │ $1,200  │ -$0.00   ││		
│  │ ☐ │ XYZ Ltd     │ B-88   │ Dec 25   │ $2,500  │ -$0.00   ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Bills Selected: 3        Total: $13,200    Discounts: $85  ││		
│  │                                          ─────────────      ││		
│  │                              Amount to Pay: $13,115.00      ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ☐ Print checks after saving                                   │		
│  ☐ Send remittance advice to vendors                           │		
│                                                                 │		
│                                    [Cancel]  [Pay Selected]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Expenses		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💳 Expenses                                          [+ New Expense]         │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search expenses...       [Category: All ▼] [Vendor: All ▼]      │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ This Month  │ Billable    │ Pending     │ Total YTD   │                │		
│  │ $12,450     │ $3,500      │ 5 items     │ $145,230    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 EXPENSE LIST                                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ Vendor      │ Category      │ Amount   │ Billable│ Actions     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Shell Oil  │ Auto Expense  │ $85.00   │ ☐ No    │ [View][Edit]││		
│  │       │ Gas for company vehicle    │          │         │             ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14│ Office Dep │ Office Supp   │ $234.00  │ ☐ No    │ [View][Edit]││		
│  │       │ Monthly supplies           │          │         │             ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 12│ Client Din │ Meals         │ $150.00  │ ☑ Acme  │ [View][Inv] ││		
│  │       │ Business lunch             │          │         │             ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 10│ Uber       │ Travel        │ $45.00   │ ☐ No    │ [View][Edit]││		
│  │       │ Airport transport          │          │         │             ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 SELECTED: 0 expenses    [Export] [Mark Billable] [Delete]               │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Expense Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  New Expense                                              [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Who was this expense paid to?                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Select or add vendor...]              [+ Add New]      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Account *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Operating Account ***1234                              ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Payment Date *             Expense Date *                      │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Dec 16, 2024      📅│    │ Dec 16, 2024              📅│   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Payment Method *                                               │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Bank/Credit Card    ○ Cash    ○ Check                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Reference #                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ e.g., last 4 digits of card or check number             │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  CATEGORY DETAILS                                               │		
│                                                                 │		
│  Category *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Travel Expense                                       ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Description *                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Uber ride to airport for client meeting                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Amount *                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 45.00                                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Tax                                                            │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ☐ This expense includes tax                            │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💳 BILLABLE EXPENSE                                           │		
│                                                                 │		
│  ☐ Bill to customer                                            │		
│  │   ┌─────────────────────────────────────────────────────┐│   │		
│  │   │ [Select Customer ▼]                                 ││   │		
│  │   └─────────────────────────────────────────────────────┘│   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📎 ATTACHMENTS                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Upload Receipt] or drag and drop                       │   │		
│  │                                                         │   │		
│  │ Attached: receipt_uber.pdf (125 KB) [Remove]            │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Tags                                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Client Meeting] [Travel] [+]                           │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Save Expense]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Create Expense | Expense Account | Bank Account |		
| Mark Billable | Accounts Receivable | Expense Reimbursement |		
| Invoice Billable | N/A | Links to invoice |		
		
---		
		
## Receipts		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📎 Receipts                                           [+ Upload Receipt]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Unmatched   │ Matched     │ This Month  │ Total $     │                │		
│  │ 12 receipts │ 89 receipts │ 23 receipts │ $4,523.00   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📤 UPLOAD AREA                                                              │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │     📎 Drag and drop receipts here                                    │ │		
│  │        or click to browse files                                        │ │		
│  │                                                                        │ │		
│  │        Supports: JPG, PNG, PDF  (Max 10MB each)                       │ │		
│  │                                                                        │ │		
│  │     📧 Or email receipts to: receipts@yourcompany.haypbooks.com       │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (101)] [Needs Review (12)] [Matched (89)]                             │		
│                                                                              │		
│  📋 RECEIPT LIST                                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Vendor      │ Amount   │ Status    │ Matched To   │ Actions   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ Shell Oil   │ $85.00   │ ✅ Matched│ Bank Trans   │ [View]    ││		
│  │        │ Gas receipt │          │           │ Dec 15       │           ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14 │ Office Dep  │ $234.00  │ ⚠️ Review │ Suggested:   │ [Match]   ││		
│  │        │ Supplies    │          │           │ Bank Trans   │ [Create]  ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 12 │ Restaurant  │ $150.00  │ ⚠️ Review │ No match     │ [Create]  ││		
│  │        │ Client lunch│          │           │ found        │ [Exclude] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Receipt Review Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Review Receipt                                           [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  ┌──────────────────────────────────────────────────────────┐  │		
│  │                                                           │  │		
│  │                    [RECEIPT IMAGE]                        │  │		
│  │                                                           │  │		
│  │                                                           │  │		
│  │                 Shell Oil Station                        │  │		
│  │                 Dec 15, 2024                              │  │		
│  │                 Amount: $85.00                           │  │		
│  │                                                           │  │		
│  │                                        [Zoom] [Rotate]    │  │		
│  └──────────────────────────────────────────────────────────┘  │		
│                                                                 │		
│  🤖 EXTRACTED DATA (AI)                                         │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Vendor:     Shell Oil                            ✏️ Edit   ││		
│  │ Date:       Dec 15, 2024                         ✏️ Edit   ││		
│  │ Amount:     $85.00                               ✏️ Edit   ││		
│  │ Category:   Auto Expense (suggested)             ✏️ Edit   ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  🔍 POTENTIAL MATCHES                                           │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ ○ Bank Transaction: Dec 15 - Shell Oil $85.00    [Match]   ││		
│  │ ○ Expense Entry: Dec 15 - Gas $85.00             [Match]   ││		
│  │ ○ Create new expense                              [Create] ││		
│  │ ○ No match - exclude from books                   [Exclude]││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│                                    [Skip]  [Save & Next]        │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Mileage		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🚗 Mileage                                           [+ Add Mileage]         │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ This Month  │ This Year   │ Deduction   │ Rate        │                │		
│  │ 245 miles   │ 2,890 miles │ $1,734      │ $0.67/mile  │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 MILEAGE LIST                                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ From          │ To            │ Miles │ Purpose    │ Deduction││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Office        │ Client Site   │ 45    │ Meeting    │ $30.15   ││		
│  │       │ 123 Main St   │ 456 Oak Ave   │       │            │          ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 12│ Home          │ Airport       │ 32    │ Travel     │ $21.44   ││		
│  │       │ 789 Elm St    │ JFK Terminal  │       │            │          ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 10│ Office        │ Warehouse     │ 28    │ Delivery   │ $18.76   ││		
│  │       │ 123 Main St   │ 321 Industrial│       │            │          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🚗 VEHICLES                                                                 │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Vehicle           │ Year │ Total Miles │ Business Miles │ Personal   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Honda Accord      │ 2022 │ 15,234      │ 2,890          │ 12,344     ││		
│  │ Toyota Camry      │ 2021 │ 8,500       │ 0              │ 8,500      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  [+ Add Vehicle]                                                             │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add Mileage Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Mileage Entry                                        [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Date *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Vehicle *                                                      │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Honda Accord (2022)                                  ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📍 TRIP DETAILS                                                │		
│                                                                 │		
│  Start Location *                                               │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Office - 123 Main St, New York, NY                     │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  End Location *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Client Site - 456 Oak Ave, Brooklyn, NY                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Round Trip                                                     │		
│  ☐ This is a round trip (double the mileage)                   │		
│                                                                 │		
│  Miles *                                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 45                                                      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  OR use GPS to calculate:                                       │		
│  [Calculate Distance]                                           │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📋 PURPOSE                                                     │		
│                                                                 │		
│  Purpose *                                                      │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Client meeting - Project kickoff                        │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Client/Project (Optional)                                      │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Acme Corp                                            ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Billable                                                       │		
│  ☐ Bill this mileage to client                                 │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💰 DEDUCTION                                                   │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Miles: 45 x IRS Rate ($0.67) = $30.15 deduction            ││		
│  │                                                             ││		
│  │ Current IRS Standard Mileage Rate: $0.67 per mile          ││		
│  │ Last updated: Jan 1, 2024                     [Update Rate] ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│                                    [Cancel]  [Save Mileage]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Record Mileage | Mileage Expense | Employee Reimbursement or Owner's Equity |		
		
---		
		
## Contractors		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  👷 Contractors                                       [+ Add Contractor]      │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Active      │ YTD Payments│ 1099 Amount │ Due         │                │		
│  │ 12          │ $45,890     │ $38,500     │ $5,200      │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 CONTRACTOR LIST                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Name          │ Service       │ YTD Paid │ 1099 Elig │ W-9  │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith    │ Consulting    │ $12,500  │ ☑ Yes    │ ✅   │   ⋮     ││		
│  │ john@smith.com│               │          │          │      │         ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Jane Doe      │ Design        │ $8,900   │ ☑ Yes    │ ✅   │   ⋮     ││		
│  │ jane@doe.com  │               │          │          │      │         ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Mike Johnson  │ Development   │ $15,000  │ ☐ No     │ ❌   │   ⋮     ││		
│  │ mike@j.com    │ (Employee)    │          │          │ [Request]│       ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 W-9 STATUS                                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ ⚠️ 3 contractors missing W-9 forms                      [Send Requests] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## 1099s		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 1099 Reports                                   [Prepare 1099s] [E-File]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 1099 TAX YEAR                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Tax Year: [2024 ▼]                                                  │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Vendors     │ Total Amount│ Forms Ready │ Filed       │                │		
│  │ 12 eligible │ $38,500     │ 10/12       │ ❌ Not yet  │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 1099 PREPARATION CHECKLIST                                               │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ ✅ All contractor payments reviewed                                    ││		
│  │ ✅ W-9 forms collected (10/12)                                         ││		
│  │ ⚠️ Missing W-9 forms (2 vendors)                        [Send Request]  ││		
│  │ ⚠️ Verify TIN numbers before filing                     [Verify Now]    ││		
│  │ ❌ Print and mail copies to contractors                                 ││		
│  │ ❌ E-File with IRS                                                      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 1099-NEC VENDORS                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Vendor        │ TIN         │ Amount    │ W-9  │ Form Status │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith    │ ***-**-6789 │ $12,500   │ ✅   │ Ready       │ [View]  ││		
│  │ Jane Doe      │ ***-**-1234 │ $8,900    │ ✅   │ Ready       │ [View]  ││		
│  │ Sarah Jones   │ ***-**-5678 │ $7,200    │ ✅   │ Ready       │ [View]  ││		
│  │ Mike Brown    │ Missing     │ $5,500    │ ❌   │ Needs W-9   │ [Request]│		
│  │ Tom Wilson    │ ***-**-9012 │ $4,400    │ ✅   │ Ready       │ [View]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  [Export for Review] [Print Forms] [E-File with IRS]                         │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### 1099 Form Preview		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  1099-NEC Form Preview                                    [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  ┌──────────────────────────────────────────────────────────┐  │		
│  │                                                           │  │		
│  │              FORM 1099-NEC                                │  │		
│  │         Nonemployee Compensation                         │  │		
│  │                                                           │  │		
│  │  PAYER'S name, street address, city, state, ZIP          │  │		
│  │  Acme Corporation, Inc.                                   │  │		
│  │  123 Business Park Drive                                  │  │		
│  │  New York, NY 10001                                       │  │		
│  │  TIN: 12-3456789                                          │  │		
│  │                                                           │  │		
│  │  RECIPIENT'S name, street address, city, state, ZIP      │  │		
│  │  John Smith                                               │  │		
│  │  456 Consultant Lane                                      │  │		
│  │  Brooklyn, NY 11201                                       │  │		
│  │  TIN: ***-**-6789                                         │  │		
│  │                                                           │  │		
│  │  Box 1: Nonemployee compensation                         │  │		
│  │  $ 12,500.00                                              │  │		
│  │                                                           │  │		
│  │  Account Number: 001                                      │  │		
│  │                                                           │  │		
│  └──────────────────────────────────────────────────────────┘  │		
│                                                                 │		
│  [Download PDF] [Print] [Email to Contractor]                   │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Procurement *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📦 Procurement                                         [+ New Requisition]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [Purchase Requisitions] [Approval Workflows] [Vendor Portal]                │		
│                                                                              │		
│  📊 PROCUREMENT SUMMARY                                                      │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Pending     │ Approved    │ PO Created  │ This Month  │                │		
│  │ 5 requests  │ 12 requests │ 8           │ $45,890     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 PURCHASE REQUITIONS                                                      │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ REQ # │ Date   │ Requester  │ Description  │ Amount  │ Status  │Action ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PR-45 │ Dec 15 │ John Smith │ Laptops (5)  │ $5,000  │ Pending │[Approve]│		
│  │       │        │ IT Dept    │              │         │ ⏳ Level 1│       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PR-44 │ Dec 14 │ Sarah Jones│ Office Furn  │ $2,500  │ Approved│[Create]│		
│  │       │        │ Admin      │              │         │ ✅       │  PO   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PR-43 │ Dec 12 │ Mike Brown │ Software Lic │ $12,000 │ Pending │[Approve]│		
│  │       │        │ IT Dept    │              │         │ ⏳ Level 2│       ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Approval Workflows Table		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 APPROVAL WORKFLOWS                                  [+ Create Workflow]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Workflow Name      │ Trigger          │ Approvers     │ Status│Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Standard Purchase  │ Amount < $5,000  │ Manager       │ ✅ On │   ⋮   ││		
│  │                    │                  │               │       │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Large Purchase     │ $5,000 - $25,000 │ Manager → CFO │ ✅ On │   ⋮   ││		
│  │                    │                  │               │       │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Executive Approval │ Amount > $25,000 │ Manager→CFO→CEO│ ✅ On│   ⋮   ││		
│  │                    │                  │               │       │        ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
*(Due to the extensive nature of this document, I'll continue with the remaining sections: PROJECTS, TIME, INVENTORY, PAYROLL & WORKFORCE, ACCOUNTING, REPORTS, TAXES, COMPLIANCE, AUTOMATION, ACCOUNTANT WORKSPACE, FINANCIAL SERVICES, APPS & INTEGRATIONS, and SETTINGS in the next message.)*		
		
---		
# Haypbooks v2 — Complete Page Specifications (Continued)		
		
Continuing from Expenses & Procurement...		
		
---		
		
# 📁 PROJECTS		
		
## Overview		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📁 Projects Overview                                  [+ New Project]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 KEY METRICS                                                              │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Active      │ Total Revenue│ Avg Margin │ Hours Billed│                │		
│  │ 12 projects │ $234,560    │ 32%         │ 1,245 hrs   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 PROJECT STATUS                                                           │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Not Started (2)   In Progress (8)   On Hold (1)   Completed (15)    │ │		
│  │  ████              ████████████████  ████           ████████████████ │ │		
│  │  $15,000           $125,000          $8,500         $186,060         │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 PROFITABILITY CHART                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Project             Revenue      Cost       Profit      Margin      │ │		
│  │                                                                        │ │		
│  │  Website Redesign    $50,000      $32,000    $18,000     ████████████36%│		
│  │  Mobile App          $85,000      $58,000    $27,000     ██████████████32%│		
│  │  ERP Implementation  $120,000     $78,000    $42,000     ███████████████35%│		
│  │  Consulting Q4       $45,000      $28,000    $17,000     ██████████████38%│		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 PROJECTS NEEDING ATTENTION                                               │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ ⚠️ Project Alpha - Over budget by 15%                    [View]      │   │		
│  │ ⚠️ Website Redesign - 3 tasks overdue                    [View]      │   │		
│  │ 🔴 Mobile App - Milestone delayed 5 days                 [View]      │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  ⚡ QUICK ACTIONS                                                            │		
│  [+ New Project] [Time Entry] [Project Report]                               │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Projects		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📁 Projects                                           [+ New Project]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search projects...                                                 │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Status: All ▼] [Customer: All ▼] [Manager: All ▼] [Date: All ▼]   │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total       │ Active      │ Completed   │ Total Value │                │		
│  │ 28 projects │ 12          │ 15          │ $485,230    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 VIEW TOGGLE                                                              │		
│  [📋 List] [📊 Board] [📅 Timeline]                                          │		
│                                                                              │		
│  📋 PROJECT LIST                                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Project         │ Customer  │ Manager  │ Budget  │ Actual │ Status     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Website Redesign│ Acme Corp │ John     │ $50,000 │ $32,000│ 🟢 On Track││		
│  │ Dec 01 - Jan 31 │           │          │         │ 64%    │            ││		
│  │                                            [View] [Time] [Invoice]     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Mobile App Dev  │ XYZ Ltd   │ Sarah    │ $85,000 │ $58,000│ 🟡 At Risk ││		
│  │ Nov 15 - Feb 28 │           │          │         │ 68%    │            ││		
│  │                                            [View] [Time] [Invoice]     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ERP Implementation│ Smith Co│ Mike     │ $120,000│ $45,000│ 🟢 On Track││		
│  │ Dec 10 - Mar 31 │           │          │         │ 38%    │            ││		
│  │                                            [View] [Time] [Invoice]     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Consulting Q4   │ Brown Inc │ Jane     │ $45,000 │ $28,000│ 🔴 Over Bud││		
│  │ Oct 01 - Dec 31 │           │          │         │ 62%    │            ││		
│  │                                            [View] [Time] [Invoice]     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 Showing 1-10 of 28 projects                             [< Prev] [Next >]│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Project Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  New Project                                              [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  📋 PROJECT DETAILS                                             │		
│                                                                 │		
│  Project Name *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Website Redesign - Acme Corp                            │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Project Code                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ PRJ-2024-001                                            │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Customer *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Acme Corporation                                       ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Project Manager *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ John Smith                                             ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📅 TIMELINE                                                    │		
│                                                                 │		
│  Start Date *               End Date                            │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Dec 16, 2024      📅│    │ Jan 31, 2025              📅│   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💰 BUDGET                                                      │		
│                                                                 │		
│  Billing Type *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Fixed Price    ○ Time & Materials    ○ Non-Billable   │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Budget Amount *                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 50,000.00                                             │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Hourly Rate (for T&M)                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 150.00 / hour                                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Estimated Hours                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 333 hours                                               │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📋 MILESTONES                                                  │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Milestone          │ Due Date   │ Amount    │ Status       ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Discovery          │ Dec 23     │ $10,000   │ ☐ Not Started││		
│  │ Design Complete    │ Jan 07     │ $15,000   │ ☐ Not Started││		
│  │ Development        │ Jan 21     │ $15,000   │ ☐ Not Started││		
│  │ Final Delivery     │ Jan 31     │ $10,000   │ ☐ Not Started││		
│  │ [+ Add Milestone]                                           ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  👥 TEAM MEMBERS                                                │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Member        │ Role        │ Rate      │ Hours Allocated ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ John Smith    │ Project Mgr │ $150/hr   │ 50 hrs          ││		
│  │ Sarah Jones   │ Developer   │ $125/hr   │ 150 hrs         ││		
│  │ Mike Brown    │ Designer    │ $100/hr   │ 80 hrs          ││		
│  │ [+ Add Team Member]                                         ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  📝 Description                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Complete website redesign including new branding,       │   │		
│  │ responsive design, and e-commerce integration.          │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Tags                                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Website] [Design] [Development] [+]                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Create Project]    │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Project Detail Page		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📁 Website Redesign - Acme Corp                                             │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  [📋 Overview] [⏱️ Time] [💰 Billing] [📄 Documents] [💬 Notes]              │		
│                                                                              │		
│  📊 PROJECT SUMMARY                                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Status: 🟢 On Track        Progress: ████████████████░░░░ 75%       │ │		
│  │                                                                        │ │		
│  │  Start: Dec 01, 2024        End: Jan 31, 2025       Days Left: 46    │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 BUDGET VS ACTUAL                                                         │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │                  Budget          Actual          Variance             │ │		
│  │  Revenue         $50,000         $37,500         -$12,500 (75%)       │ │		
│  │  Labor Cost      $20,000         $15,200         +$4,800              │ │		
│  │  Expenses        $5,000          $3,800          +$1,200              │ │		
│  │  ─────────────────────────────────────────────────────                │ │		
│  │  Profit          $25,000         $18,500         -$6,500              │ │		
│  │  Margin          50%             49%             -1%                  │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 MILESTONES                                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Milestone         │ Due Date  │ Amount   │ Status     │ Progress       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ✅ Discovery      │ Dec 23    │ $10,000  │ Complete   │ ████████████100%││		
│  │ ✅ Design Complete│ Jan 07    │ $15,000  │ Complete   │ ████████████100%││		
│  │ 🔵 Development    │ Jan 21    │ $15,000  │ In Progress│ ████████░░░░ 60%││		
│  │ ⚪ Final Delivery │ Jan 31    │ $10,000  │ Not Started│ ░░░░░░░░░░░░   0%││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  👥 TEAM ALLOCATION                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Member        │ Allocated │ Logged  │ Remaining │ Rate    │ Cost       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith    │ 50 hrs    │ 38 hrs  │ 12 hrs    │ $150/hr │ $5,700     ││		
│  │ Sarah Jones   │ 150 hrs   │ 85 hrs  │ 65 hrs    │ $125/hr │ $10,625    ││		
│  │ Mike Brown    │ 80 hrs    │ 42 hrs  │ 38 hrs    │ $100/hr │ $4,200     ││		
│  │ Total         │ 280 hrs   │ 165 hrs │ 115 hrs   │         │ $20,525    ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  ⚡ QUICK ACTIONS                                                            │		
│  [+ Log Time] [+ Create Invoice] [+ Add Expense] [+ Add Note]                │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Project Invoice | Accounts Receivable | Project Revenue |		
| Project Expense | Project Expense | Accounts Payable/Bank |		
| Time Logged | Work in Progress | Labor Cost (internal) |		
		
---		
		
## Project Profitability		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📊 Project Profitability                               [Export Report]      │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 FILTERS                                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Date Range: This Year ▼] [Status: All ▼] [Customer: All ▼]        │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 OVERALL PROFITABILITY                                                    │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total Revenue│ Total Cost │ Gross Profit│ Avg Margin  │                │		
│  │ $485,230    │ $325,450   │ $159,780    │ 33%          │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📈 PROFITABILITY TREND                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  $50K ├──────────────────────────────────────────────────────────    │ │		
│  │        │                         ╭───────────────────╮               │ │		
│  │  $40K │──────────────────────────╯                   ╰────────────   │ │		
│  │        │           ╭─────────╮                                        │ │		
│  │  $30K │────────────╯         ╰───────────────────────────────────    │ │		
│  │        │   ╭──────╮                                                │ │		
│  │  $20K │───╯      ╰──────────────────────────────────────────────    │ │		
│  │        └──────────────────────────────────────────────────────────   │ │		
│  │         Q1      Q2      Q3      Q4                                   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 PROJECT PROFITABILITY TABLE                                              │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Project         │ Revenue    │ Cost      │ Profit    │ Margin │ Trend ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ ERP Implementation│ $120,000 │ $78,000  │ $42,000  │ 35%    │ ↑     ││		
│  │ Mobile App      │ $85,000    │ $58,000  │ $27,000  │ 32%    │ →     ││		
│  │ Website Redesign│ $50,000    │ $32,000  │ $18,000  │ 36%    │ ↑     ││		
│  │ Consulting Q4   │ $45,000    │ $28,000  │ $17,000  │ 38%    │ ↑     ││		
│  │ Marketing Camp  │ $35,000    │ $25,000  │ $10,000  │ 29%    │ ↓     ││		
│  │ Data Migration  │ $28,000    │ $22,000  │ $6,000   │ 21%    │ ↓     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 PROFITABILITY BY CUSTOMER                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Customer    │ Projects │ Revenue    │ Cost      │ Profit   │ Margin   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Acme Corp   │ 5        │ $125,000  │ $78,000  │ $47,000  │ 38%      ││		
│  │ XYZ Ltd     │ 3        │ $98,000   │ $65,000  │ $33,000  │ 34%      ││		
│  │ Smith Co    │ 4        │ $85,000   │ $58,000  │ $27,000  │ 32%      ││		
│  │ Brown Inc   │ 2        │ $45,000   │ $32,000  │ $13,000  │ 29%      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Project Billing *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💰 Project Billing                                     [+ Create Invoice]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 BILLING SUMMARY                                                          │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Billed      │ Unbilled    │ Overdue     │ Collected   │                │		
│  │ $234,560    │ $45,890     │ $12,500     │ $198,450    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 BILLING METHODS BY PROJECT                                               │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Project         │ Method        │ Total   │ Billed   │ Unbilled│ Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Website Redesign│ Fixed Price   │ $50,000 │ $25,000 │ $25,000 │[Invoice]│		
│  │ Mobile App      │ Time & Mat.   │ $58,000 │ $35,000 │ $23,000 │[Invoice]│		
│  │ ERP Implementation│ Milestone   │ $120,000│ $42,000 │ $78,000 │[Invoice]│		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 UNBILLED TIME & EXPENSES                                                 │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Project         │ Type    │ Hours │ Amount  │ Date Range  │ Actions    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Website Redesign│ Time    │ 45    │ $6,750  │ Dec 01-15   │ [Bill]     ││		
│  │ Mobile App      │ Time    │ 32    │ $4,000  │ Dec 10-16   │ [Bill]     ││		
│  │ ERP Implementation│ Expense│ -    │ $1,200  │ Dec 12      │ [Bill]     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 INVOICING HISTORY                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Invoice │ Project        │ Amount   │ Date    │ Status   │ Actions      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ INV-89 │ Website Redesign│ $10,000  │ Dec 23  │ ✅ Paid  │ [View]       ││		
│  │ INV-85 │ Mobile App      │ $15,000  │ Dec 15  │ ✅ Paid  │ [View]       ││		
│  │ INV-80 │ ERP Implementation│ $42,000│ Dec 01  │ ⏳ Pending│ [View][Send] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Resource Planning *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  👥 Resource Planning                                   [View Calendar]       │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 CAPACITY OVERVIEW                                                        │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Team Members│ Utilization │ Available   │ Overbooked  │                │		
│  │ 15          │ 78%         │ 120 hrs/wk  │ 2 members   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 UTILIZATION BY TEAM MEMBER                                               │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  John Smith      ████████████████████████████████████████  95% ⚠️    │ │		
│  │  Sarah Jones     ████████████████████████████████████      85%       │ │		
│  │  Mike Brown      ██████████████████████████████████        80%       │ │		
│  │  Jane Doe        ██████████████████████████████            75%       │ │		
│  │  Tom Wilson      ████████████████████                      60%       │ │		
│  │  Amy Chen        ████████████████                          50%       │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📅 WEEKLY ALLOCATION                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Team Member │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Total │ Projects     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith  │ 8h   │ 8h   │ 8h   │ 8h   │ 8h   │ 40h   │ Website, ERP ││		
│  │ Sarah Jones │ 8h   │ 8h   │ 8h   │ 6h   │ 4h   │ 34h   │ Mobile App   ││		
│  │ Mike Brown  │ 4h   │ 8h   │ 8h   │ 8h   │ 4h   │ 32h   │ Website      ││		
│  │ Jane Doe    │ 8h   │ 8h   │ 6h   │ 4h   │ -    │ 26h   │ ERP, Consult ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  ⚠️ ALLOCATION ALERTS                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ ⚠️ John Smith is overbooked this week (95% utilization)             │   │		
│  │ ⚠️ Amy Chen has low utilization (50%) - consider reassignment        │   │		
│  │ 🔴 No backup for Website Redesign project if John is unavailable     │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 UPCOMING PROJECT NEEDS                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Project         │ Start   │ Est. Hours │ Roles Needed    │ Status      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ New Client Portal│ Feb 01 │ 400 hrs    │ 2 Dev, 1 Design│ ⚠️ Understaff││		
│  │ Mobile v2       │ Mar 01  │ 250 hrs    │ 1 Dev, 1 QA    │ ✅ Ready    ││		
│  │ Analytics Dash  │ Mar 15  │ 150 hrs    │ 1 Dev          │ ✅ Ready    ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
# ⏱️ TIME		
		
## Time Entries		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  ⏱️ Time Entries                                       [+ New Time Entry]      │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 FILTERS                                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Date: This Week ▼] [Employee: All ▼] [Project: All ▼]             │   │		
│  │ [Billable: All ▼] [Status: All ▼]                                  │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 THIS WEEK SUMMARY                                                        │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total Hours │ Billable    │ Non-Billable│ Avg/Day     │                │		
│  │ 185 hrs     │ 142 hrs     │ 43 hrs      │ 7.4 hrs     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TIME ENTRY LIST                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Employee  │ Project        │ Hours │ Billable│ Status│ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 16 │ John Smith│ Website Redesign│ 4.0  │ ☑ Yes  │ 📝 Open│ [Edit] ││		
│  │        │           │ Development    │       │ $600   │        │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 16 │ Sarah Jones│ Mobile App    │ 6.0  │ ☑ Yes  │ ✅ Submitted│    ││		
│  │        │           │ Backend Dev    │       │ $750   │        │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ Mike Brown│ Website Redesign│ 8.0  │ ☑ Yes  │ ✅ Approved│    ││		
│  │        │           │ Design         │       │ $800   │        │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15 │ Jane Doe  │ Internal       │ 2.0  │ ☐ No   │ 📝 Open│ [Edit] ││		
│  │        │           │ Team Meeting   │       │ $0     │        │        ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 SELECTED: 0 entries    [Submit] [Approve] [Export] [Delete]             │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Time Entry Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  New Time Entry                                           [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Date *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Employee *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ John Smith                                             ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Project *                                                      │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Website Redesign - Acme Corp                           ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Task *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Development                                            ▼ │   │		
│  │ Options: Development, Design, Meeting, Research, Other    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  ⏱️ TIME                                                       │		
│                                                                 │		
│  Duration *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [4] hours [30] minutes                                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  OR use timer:                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │   00:00:00                          [▶ Start Timer]     │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Time Range (optional)                                          │		
│  ┌─────────────────────┬─────────────────────────────────────┐ │		
│  │ Start: [09:00]      │ End: [13:30]                       │ │		
│  └─────────────────────┴─────────────────────────────────────┘ │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💳 BILLING                                                    │		
│                                                                 │		
│  Billable                                                       │		
│  ☑ This time is billable to the customer                       │		
│                                                                 │		
│  Hourly Rate                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ $ 150.00 / hour (from project settings)                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Total Value: $675.00                                          │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📝 NOTES                                                      │		
│                                                                 │		
│  Description *                                                  │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Completed frontend components for homepage              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Tags                                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ [Frontend] [React] [+]                                  │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Save Entry]       │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Timesheets		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📅 Timesheets                                          [+ New Timesheet]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 FILTERS                                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Period: This Week ▼] [Employee: All ▼] [Status: All ▼]           │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 PERIOD: Dec 09 - Dec 15, 2024                                           │		
│                                                                              │		
│  📋 TIMESHEET STATUS                                                         │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Draft       │ Submitted   │ Approved    │ Rejected    │                │		
│  │ 3           │ 5           │ 8           │ 0           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TIMESHEET LIST                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee  │ Mon │ Tue │ Wed │ Thu │ Fri │ Total │ Billable│ Status    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith│ 8.0 │ 8.0 │ 8.0 │ 8.0 │ 6.0 │ 38.0 │ $5,700  │ ⏳ Submitted││		
│  │           │     │     │     │     │     │      │         │ [Approve] ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sarah Jones│ 8.0│ 8.0 │ 7.0 │ 8.0 │ 4.0 │ 35.0 │ $4,375  │ ✅ Approved││		
│  │           │     │     │     │     │     │      │         │           ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Mike Brown│ 6.0 │ 8.0 │ 8.0 │ 7.0 │ 3.0 │ 32.0 │ $3,200  │ 📝 Draft  ││		
│  │           │     │     │     │     │     │      │         │ [Submit]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 BULK ACTIONS                                                            │		
│  [Approve Selected] [Export All] [Print Summary]                             │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Timesheet Detail View		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  Timesheet: John Smith                                     [Approve] [Reject]│		
│  Period: Dec 09 - Dec 15, 2024                                              │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ Total Hours: 38.0    Billable: 32.0    Non-Billable: 6.0    Value: $5,700│		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📅 DAILY BREAKDOWN                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Project        │ Task       │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Total││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Website Redesign│ Development│ 4.0  │ 5.0  │ 4.0  │ 6.0  │ 4.0  │ 23.0 ││		
│  │                │            │      │      │      │      │      │      ││		
│  │ ERP Implementation│ Design  │ 2.0  │ 2.0  │ 3.0  │ -    │ 2.0  │ 9.0  ││		
│  │                │            │      │      │      │      │      │      ││		
│  │ Internal       │ Meeting    │ 2.0  │ 1.0  │ 1.0  │ 2.0  │ -    │ 6.0  ││		
│  │                │            │      │      │      │      │      │      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ DAILY TOTAL   │            │ 8.0  │ 8.0  │ 8.0  │ 8.0  │ 6.0  │ 38.0 ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📝 NOTES                                                                    │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Mon: Client call in afternoon                                       │   │		
│  │ Wed: Training session for new team member                           │   │		
│  │ Fri: Left early for doctor appointment                              │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  [Previous Employee]                                        [Next Employee]   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Schedule		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📅 Schedule                                           [+ Add Schedule Entry] │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📅 VIEW OPTIONS                                                             │		
│  [Day] [Week] [Month] [Timeline]                      │ Today: Dec 16, 2024 │		
│                                                                              │		
│  📊 WEEK OF: Dec 16 - Dec 22, 2024                                          │		
│                                                                              │		
│  📅 WEEKLY SCHEDULE                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee  │ Mon 16   │ Tue 17   │ Wed 18   │ Thu 19   │ Fri 20   │ Sat ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith│ Website │ Website │ ERP      │ ERP      │ Website  │ OFF  ││		
│  │           │ 9am-5pm │ 9am-5pm │ 9am-5pm │ 9am-5pm │ 9am-3pm │      ││		
│  │           │ 8 hrs   │ 8 hrs   │ 8 hrs   │ 8 hrs   │ 6 hrs   │      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sarah Jones│ Mobile │ Mobile  │ Mobile   │ Mobile   │ OFF      │ OFF  ││		
│  │           │ 9am-6pm │ 9am-6pm │ 9am-6pm │ 9am-5pm │          │      ││		
│  │           │ 9 hrs   │ 9 hrs   │ 9 hrs   │ 8 hrs   │          │      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Mike Brown│ Website │ Website │ OFF     │ Website │ Website  │ OFF  ││		
│  │           │ 10am-6pm│ 10am-6pm│         │ 10am-6pm│ 10am-4pm │      ││		
│  │           │ 8 hrs   │ 8 hrs   │         │ 8 hrs   │ 6 hrs   │      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 UPCOMING TIME OFF                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Dec 18 │ Mike Brown     │ Sick Day          │ Approved            │   │		
│  │ Dec 20-Jan 02 │ Sarah Jones │ Vacation    │ Approved            │   │		
│  │ Dec 25 │ All Staff      │ Holiday           │ Company Holiday    │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Time Approvals *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  ✅ Time Approvals                                                           │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 PENDING APPROVALS                                                        │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Submitted   │ Pending Rev │ Total Hours │ Total Value │                │		
│  │ 5 timesheets│ 3 this week │ 185 hrs     │ $23,450     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TIMESHEETS AWAITING APPROVAL                                             │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee  │ Period        │ Hours │ Billable │ Amount  │ Days │ Actions││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith│ Dec 09-15     │ 38.0  │ 32.0 hrs │ $5,700  │ 2d   │[Approve]││		
│  │           │               │       │          │         │      │[Reject] ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Jane Doe  │ Dec 09-15     │ 40.0  │ 35.0 hrs │ $4,500  │ 1d   │[Approve]││		
│  │           │               │       │          │         │      │[Reject] ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Tom Wilson│ Dec 09-15     │ 36.0  │ 30.0 hrs │ $3,600  │ 3h   │[Approve]││		
│  │           │               │       │          │         │      │[Reject] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  🎯 BULK ACTIONS                                                            │		
│  [Approve All (3)] [Export for Review]                                       │		
│                                                                              │		
│  📋 RECENTLY APPROVED                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee  │ Period    │ Hours │ Approved By │ Approved On │ Actions    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sarah Jones│ Dec 02-08│ 35.0 │ John Smith  │ Dec 09      │ [View]     ││		
│  │ Mike Brown │ Dec 02-08│ 40.0 │ John Smith  │ Dec 09      │ [View]     ││		
│  │ Amy Chen   │ Dec 02-08│ 32.0 │ John Smith  │ Dec 09      │ [View]     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Approve/Reject Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Review Timesheet                                        [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Employee: John Smith                                           │		
│  Period: Dec 09 - Dec 15, 2024                                  │		
│  Total Hours: 38.0    Billable: 32.0    Value: $5,700          │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📅 TIME ENTRIES                                                │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Date   │ Project        │ Task       │ Hours │ Billable    ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Dec 09 │ Website Redesign│ Development│ 4.0  │ ☑ $600     ││		
│  │ Dec 09 │ Internal       │ Meeting    │ 2.0  │ ☐ $0       ││		
│  │ Dec 10 │ Website Redesign│ Development│ 5.0  │ ☑ $750     ││		
│  │ Dec 10 │ ERP Implementation│ Design  │ 2.0  │ ☑ $300     ││		
│  │ ...    │ ...            │ ...        │ ...  │ ...        ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  ⚠️ FLAGS                                                      │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ • 2 hours overtime on Dec 12 (requires OT approval)        ││		
│  │ • Unusual hours on Friday (6 hrs vs expected 8)            ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  📝 COMMENTS                                                   │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Add approval/rejection notes...                          │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│          [Reject]  [Request Changes]  [Approve Timesheet]       │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
*(Continuing with INVENTORY, PAYROLL & WORKFORCE, ACCOUNTING, REPORTS, TAXES, COMPLIANCE, AUTOMATION, ACCOUNTANT WORKSPACE, FINANCIAL SERVICES, APPS & INTEGRATIONS, and SETTINGS...)*		
		
---		
		
# Haypbooks v2 — Complete Page Specifications (Continued)		
		
Continuing from Time...		
		
---		
		
# 📦 INVENTORY		
		
## Overview		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📦 Inventory Overview                                                      │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 KEY METRICS                                                              │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total Value │ SKUs        │ Low Stock   │ Out of Stock│                │		
│  │ $125,450    │ 245 items   │ 12 items    │ 3 items     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 INVENTORY VALUE BY CATEGORY                                              │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Electronics     ████████████████████████████████████████  $65,000   │ │		
│  │  Office Supplies ████████████████████                      $28,450   │ │		
│  │  Furniture       ██████████████████                        $22,000   │ │		
│  │  Software        ████████████                              $10,000   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 STOCK STATUS                                                             │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  In Stock (180)   Low Stock (12)    Out of Stock (3)   Overstock (50)│ │		
│  │  ██████████████   ████             ██                  ████████      │ │		
│  │  $98,000          $8,500           $0                  $19,000        │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ⚠️ ALERTS                                                                   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔴 3 items out of stock                                    [Reorder] │   │		
│  │ 🟡 12 items below reorder point                            [View All]│   │		
│  │ 📦 5 purchase orders pending receipt                       [View All]│   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  ⚡ QUICK ACTIONS                                                            │		
│  [+ New Item] [+ Stock Adjustment] [+ Purchase Order] [Physical Count]       │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Inventory		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📦 Inventory Items                                    [+ Add Item] [Import]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search items...                                                   │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Category: All ▼] [Status: All ▼] [Warehouse: All ▼]              │   │		
│  │ [Stock Level: All ▼]                                               │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total Items │ In Stock    │ Low Stock   │ Out of Stock│                │		
│  │ 245         │ 180         │ 12          │ 3           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 INVENTORY LIST                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ SKU     │ Name        │ Category  │ On Hand│ Available│ Status │Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ WGT-001 │ Widget Pro  │ Electronics│ 234   │ 220      │ ✅ OK  │  ⋮   ││		
│  │         │ $150.00     │           │       │          │        │      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ GDT-002 │ Gadget Basic│ Electronics│ 12    │ 8        │ ⚠️ Low │  ⋮   ││		
│  │         │ $85.00      │           │       │          │ [Reorder]│     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ CMP-003 │ Computer Mnt│ Electronics│ 0     │ 0        │ 🔴 Out │  ⋮   ││		
│  │         │ $350.00     │           │       │          │ [Reorder]│     ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PPR-001 │ Paper A4    │ Office Sup│ 500   │ 450      │ ✅ OK  │  ⋮   ││		
│  │         │ $12.00      │           │       │          │        │      ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📄 Showing 1-25 of 245 items                               [< Prev] [Next >]│		
│                                                                              │		
│  🎯 SELECTED: 0 items    [Adjust Stock] [Transfer] [Export]                  │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add Inventory Item Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Inventory Item                                       [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  📋 ITEM DETAILS                                                │		
│                                                                 │		
│  Item Name *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Widget Pro                                              │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  SKU / Item Code *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ WGT-001                                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Category *                Subcategory                          │		
│  ┌─────────────────────┐   ┌─────────────────────────────┐    │   │		
│  │ Electronics       ▼ │   │ Components                ▼ │    │   │		
│  └─────────────────────┘   └─────────────────────────────┘    │   │		
│                                                                 │		
│  Barcode                        Manufacturer                    │		
│  ┌─────────────────────────┐   ┌─────────────────────────────┐ │		
│  │ 123456789012           │   │ Acme Manufacturing          │ │		
│  └─────────────────────────┘   └─────────────────────────────┘ │		
│                                                                 │		
│  Description                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Premium widget with advanced features                   │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💰 PRICING                                                     │		
│                                                                 │		
│  Sales Price *              Cost Price *                        │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ $ 150.00            │    │ $ 75.00                     │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Margin: 50%                    Markup: 100%                    │		
│                                                                 │		
│  Income Account *           Expense Account *                   │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Sales Income      ▼ │    │ Cost of Goods Sold        ▼ │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  ☑ Taxable                                                     │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📦 INVENTORY TRACKING                                          │		
│                                                                 │		
│  Tracking Method *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Perpetual (Real-time)    ○ Periodic                   │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Valuation Method *                                             │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● FIFO    ○ LIFO    ○ Average Cost                      │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Opening Quantity *         Warehouse *                         │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ 100                 │    │ Main Warehouse            ▼ │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Reorder Point *            Reorder Quantity                    │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ 20                  │    │ 50                          │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Preferred Vendor                                               │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ABC Supply                                            ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📷 IMAGE                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │                                                         │   │		
│  │               [Upload Product Image]                     │   │		
│  │                                                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│                                    [Cancel]  [Save Item]        │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Purchase Inventory | Inventory Asset | Accounts Payable |		
| Sell Inventory | COGS | Inventory Asset |		
| | Accounts Receivable | Sales Revenue |		
| Stock Adjustment (+) | Inventory Asset | Inventory Adjustment |		
| Stock Adjustment (-) | Inventory Adjustment | Inventory Asset |		
		
---		
		
## Stock Movement		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🔄 Stock Movement                               [+ New Adjustment] [Transfer]│		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 FILTERS                                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ [Date Range: This Month ▼] [Type: All ▼] [Item: All ▼]           │   │		
│  │ [Warehouse: All ▼] [Reference: All ▼]                             │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ This Month  │ Adjustments │ Transfers   │ Total Value │                │		
│  │ 89 movements│ 12          │ 8           │ $45,230     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 MOVEMENT HISTORY                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Date │ Type    │ Item        │ Qty  │ From      │ To        │ Ref    ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Receipt │ Widget Pro  │ +50  │ PO-89     │ Main WH   │ [View] ││		
│  │       │         │             │      │ ABC Supply│           │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 15│ Sale    │ Widget Pro  │ -3   │ Main WH   │ Shipped   │ SO-15  ││		
│  │       │         │             │      │           │           │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 14│ Transfer│ Gadget Basic│ -20  │ Main WH   │ Branch WH │ TR-12  ││		
│  │       │         │             │ +20  │           │           │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 12│ Adjust  │ Paper A4    │ -5   │ Damage    │ Written Off│ ADJ-05 ││		
│  │       │         │             │      │           │           │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 10│ Count   │ Widget Pro  │ -2   │ Variance  │ Adjusted  │ PC-03  ││		
│  │       │         │             │      │           │           │        ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Stock Adjustment Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Stock Adjustment                                         [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Adjustment Type *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Quantity Adjustment    ○ Value Adjustment             │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Item *                                                         │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ WGT-001 - Widget Pro                                   │   │		
│  │ Current Qty: 234    Current Value: $17,550.00          │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Warehouse *                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Main Warehouse                                        ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Adjustment Date *                                              │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📊 ADJUSTMENT DETAILS                                          │		
│                                                                 │		
│  Current Quantity: 234                                          │		
│                                                                 │		
│  New Quantity *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 230                                                     │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Adjustment: -4                                                 │		
│                                                                 │		
│  Adjustment Account *                                           │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Inventory Shrinkage                                   ▼ │   │		
│  │ Options: Shrinkage, Damage, Theft, Found, Other         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Reason *                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Damaged during shipping                                 │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Reference #                                                    │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ADJ-2024-067                                            │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  📎 Attachments                                                 │		
│  [Upload Photos/Documents]                                      │		
│                                                                 │		
│                                    [Cancel]  [Save Adjustment]   │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Purchase Orders		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 Purchase Orders                               [+ New Purchase Order]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Open POs    │ Pending Rec │ Total Value │ Overdue     │                │		
│  │ 8           │ 5           │ $45,890     │ 2           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 TABS                                                                     │		
│  [All (45)] [Draft (3)] [Open (8)] [Partially Received (5)] [Closed (29)]   │		
│                                                                              │		
│  📋 PURCHASE ORDER LIST                                                      │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ PO #  │ Date   │ Vendor      │ Expected │ Amount   │ Status    │ Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PO-89 │ Dec 15 │ ABC Supply  │ Dec 22   │ $5,200   │ Open      │  ⋮   ││		
│  │       │        │ 5 items     │          │          │           │[Receive]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PO-88 │ Dec 12 │ Tech Corp   │ Dec 19   │ $8,500   │ Partial   │  ⋮   ││		
│  │       │        │ 3 of 5 rcvd │          │ $3,500   │ 70%       │[Receive]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PO-87 │ Dec 10 │ Office Dep  │ Dec 15   │ $1,200   │ ⚠️ Overdue│  ⋮   ││		
│  │       │        │ 2 items     │ 1 day    │          │           │[Receive]│		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PO-86 │ Dec 08 │ XYZ Ltd     │ -        │ $2,500   │ Draft     │  ⋮   ││		
│  │       │        │ 3 items     │          │          │           │ [Send] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### New Purchase Order Page		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📋 New Purchase Order                                 [Save Draft] [Send]    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  ┌─────────────────────────────────────┬────────────────────────────────┐  │		
│  │ SHIP TO:                            │ VENDOR:                         │  │		
│  │ Acme Corporation, Inc.              │ [Select Vendor ▼]               │  │		
│  │ Main Warehouse                      │                                 │  │		
│  │ 123 Business Park Drive             │ Vendor details appear here      │  │		
│  │ New York, NY 10001                  │ after selection                 │  │		
│  │                                     │                                 │  │		
│  │                                     │ Terms: Net 30                   │  │		
│  └─────────────────────────────────────┴────────────────────────────────┘  │		
│                                                                              │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ PO #        │ Order Date  │ Expected Date │ Terms          │ Status   │ │		
│  │ PO-90       │ Dec 16, 2024│ Dec 23, 2024 │ Net 30       ▼│ Draft    │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 LINE ITEMS                                                               │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Item          │ Qty  │ Rate     │ Amount   │ Warehouse    │ Actions    │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Widget Pro   │ 50   │ $75.00   │ $3,750.00│ Main WH      │ [X]        │ │		
│  │ WGT-001      │      │          │          │              │            │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ Gadget Basic │ 25   │ $42.00   │ $1,050.00│ Main WH      │ [X]        │ │		
│  │ GDT-002      │      │          │          │              │            │ │		
│  ├────────────────────────────────────────────────────────────────────────┤ │		
│  │ [+ Add Item]                                                          │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ┌──────────────────────────────────────┬─────────────────────────────────┐│		
│  │                                      │ Subtotal:       $4,800.00       ││		
│  │ Vendor Message:                      │ Shipping:       $150.00        ││		
│  │ ┌────────────────────────────────┐   │ Tax:            $0.00          ││		
│  │ │ Please deliver to loading dock│   │ ─────────────────────           ││		
│  │ │ between 9am-5pm              │   │ TOTAL:          $4,950.00       ││		
│  │ └────────────────────────────────┘   │                                 ││		
│  │                                      │                                 ││		
│  │ Internal Notes:                      │                                 ││		
│  │ ┌────────────────────────────────┐   │                                 ││		
│  │ │ Urgent - stock running low    │   │                                 ││		
│  │ └────────────────────────────────┘   │                                 ││		
│  └──────────────────────────────────────┴─────────────────────────────────┘│		
│                                                                              │		
│  [Save Draft] [Save & New] [Preview PDF]                  [Send to Vendor]   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Item Receipts		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  📦 Item Receipts                                      [+ New Receipt]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Pending     │ This Week   │ This Month  │ Total Value │                │		
│  │ 5 POs      │ 12 receipts │ 34 receipts │ $125,450    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 PENDING RECEIPTS                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ PO #  │ Vendor      │ Expected │ Items    │ Amount   │ Days │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ PO-89 │ ABC Supply  │ Dec 22   │ 5 items  │ $5,200   │ 6    │[Receive]││		
│  │ PO-87 │ Office Dep  │ Dec 15   │ 2 items  │ $1,200   │ -1   │[Receive]││		
│  │ PO-85 │ Tech Corp   │ Dec 24   │ 3 items  │ $8,500   │ 8    │[Receive]││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 RECENT RECEIPTS                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Receipt │ Date   │ PO #  │ Vendor    │ Items  │ Amount   │ Bill Status││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ RC-45  │ Dec 15 │ PO-88 │ Tech Corp │ 3/5    │ $3,500   │ ⏳ Pending││		
│  │ RC-44  │ Dec 14 │ PO-86 │ XYZ Ltd   │ 4/4    │ $2,200   │ ✅ Billed ││		
│  │ RC-43  │ Dec 12 │ PO-84 │ ABC Supply│ 10/10  │ $7,500   │ ✅ Billed ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Receive Items Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Receive Items: PO-89                                     [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  Vendor: ABC Supply                                             │		
│  PO Date: Dec 15, 2024    Expected: Dec 22, 2024               │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  📦 RECEIVE ITEMS                                               │		
│  ┌─────────────────────────────────────────────────────────────┐│		
│  │ Item          │ Ordered │ Received │ To Receive │ Damaged  ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Widget Pro    │ 50      │ 0       │ [50]       │ [0]      ││		
│  │ WGT-001       │         │         │            │          ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Gadget Basic  │ 25      │ 0       │ [25]       │ [0]      ││		
│  │ GDT-002       │         │         │            │          ││		
│  ├─────────────────────────────────────────────────────────────┤│		
│  │ Cable USB-C   │ 100     │ 0       │ [100]      │ [0]      ││		
│  │ CAB-001       │         │         │            │          ││		
│  └─────────────────────────────────────────────────────────────┘│		
│                                                                 │		
│  Receive Date *                                                 │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Dec 16, 2024                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Receiving Warehouse *                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Main Warehouse                                        ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Reference # (Packing Slip)                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ PS-12345                                                │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Notes                                                          │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ All items received in good condition                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💳 CREATE BILL                                                 │		
│  ☑ Create bill for received items                              │		
│  │   Bill Amount: $4,950.00                                   │		
│  │   Bill Date: Dec 16, 2024                                  │		
│  │   Due Date: Jan 15, 2025                                   │		
│                                                                 │		
│                 [Cancel]  [Partial Receipt]  [Receive All]       │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Warehouses *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏭 Warehouses                                   [+ Add Warehouse]           │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 WAREHOUSE SUMMARY                                                        │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Warehouses  │ Total Items │ Total Value │ Transfers   │                │		
│  │ 3           │ 245 SKUs    │ $125,450    │ 8 pending   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 WAREHOUSE CARDS                                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  ┌─────────────────────┐  ┌─────────────────────┐                    │ │		
│  │  │ 🏭 Main Warehouse   │  │ 🏭 Branch Warehouse  │                    │ │		
│  │  │ New York, NY        │  │ Los Angeles, CA     │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ 180 SKUs            │  │ 85 SKUs             │                    │ │		
│  │  │ $85,000 value       │  │ $28,000 value       │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ Low Stock: 8 items  │  │ Low Stock: 4 items  │                    │ │		
│  │  │ Out of Stock: 2     │  │ Out of Stock: 1     │                    │ │		
│  │  │                     │  │                     │                    │ │		
│  │  │ [View] [Transfer]   │  │ [View] [Transfer]   │                    │ │		
│  │  └─────────────────────┘  └─────────────────────┘                    │ │		
│  │                                                                        │ │		
│  │  ┌─────────────────────┐                                              │ │		
│  │  │ 🏭 Distribution Ctr │                                              │ │		
│  │  │ Chicago, IL         │                                              │ │		
│  │  │                     │                                              │ │		
│  │  │ 65 SKUs             │                                              │ │		
│  │  │ $12,450 value       │                                              │ │		
│  │  │                     │                                              │ │		
│  │  │ Low Stock: 0 items  │                                              │ │		
│  │  │ Out of Stock: 0     │                                              │ │		
│  │  │                     │                                              │ │		
│  │  │ [View] [Transfer]   │                                              │ │		
│  │  └─────────────────────┘                                              │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 PENDING TRANSFERS                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Transfer │ From          │ To            │ Items │ Status   │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ TR-15   │ Main WH       │ Branch WH     │ 20    │ In Transit│ [Receive]│		
│  │ TR-14   │ Branch WH     │ Distribution  │ 15    │ Pending  │ [Ship]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Inventory Valuation *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💰 Inventory Valuation                               [Export] [Refresh]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 VALUATION METHOD                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Current Method: FIFO (First In, First Out)             [Change]    │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 TOTAL INVENTORY VALUE                                                    │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ At Cost     │ At Retail   │ Potential GP│ Turnover    │                │		
│  │ $125,450    │ $185,000    │ $59,550    │ 8.5x/year   │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 VALUE BY CATEGORY                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Category        │ Qty   │ Cost Value │ Retail Value │ Gross Profit   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Electronics     │ 450   │ $65,000    │ $98,000     │ $33,000 (34%)  ││		
│  │ Office Supplies │ 1,200 │ $28,450    │ $42,000     │ $13,550 (32%)  ││		
│  │ Furniture       │ 85    │ $22,000    │ $32,000     │ $10,000 (31%)  ││		
│  │ Software        │ 120   │ $10,000    │ $13,000     │ $3,000 (23%)   ││		
│  │ Total           │ 1,855 │ $125,450   │ $185,000    │ $59,550 (32%)  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 VALUATION TREND (Last 12 Months)                                        │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  $150K├──────────────────────────────────────────────────────────    │ │		
│  │        │                                     ╭───────────────╮      │ │		
│  │  $125K│──────────────────────────────────────╯               ╰────   │ │		
│  │        │                     ╭─────────╮                           │ │		
│  │  $100K│──────────────────────╯         ╰────────────────────────   │ │		
│  │        │           ╭──────╮                                         │ │		
│  │   $75K│───────────╯      ╰────────────────────────────────────    │ │		
│  │        └──────────────────────────────────────────────────────────   │ │		
│  │         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 DETAILED VALUATION REPORT                                                │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ SKU     │ Item        │ Qty │ Unit Cost│ Total Cost│ FIFO Layers      ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ WGT-001 │ Widget Pro  │ 234 │ $75.00   │ $17,550   │ 3 layers        ││		
│  │         │             │     │          │           │ $70, $75, $78   ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ GDT-002 │ Gadget Basic│ 12  │ $42.00   │ $504      │ 1 layer         ││		
│  │         │             │     │          │           │ $42             ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
# 👥 PAYROLL & WORKFORCE		
		
## Overview		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  👥 Payroll & Workforce Overview                                             │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 KEY METRICS                                                              │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Employees   │ Next Payroll│ Monthly Cost│ YTD Payroll │                │		
│  │ 25          │ Dec 20      │ $89,450     │ $1,072,340  │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 PAYROLL BREAKDOWN                                                        │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Gross Wages    ████████████████████████████████████████████  $65,000 │ │		
│  │  Taxes          ████████████████                              $14,500  │ │		
│  │  Benefits       ███████████████                               $8,200   │ │		
│  │  Deductions     ████████                                      $1,750   │ │		
│  │                                                                        │ │		
│  │  Net Pay        ████████████████████████████████████          $54,050  │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📅 UPCOMING                                                                  │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔴 Dec 20 - Payroll Run                    $89,450    [Run Payroll] │   │		
│  │ 🟡 Dec 25 - Holiday (Office Closed)                                 │   │		
│  │ 🟢 Jan 01 - New Year's Day                                          │   │		
│  │ 🟢 Jan 15 - Quarterly Tax Filing                                    │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  ⚡ QUICK ACTIONS                                                            │		
│  [+ Run Payroll] [+ Add Employee] [Time Approvals] [Tax Reports]             │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Employees		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  👥 Employees                                    [+ Add Employee] [Import]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  🔍 SEARCH & FILTER                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ 🔍 Search employees...     [Department: All ▼] [Status: All ▼]     │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total       │ Active      │ On Leave    │ New This Mo │                │		
│  │ 25          │ 23          │ 2           │ 1           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 EMPLOYEE LIST                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Name        │ Department │ Position    │ Start Date│ Status   │ Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith  │ Engineering│ Sr. Developer│ Jan 2020 │ ✅ Active│   ⋮   ││		
│  │ john@acme   │            │ $125,000/yr │           │          │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sarah Jones │ Design     │ UI Designer │ Mar 2021  │ ✅ Active│   ⋮   ││		
│  │ sarah@acme  │            │ $95,000/yr │           │          │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Mike Brown  │ Sales      │ Sales Rep   │ Jun 2022  │ 🏖️ Leave │   ⋮   ││		
│  │ mike@acme   │            │ $75,000/yr │           │ Until Jan │       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Jane Doe    │ HR         │ HR Manager  │ Feb 2019  │ ✅ Active│   ⋮   ││		
│  │ jane@acme   │            │ $85,000/yr │           │          │       ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Add Employee Modal		
```		
┌─────────────────────────────────────────────────────────────────┐		
│  Add Employee                                             [X]   │		
├─────────────────────────────────────────────────────────────────┤		
│                                                                 │		
│  📋 PERSONAL INFO                                               │		
│                                                                 │		
│  First Name *               Last Name *                         │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ John                │    │ Smith                       │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Email *                    Phone                               │		
│  ┌─────────────────────────┐    ┌─────────────────────────────┐│		
│  │ john.smith@acme.com    │    │ (555) 123-4567              ││		
│  └─────────────────────────┘    └─────────────────────────────┘│		
│                                                                 │		
│  Date of Birth               SSN (for payroll)                  │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Jan 15, 1990      📅│    │ ***-**-****                 │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Address                                                       │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ 123 Main St, New York, NY 10001                         │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💼 EMPLOYMENT DETAILS                                          │		
│                                                                 │		
│  Employee ID                Start Date *                        │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ EMP-001             │    │ Jan 01, 2025              📅│   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Department *               Position *                          │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Engineering       ▼ │    │ Software Developer        ▼ │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Manager                    Employment Type                     │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ Jane Doe          ▼ │    │ ● Full-time  ○ Part-time    │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  💰 COMPENSATION                                                │		
│                                                                 │		
│  Pay Type *                                                     │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ ● Salary    ○ Hourly                                    │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Annual Salary *            Pay Frequency                       │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ $ 100,000.00        │    │ ● Semi-Monthly  ○ Bi-Weekly│   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Effective Date                                                │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Jan 01, 2025                                           📅│   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  🏦 DIRECT DEPOSIT                                             │		
│                                                                 │		
│  ☐ Set up direct deposit                                       │		
│  │   Bank Name: [____________________]                        │		
│  │   Account #: [____________________]                        │		
│  │   Routing #: [____________________]                        │		
│  │   Account Type: ○ Checking  ○ Savings                     │		
│                                                                 │		
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │		
│                                                                 │		
│  🏥 TAX & BENEFITS                                              │		
│                                                                 │		
│  Federal Filing Status                                        │		
│  ┌─────────────────────────────────────────────────────────┐   │		
│  │ Single                                                ▼ │   │		
│  └─────────────────────────────────────────────────────────┘   │		
│                                                                 │		
│  Federal Allowances        State                              │		
│  ┌─────────────────────┐    ┌─────────────────────────────┐   │		
│  │ 0                   │    │ NY                        ▼ │   │		
│  └─────────────────────┘    └─────────────────────────────┘   │		
│                                                                 │		
│  Benefits Enrollment                                           │		
│  ☑ Health Insurance                                            │		
│  ☑ 401(k) Retirement                                          │		
│  ☐ Dental Insurance                                           │		
│  ☐ Vision Insurance                                           │		
│                                                                 │		
│                                    [Cancel]  [Add Employee]     │		
│                                                                 │		
└─────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Payroll Runs		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💵 Payroll Runs                                     [+ Run Payroll]          │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 SUMMARY                                                                  │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ YTD Runs    │ YTD Gross   │ YTD Net Pay │ Next Run    │                │		
│  │ 24          │ $1,072,340  │ $864,500    │ Dec 20      │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 UPCOMING PAYROLL                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Pay Period        │ Pay Date │ Employees │ Gross    │ Net     │ Status││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Dec 01 - Dec 15   │ Dec 20   │ 25        │ $44,725  │ $35,895│ ⏳ Ready│		
│  │                   │          │           │          │        │[Run]  ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 PAYROLL HISTORY                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Run # │ Period       │ Pay Date │ Gross    │ Net     │ Status │ Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ #24   │ Nov 16-30    │ Dec 05   │ $45,230  │ $36,450 │ ✅ Paid│ [View]││		
│  │ #23   │ Nov 01-15    │ Nov 20   │ $44,890  │ $36,125 │ ✅ Paid│ [View]││		
│  │ #22   │ Oct 16-31    │ Nov 05   │ $45,500  │ $36,650 │ ✅ Paid│ [View]││		
│  │ #21   │ Oct 01-15    │ Oct 20   │ $44,500  │ $35,850 │ ✅ Paid│ [View]││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Run Payroll Page		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  💵 Run Payroll                                          [Preview] [Submit]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📅 PAY PERIOD                                                               │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Period Start: Dec 01, 2024    Period End: Dec 15, 2024              │ │		
│  │ Pay Date: Dec 20, 2024                                                │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📊 PAYROLL SUMMARY                                                          │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Employees   │ Gross Pay   │ Taxes       │ Net Pay     │                │		
│  │ 25          │ $44,725     │ $7,450      │ $35,895     │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 EMPLOYEE PAY DETAILS                                                     │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee    │ Hours │ Gross    │ Fed Tax│ State Tax│ FICA  │ Net Pay ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith  │ 80.0  │ $4,166.67│ $520.83│ $285.42  │ $318.75│ $3,041.67││		
│  │ Sarah Jones │ 80.0  │ $3,625.00│ $453.13│ $248.44  │ $276.88│ $2,646.55││		
│  │ Mike Brown  │ 0.0   │ $0.00   │ $0.00  │ $0.00    │ $0.00 │ $0.00    ││		
│  │             │       │         │        │ (On Leave)│       │          ││		
│  │ Jane Doe    │ 80.0  │ $3,250.00│ $406.25│ $222.50  │ $248.50│ $2,372.75││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  💳 PAYMENT METHOD                                                           │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Direct Deposit: 23 employees    $32,845.00                           │ │		
│  │ Check: 2 employees              $3,050.00                            │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  🏥 TAX DEPOSITS                                                             │		
│  ┌────────────────────────────────────────────────────────────────────────┐ │		
│  │ Federal Tax:      $1,895.00    Due: Dec 20                           │ │		
│  │ State Tax:        $1,125.00    Due: Dec 20                           │ │		
│  │ Social Security:  $2,775.00    Due: Dec 20                           │ │		
│  │ Medicare:         $650.00      Due: Dec 20                           │ │		
│  │ State Unemploy:   $425.00      Due: Dec 20                           │ │		
│  │ ─────────────────────────────────────────────────────                │ │		
│  │ Total Taxes:      $6,870.00                                          │ │		
│  └────────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  ☐ Submit tax deposits automatically                                       │		
│  ☐ Send pay stubs to employees                                             │		
│  ☐ Print checks for non-direct deposit employees                           │		
│                                                                              │		
│  [Save Draft] [Preview All]                              [Submit Payroll]    │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
### Accounting Effects		
| Entry | Debit | Credit |		
|-------|-------|--------|		
| Run Payroll | Wages Expense | Cash (Net Pay) |		
| | | Payroll Taxes Payable |		
| | | 401k Payable |		
| | | Health Insurance Payable |		
| Payroll Taxes | Payroll Tax Expense | Cash |		
| | Payroll Taxes Payable | |		
		
---		
		
## Workers' Comp		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏥 Workers' Compensation                                                   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 COVERAGE SUMMARY                                                         │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Policy #    │ Provider    │ Premium     │ Renewal     │                │		
│  │ WC-12345    │ State Fund  │ $12,500/yr │ Jun 30, 2025│                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 CLASSIFICATION CODES                                                     │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Code    │ Description          │ Rate     │ Payroll    │ Premium    │ │		
│  │  8810    │ Clerical Office      │ $0.35/$100│ $450,000  │ $1,575     │ │		
│  │  8742    │ Salespersons         │ $0.85/$100│ $180,000  │ $1,530     │ │		
│  │  4720    │ Computer Programming │ $1.25/$100│ $320,000  │ $4,000     │ │		
│  │ 8820    │ Executives           │ $0.45/$100│ $150,000  │ $675       │ │		
│  │                                                                        │ │		
│  │                                        Total Premium:    $7,780      │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 CLAIMS HISTORY                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Claim # │ Date   │ Employee  │ Type       │ Status   │ Amount  │ Action││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ C-2024-01│ Mar 15│ Tom Wilson│ Strain     │ Closed   │ $2,500 │ [View] ││		
│  │         │        │           │            │          │        │        ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 EXPERIENCE MODIFIER                                                      │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │ Current EMR: 0.85 (Better than industry average)                     │ │		
│  │ Industry Average: 1.00                                               │ │		
│  │ EMR Trend: ↓ Improving                                               │ │		
│  │ Premium Credit: $1,875                                               │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Benefits *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏥 Benefits Management                               [+ Add Benefit Plan]   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 BENEFITS COST SUMMARY                                                    │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Monthly Cost│ Employer $  │ Employee $  │ Enrolled    │                │		
│  │ $28,500     │ $21,375     │ $7,125      │ 23/25       │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 BENEFIT PLANS                                                            │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Plan              │ Type    │ Coverage   │ Cost/Mo  │ Enrolled│ Status││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Aetna Health Plan│ Medical │ PPO        │ $850     │ 20     │ ✅     ││		
│  │                  │         │            │          │        │        ││		
│  │ Employer: $650    │ Employee: $200       │          │        │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Delta Dental      │ Dental  │ PPO        │ $45      │ 18     │ ✅     ││		
│  │                  │         │            │          │        │        ││		
│  │ Employer: $35     │ Employee: $10        │          │        │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ VSP Vision       │ Vision  │ Basic      │ $15      │ 15     │ ✅     ││		
│  │                  │         │            │          │        │        ││		
│  │ Employer: $10     │ Employee: $5         │          │        │        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Fidelity 401(k)  │ Retire  │ 4% Match   │ Variable │ 22     │ ✅     ││		
│  │                  │         │            │          │        │        ││		
│  │ Employer Match: 4% up to $8,000/year                              ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📅 OPEN ENROLLMENT                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────┐   │		
│  │ Next Open Enrollment: Nov 01 - Nov 30, 2025                         │   │		
│  │ Effective Date: Jan 01, 2026                                        │   │		
│  └─────────────────────────────────────────────────────────────────────┘   │		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Org Chart *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏢 Organization Chart                                                      │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 ORGANIZATION STATS                                                       │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Total Staff │ Departments │ Managers    │ Avg Reports │                │		
│  │ 25          │ 5           │ 6           │ 3.2         │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📊 ORG CHART VIEW                                                           │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │                           ┌──────────────┐                           │ │		
│  │                           │ CEO          │                           │ │		
│  │                           │ John CEO     │                           │ │		
│  │                           └──────┬───────┘                           │ │		
│  │                                  │                                    │ │		
│  │          ┌───────────────────────┼───────────────────────┐           │ │		
│  │          │                       │                       │            │ │		
│  │   ┌──────┴──────┐         ┌──────┴──────┐        ┌──────┴──────┐   │ │		
│  │   │ CFO         │         │ CTO         │        │ COO         │   │ │		
│  │   │ Jane Doe    │         │ Mike Tech   │        │ Sarah Ops   │   │ │		
│  │   └──────┬──────┘         └──────┬──────┘        └──────┬──────┘   │ │		
│  │          │                       │                       │            │ │		
│  │    ┌─────┴─────┐           ┌─────┴─────┐          ┌─────┴─────┐    │ │		
│  │    │           │           │           │          │           │    │ │		
│  │ ┌──┴──┐    ┌──┴──┐    ┌──┴──┐    ┌──┴──┐   ┌──┴──┐    ┌──┴──┐ │ │		
│  │ │ Acct│    │ HR  │    │ Eng │    │ Dev │   │ Ops │    │ Sales│ │ │		
│  │ │ Team│    │Team │    │Team │    │Team │   │Team │    │ Team │ │ │		
│  │ └─────┘    └─────┘    └─────┘    └─────┘   └─────┘    └─────┘ │ │		
│  │                                                                        │ │		
│  │  [Zoom In] [Zoom Out] [Export PDF] [Edit Structure]                   │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 TEAM BREAKDOWN                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Department    │ Manager   │ Employees │ Open Positions │ Budget       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Engineering   │ Mike Tech │ 8         │ 2              │ $1,200,000   ││		
│  │ Sales         │ Tom Sales │ 5         │ 1              │ $450,000     ││		
│  │ Operations    │ Sarah Ops │ 4         │ 0              │ $380,000     ││		
│  │ Finance       │ Jane Doe  │ 3         │ 0              │ $350,000     ││		
│  │ HR            │ Amy HR    │ 2         │ 0              │ $180,000     ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Time Off *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  🏖️ Time Off Management                               [+ Add Policy]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 TIME OFF SUMMARY                                                         │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Pending     │ Approved    │ This Month  │ YTD Used    │                │		
│  │ 3 requests  │ 2 requests  │ 8 days      │ 145 days    │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 PENDING REQUESTS                                                         │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee  │ Type   │ From    │ To      │ Days │ Reason      │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith│ Vacation│ Dec 23 │ Dec 27 │ 5    │ Holiday trip│[Approve]││		
│  │           │        │         │         │      │             │[Reject] ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sarah Jones│ Sick  │ Dec 18 │ Dec 18 │ 1    │ Doctor apt │[Approve]││		
│  │           │        │         │         │      │             │[Reject] ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Mike Brown│ Personal│ Dec 30│ Dec 31 │ 2    │ Family event│[Approve]││		
│  │           │        │         │         │      │             │[Reject] ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 TIME OFF POLICIES                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Policy        │ Type    │ Accrual    │ Carryover │ Max Balance        ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Vacation      │ PTO     │ 10 days/yr│ 5 days    │ 30 days            ││		
│  │ Sick Leave    │ Sick    │ 5 days/yr │ 0 days    │ Unlimited          ││		
│  │ Personal      │ Personal│ 3 days/yr │ 0 days    │ 3 days             ││		
│  │ Bereavement   │ Other   │ As needed │ N/A       │ N/A                ││		
│  │ Jury Duty     │ Other   │ As needed │ N/A       │ N/A                ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📊 EMPLOYEE BALANCES                                                        │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Employee    │ Vacation │ Sick  │ Personal │ Used YTD│ Available       ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ John Smith  │ 8 days   │ 3 days│ 1 day   │ 12 days │ 12 days         ││		
│  │ Sarah Jones │ 10 days  │ 4 days│ 2 days  │ 5 days  │ 16 days         ││		
│  │ Mike Brown  │ 6 days   │ 2 days│ 0 days  │ 18 days │ 8 days          ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
## Recruiting *(Enterprise)*		
		
### Page Layout		
```		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  👔 Recruiting                                         [+ Post Job]           │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                                                                              │		
│  📊 RECRUITING SUMMARY                                                       │		
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐                │		
│  │ Open Roles  │ Applications│ Interviews │ Hired YTD   │                │		
│  │ 3           │ 45          │ 12         │ 8           │                │		
│  └─────────────┴─────────────┴─────────────┴─────────────┘                │		
│                                                                              │		
│  📋 OPEN POSITIONS                                                           │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Position        │ Dept    │ Posted   │ Applicants│ Stage    │ Actions ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sr. Developer   │ Eng     │ Dec 01   │ 28        │ Interview│ [View]  ││		
│  │ $120-150k       │         │          │           │ 5 cand. │         ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Sales Rep      │ Sales   │ Dec 05   │ 12        │ Phone Scr│ [View]  ││		
│  │ $75-90k + comm │         │          │           │ 8 cand. │         ││		
│  ├─────────────────────────────────────────────────────────────────────────┤│		
│  │ Marketing Mgr  │ Marketing│ Dec 10   │ 5         │ Review  │ [View]  ││		
│  │ $85-100k       │         │          │           │ 5 cand. │         ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
│  📋 HIRING PIPELINE                                                          │		
│  ┌───────────────────────────────────────────────────────────────────────┐ │		
│  │                                                                        │ │		
│  │  Applied (45)  →  Screening (18)  →  Interview (8)  →  Offer (2)     │ │		
│  │  ████████████      ████████           ████               █           │ │		
│  │                                                                        │ │		
│  └───────────────────────────────────────────────────────────────────────┘ │		
│                                                                              │		
│  📋 RECENT ACTIVITY                                                          │		
│  ┌─────────────────────────────────────────────────────────────────────────┐│		
│  │ Dec 15 │ Jane Doe completed final interview for Sr. Developer        ││		
│  │ Dec 14 │ 3 new applications for Sales Rep                             ││		
│  │ Dec 13 │ Offer extended to Tom Wilson for Sales Rep                   ││		
│  │ Dec 12 │ Phone screen completed for Marketing Mgr position            ││		
│  └─────────────────────────────────────────────────────────────────────────┘│		
│                                                                              │		
└─────────────────────────────────────────────────────────────────────────────┘		
```		
		
---		
		
*(Continuing with ACCOUNTING, REPORTS, TAXES, COMPLIANCE, AUTOMATION, ACCOUNTANT WORKSPACE, FINANCIAL SERVICES, APPS & INTEGRATIONS, and SETTINGS...)*		
		
---		
		
		
Haypbooks v2 - Left Sidebar Navigation		
Detailed Page Specifications - Remaining Sections		
6. PROJECTS SECTION		
The Projects section provides comprehensive project management capabilities integrated with accounting, enabling businesses to track project profitability, manage resources, and maintain project-based financial reporting. This section is optional and can be enabled based on business needs, making it particularly valuable for service-based businesses, consultants, agencies, and construction companies that need to track work by project or job.		
6.1 Projects Overview		
The Projects Overview provides a dashboard-level view of all active projects with key performance indicators, profitability metrics, and resource utilization at a glance. This page serves as the central command center for project managers and executives who need to understand overall project health without diving into individual project details. The overview consolidates real-time data from timesheets, expenses, invoices, and budgets to provide actionable insights.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [New Project ▼]  [Import]  [Export]  [≡]           🔍 Search projects...  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │		
│ │ Active       │ │ Completed    │ │ On Hold      │ │ At Risk      │        │		
│ │ 24 projects  │ │ 156 projects │ │ 8 projects   │ │ 3 projects   │        │		
│ │ ▲ 12%        │ │ ▲ 8%         │ │ ▼ 2%         │ │ ▼ 5%         │        │		
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Total Revenue │ Total Costs  │ Gross Profit │ Profit Margin│ Avg Duration │		
│ $1,245,000   │ $892,000     │ $353,000     │ 28.4%       │ 45 days      │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Filter: [All Status ▼] [All Customers ▼] [Date Range ▼] [Manager ▼]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ☐ │ Project         │ Customer     │ Status   │ Budget  │ Actual  │ %     │		
│ ☐ │ Website Redesign│ Acme Corp    │ ● Active │ $50,000 │ $32,500 │ 65%   │		
│ ☐ │ App Development │ TechStart    │ ● Active │ $120,000│ $98,000 │ 82%   │		
│ ☐ │ Marketing Camp. │ LocalBiz     │ ⚠ At Risk│ $25,000 │ $28,000 │ 112%  │		
└─────────────────────────────────────────────────────────────────────────────┘		
Header Buttons:		
•	New Project (dropdown): Create Project, Create from Template, Quick Project	
•	Import: Import from CSV, Import from TSheets, Import from Asana	
•	Export: Export to Excel, Export to PDF, Export Summary Report	
Summary Cards:		
Card	Metrics	Description
Active Projects	Count, % Change	Currently open projects with activity in last 30 days
Completed	Count, % Change	Projects marked complete in selected period
On Hold	Count, % Change	Paused projects awaiting resources or decisions
At Risk	Count, Trend	Projects over budget or behind schedule (red highlight)
Total Revenue	$ Amount	Sum of all invoiced amounts for active projects
Total Costs	$ Amount	Sum of labor, materials, and expenses for active projects
Gross Profit	$ Amount, %	Revenue minus costs; indicates overall project profitability
Profit Margin	Percentage	Average profit margin across all active projects
Avg Duration	Days	Average time from project start to completion
6.2 Project List		
The Project List provides a comprehensive view of all projects with powerful filtering, sorting, and bulk action capabilities. Each project row displays essential information including customer, status, budget utilization, and profitability metrics. The list supports multiple view modes including list view, card view, and timeline view, catering to different user preferences and workflow needs.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [New Project]  [Import]  [Export]  [View: List|Cards|Timeline]             │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Filter: [All Status ▼] [All Customers ▼] [Manager ▼] [Date Range ▼]        │		
│          [Budget: All ▼] [Profitability: All ▼]                             │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ☐ │ Project Name   │ Customer  │ Status  │ Start    │ End      │ Budget   │		
│───┼────────────────┼───────────┼─────────┼──────────┼──────────┼──────────│		
│ ☐ │ Website Design │ Acme Corp │ Active  │ 01/15/24 │ 03/30/24 │ $50,000  │		
│   │                │           │         │          │          │          │		
│   │ ── Progress: ████████░░ 80% │ Budget: $40,000/$50,000 │ Profit: $8,500 │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Row Actions: [View] [Edit] [Duplicate] [Invoice] [Add Time] [Close] [More↓]│		
└─────────────────────────────────────────────────────────────────────────────┘		
Table Columns:		
Column	Details	
Project Name	Clickable link to project detail; shows project icon/color indicator	
Customer	Linked customer name with quick-access popover for contact info	
Status	Active (green), Completed (gray), On Hold (yellow), At Risk (red)	
Start/End Date	Planned dates; overdue items highlighted in red	
Budget	Total budget with actual spent; progress bar visualization	
Profit/Loss	Real-time profit calculation: Invoiced - (Labor + Expenses)	
% Complete	Progress percentage based on tasks, time, or manual entry	
Manager	Assigned project manager with avatar	
6.3 Project Detail Page		
The Project Detail page provides a 360-degree view of a single project, consolidating all project-related information including financials, tasks, time entries, expenses, and invoices. The page uses a tabbed interface to organize information logically while maintaining access to key metrics at the top of the page. This design enables project managers to quickly assess project health and dive into specific areas as needed.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│ ← Back to Projects         Website Redesign - Acme Corp                     │		
│                             [Edit] [More ▼]                                 │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │		
│ │ Budget Used  │ │ Invoiced     │ │ Costs        │ │ Profit       │        │		
│ │ $40,000/50K  │ │ $45,000      │ │ $36,500      │ │ $8,500 (19%) │        │		
│ │ ████████░░80%│ │              │ │              │ │              │        │		
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ [Overview] [Tasks] [Time Activity] [Expenses] [Invoices] [Transactions]     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ OVERVIEW TAB:                                                               │		
│ ┌─────────────────────────────────────┬───────────────────────────────────┐ │		
│ │ Project Info                        │ Recent Activity                  │ │		
│ │ Status: Active                      │ • Invoice #1042 sent - $5,000    │ │		
│ │ Start: Jan 15, 2024                 │ • Time entry by John D. - 4 hrs  │ │		
│ │ End: Mar 30, 2024                   │ • Expense added - $125 (Travel)  │ │		
│ │ Manager: Sarah K.                   │ • Task completed: Design mockup  │ │		
│ │ Rate: $150/hr                       │                                  │ │		
│ └─────────────────────────────────────┴───────────────────────────────────┘ │		
│ ┌─────────────────────────────────────────────────────────────────────────┐ │		
│ │ Budget Breakdown                                                        │ │		
│ │ Labor: $28,000 (70%) ████████████████████░░░░░░░░  $28,000 / $35,000   │ │		
│ │ Materials: $5,000 (12.5%) ████████████████░░░░░░░░  $5,000 / $10,000   │ │		
│ │ Expenses: $7,500 (18.75%) ████████████████████░░░░  $7,500 / $5,000 ⚠  │ │		
│ └─────────────────────────────────────────────────────────────────────────┘ │		
└─────────────────────────────────────────────────────────────────────────────┘		
Tab Sections:		
•	Overview: Project info, budget breakdown, recent activity, profit/loss chart	
•	Tasks: Task list with assignees, due dates, status; drag-and-drop Kanban option	
•	Time Activity: All time entries with filters by employee, date range, billable status	
•	Expenses: Project-related expenses with receipt attachments	
•	Invoices: All invoices linked to this project with payment status	
•	Transactions: Full transaction history including journal entries	
6.4 Project Invoicing		
Project Invoicing enables flexible billing arrangements including fixed-price, time and materials, and milestone-based invoicing. The system supports progress invoicing where customers are billed incrementally as work progresses, with automatic calculation of remaining amounts. Retainer billing is also supported for ongoing projects with recurring billing cycles.		
Invoice from Project Actions:		
•	Invoice for Entire Project: Creates invoice for all unbilled time and expenses	
•	Progress Invoice: Bills a percentage of total project value (e.g., 25% milestone)	
•	Invoice Selected Items: Choose specific time entries and expenses to bill	
•	Retainer Invoice: Bill against prepaid retainer balance	
•	Recurring Invoice: Set up automatic billing at regular intervals	
Accounting Effects - Project Invoice Creation:		
Account	Debit/Credit	Notes
Accounts Receivable	Debit	Customer balance increases by invoice total
Project Revenue	Credit	Revenue recognized for project services
Sales Tax Payable	Credit	If taxable, sales tax liability recorded
6.5 Project Reports		
The Project Reports section provides analytical tools to evaluate project performance across the organization. Reports can be customized by date range, customer, project manager, and other dimensions, with export options to Excel, PDF, and scheduled email delivery. These reports are essential for understanding profitability trends and making data-driven decisions about resource allocation and pricing strategies.		
Available Project Reports:		
•	Project Profitability: Compare actual vs. budgeted costs and revenue by project	
•	Time by Project: Hours logged by employee, billable vs. non-billable breakdown	
•	Expenses by Project: Categorized expense analysis with receipt attachments	
•	Project Aging: Unbilled time and expenses by project age	
•	Resource Utilization: Employee hours allocated across projects	
•	WIP (Work in Progress): Unbilled work accumulating on active projects	
•	Project Cash Flow: Projected invoicing and payments by project	
•	Customer Project Summary: All projects for a customer in one view	
		
7. TIME SECTION		
The Time section provides comprehensive time tracking capabilities that integrate seamlessly with projects, payroll, and billing. This section is essential for service-based businesses that bill by the hour or need to track employee productivity. Time entries can be linked to projects for accurate job costing, customers for billing purposes, and service items for rate calculations. The system supports both individual time entry and weekly timesheet workflows, with mobile apps for field workers.		
7.1 Time Overview		
The Time Overview provides a dashboard showing time tracking metrics across the organization. It highlights key performance indicators such as total hours logged, billable utilization, and unbilled time that represents potential revenue. Managers can quickly identify employees with missing timesheets or unusual patterns that may require attention.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [Add Time]  [Weekly Timesheet]  [Export]  [≡]       🔍 Search time...     │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │		
│ │ This Week    │ │ Billable     │ │ Unbilled     │ │ Missing      │        │		
│ │ 285 hours    │ │ 78%          │ │ $12,450      │ │ 3 timesheets │        │		
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌─────────────────────────────────────────────────────────────────────────┐ │		
│ │ Today's Activity                                                        │ │		
│ │ John D.   ████████████░░░░  6.5 hrs  Design, Client meetings            │ │		
│ │ Sarah K.  ████████████████  8.0 hrs  Project management                 │ │		
│ │ Mike R.   ████████░░░░░░░░  4.0 hrs  Development (clocked in: 9:00 AM)  │ │		
│ └─────────────────────────────────────────────────────────────────────────┘ │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Filter: [This Week ▼] [All Employees ▼] [All Projects ▼] [Billable: All ▼] │		
└─────────────────────────────────────────────────────────────────────────────┘		
7.2 Time Activity List		
The Time Activity List displays all time entries with comprehensive filtering and sorting capabilities. Each entry shows the employee, project, customer, service item, hours, billable status, and notes. The list supports bulk operations for approving, billing, or modifying multiple entries at once, making it efficient for managers to review and process timesheet data.		
Table Columns:		
Column	Details	
Date	Date the work was performed	
Employee	Employee who logged time with avatar	
Customer:Project	Linked customer and optional project	
Service Item	Type of work performed (determines billing rate)	
Hours	Time duration in hours:minutes format	
Billable	Yes/No with hourly rate and total value	
Status	Unbilled, Invoiced, or Non-Billable	
Notes	Description of work performed	
7.3 Weekly Timesheet		
The Weekly Timesheet provides a grid-based interface for entering time across multiple days and projects. Employees can quickly fill in their hours for the week, with automatic calculations for daily and weekly totals. The timesheet supports copying from previous weeks, saving as drafts, and submitting for manager approval. Administrators can configure approval workflows and lock timesheets after approval to prevent unauthorized changes.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│ Weekly Timesheet - John Smith                  Week of: Jan 15 - Jan 21    │		
│ [Previous] [Next] [Today]           Status: Draft    [Save] [Submit]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Customer:Project  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │ Total │		
│───────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼───────│		
│ Acme: Web Design  │  4.0 │  6.0 │  5.0 │  4.0 │  3.0 │      │      │ 22.0  │		
│ TechStart: Dev    │  3.0 │  2.0 │  3.0 │  4.0 │  4.0 │      │      │ 16.0  │		
│ Internal: Meeting │  1.0 │      │      │      │  1.0 │      │      │  2.0  │		
│───────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼───────│		
│ Daily Total       │  8.0 │  8.0 │  8.0 │  8.0 │  8.0 │  0.0  │  0.0  │ 40.0  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ [+ Add Row]                                                                 │		
└─────────────────────────────────────────────────────────────────────────────┘		
7.4 Time Approval		
Time Approval enables managers to review and approve employee timesheets before they are processed for billing or payroll. The approval workflow can be configured to require single or multi-level approval based on organization needs. Managers can approve, reject with comments, or request modifications, with full audit trail of all approval actions. Email notifications alert employees when their timesheets are approved or require revision.		
Approval Workflow Options:		
•	No Approval Required: Time entries immediately available for invoicing	
•	Single Approval: One manager approves before processing	
•	Multi-Level Approval: Requires approval chain (e.g., PM then Finance)	
•	Project-Based Approval: Project manager approves project-specific time	
•	Auto-Approval: Auto-approve after X days if no action taken	
		
8. INVENTORY SECTION		
The Inventory section provides comprehensive stock management capabilities integrated with sales and purchasing. This section is optional and ideal for businesses that sell physical products, whether they are retailers, wholesalers, or manufacturers. The system supports multiple warehouses, lot tracking, serial numbers, and FIFO/LIFO costing methods. Real-time inventory updates occur automatically as sales orders, purchase orders, and inventory adjustments are processed, ensuring accurate stock levels at all times.		
8.1 Inventory Overview		
The Inventory Overview provides a dashboard view of inventory health, highlighting key metrics such as total inventory value, turnover rates, and items requiring attention. The dashboard alerts users to low stock situations, items approaching expiration (for perishable goods), and potential overstock conditions that may tie up working capital unnecessarily.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [New Item]  [Adjustment]  [Transfer]  [Export]        🔍 Search items...   │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │		
│ │ Total Items  │ │ Inventory    │ │ Low Stock    │ │ Out of Stock │        │		
│ │ 1,247        │ │ Value        │ │ Alerts       │ │ Items        │        │		
│ │              │ │ $284,500     │ │ 12 items     │ │ 3 items      │        │		
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌─────────────────────────────────────────────────────────────────────────┐ │		
│ │ Low Stock Alerts                                                        │ │		
│ │ ⚠ Widget-A (SKU: W-001): 5 units - Reorder Point: 25                   │ │		
│ │ ⚠ Gadget-B (SKU: G-002): 12 units - Reorder Point: 50                  │ │		
│ │ ⚠ Component-X (SKU: C-101): 0 units - OUT OF STOCK                     │ │		
│ └─────────────────────────────────────────────────────────────────────────┘ │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Filter: [All Categories ▼] [All Warehouses ▼] [Stock Status ▼]             │		
└─────────────────────────────────────────────────────────────────────────────┘		
8.2 Products & Services (Inventory Items)		
The Products & Services page manages the item master, which includes inventory items, non-inventory items, services, and bundles. Each item record contains detailed information including pricing, costing, tracking preferences, and associated accounts. The system supports multiple pricing levels, quantity discounts, and customer-specific pricing for sophisticated pricing strategies.		
Item Types:		
Type	Description	
Inventory Item	Physical goods tracked with quantity on hand, cost of goods sold	
Non-Inventory	Items purchased/sold but not tracked for quantity (e.g., supplies)	
Service	Services provided to customers, optionally linked to time tracking	
Bundle	Group of items sold together as a package	
Assembly	Manufactured item composed of component inventory items	
Item Record Fields:		
•	Basic Info: Name, SKU/Item Number, Description, Category, Active status	
•	Sales Info: Sales Price, Sales Description, Income Account, Tax Code	
•	Purchasing Info: Cost, Purchase Description, Expense Account, Preferred Vendor	
•	Inventory Tracking: Quantity on Hand, Reorder Point, Preferred Vendor, Lead Time	
•	Warehouse Locations: Quantity by location, bin/shelf location	
•	Accounting: Asset Account (Inventory), COGS Account, Income Account	
8.3 Inventory Valuation		
Inventory Valuation reports show the total value of inventory on hand using the selected costing method (FIFO, LIFO, Average, or Standard Cost). The valuation is updated in real-time as transactions occur, providing an accurate view of inventory assets on the balance sheet. Users can drill down to see the detailed cost layers that make up the valuation for each item.		
Costing Methods Supported:		
•	FIFO (First In, First Out): Oldest costs assigned to COGS first	
•	LIFO (Last In, First Out): Newest costs assigned to COGS first	
•	Average Cost: Weighted average of all purchase costs	
•	Standard Cost: Predetermined cost used for variance analysis	
8.4 Inventory Adjustments		
Inventory Adjustments allow users to correct stock levels due to damage, theft, found items, or count discrepancies. Each adjustment requires a reason code and creates an audit trail. Adjustments can be made to individual items or in batch for cycle counting purposes. The accounting impact of adjustments is automatically recorded based on the adjustment type.		
Accounting Effects - Inventory Adjustment:		
Scenario	Debit	Credit
Quantity Increase	Inventory Asset	Inventory Adjustment Income or COGS
Quantity Decrease	COGS or Inventory Adjustment Expense	Inventory Asset
		
9. PAYROLL & WORKFORCE SECTION		
The Payroll & Workforce section provides comprehensive payroll processing and employee management capabilities. This section handles everything from employee onboarding and time tracking integration to payroll calculation, tax withholding, and direct deposit processing. The system supports multiple pay schedules, various pay types (hourly, salary, commission, bonus), and handles complex scenarios like garnishments, benefits deductions, and retirement contributions. Full-service payroll includes automatic tax filing and year-end W-2/1099 generation.		
9.1 Payroll Overview		
The Payroll Overview provides a snapshot of upcoming payroll obligations, recent payroll history, and alerts for items requiring attention. The dashboard shows total payroll costs, tax liabilities, and scheduled payroll dates. Quick actions allow managers to run payroll, review timesheets, and access essential payroll reports.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [Run Payroll]  [Add Employee]  [Export]            🔍 Search employees... │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │		
│ │ Next Payroll │ │ Employees    │ │ YTD Wages    │ │ Tax Liabilities│      │		
│ │ Jan 31, 2024 │ │ 47 Active    │ │ $1,245,000   │ │ $87,500       │        │		
│ │ 5 days       │ │ 2 Onboarding │ │              │ │ Due: Feb 15   │        │		
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌─────────────────────────────────────────────────────────────────────────┐ │		
│ │ Upcoming Payroll: Jan 31, 2024 (Bi-weekly)                              │ │		
│ │ Gross Pay: $98,500  │  Taxes: $24,125  │  Deductions: $8,200           │ │		
│ │ Net Pay: $66,175    │  Direct Deposit: 45 employees                    │ │		
│ │                                         [Review] [Approve]              │ │		
│ └─────────────────────────────────────────────────────────────────────────┘ │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Alerts:                                                                     │		
│ ⚠ 2 employees missing direct deposit info                                   │		
│ ⚠ 3 timesheets pending approval                                             │		
│ ℹ Tax payment due Feb 15 - $87,500                                         │		
└─────────────────────────────────────────────────────────────────────────────┘		
9.2 Employees		
The Employees page manages the employee roster with comprehensive records for each team member. Employee records contain personal information, employment details, compensation, tax withholdings, benefits elections, and direct deposit settings. The system maintains a complete history of employment changes including salary adjustments, promotions, and status changes.		
Employee Record Sections:		
•	Personal Info: Name, SSN (masked), Address, Contact, Emergency Contact	
•	Employment: Hire Date, Status, Department, Location, Manager, Job Title	
•	Compensation: Pay Type (Hourly/Salary), Pay Rate, Pay Schedule, Overtime	
•	Tax Info: Federal W-4, State W-4, Local tax settings, Filing Status	
•	Deductions: Benefits, 401(k), Garnishments, Other voluntary deductions	
•	Direct Deposit: Bank accounts, allocation percentages, pay stub delivery	
•	Time Tracking: Time approver, default labor categories, overtime rules	
9.3 Run Payroll		
The Run Payroll workflow guides users through the payroll process step by step. The system automatically calculates gross pay from time entries and salary records, applies tax withholdings based on employee W-4 settings, processes deductions, and calculates net pay. Users can review and adjust individual employee pay before finalizing, with options to preview pay stubs and payroll registers.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│ Run Payroll - Step 2 of 4: Review Hours                                    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Pay Period: Jan 15 - Jan 28, 2024    Pay Date: Jan 31, 2024                │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Employee        │ Reg Hrs │ OT Hrs │ Salary   │ Bonus │ Total Gross        │		
│ John Smith      │  80.0   │  5.0   │          │       │ $2,037.50          │		
│ Jane Doe        │  80.0   │        │ $4,000.00│       │ $4,000.00          │		
│ Mike Johnson    │  72.0   │        │          │ $500  │ $1,440.00          │		
│─────────────────┼─────────┼────────┼──────────┼───────┼────────────────────│		
│ Totals          │ 232.0   │  5.0   │ $4,000.00│ $500  │ $7,477.50          │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                              [Back] [Next: Review Taxes]                    │		
└─────────────────────────────────────────────────────────────────────────────┘		
Payroll Workflow Steps:		
•	Step 1: Select Pay Schedule - Choose which pay group to process	
•	Step 2: Review Hours - Verify time entries, enter bonuses/commissions	
•	Step 3: Review Taxes - Confirm tax calculations and liabilities	
•	Step 4: Preview & Submit - Review summary, approve and submit	
9.4 Contractors & 1099s		
The Contractors section manages independent contractors who receive 1099 forms rather than W-2s. Contractor records track personal information, payment terms, and YTD payments. The system automatically generates 1099-NEC forms at year-end for contractors meeting the $600 threshold, with electronic filing to the IRS and state agencies where applicable.		
1099 Filing Process:		
•	Review contractor payments for the tax year	
•	Verify contractor information (name, address, TIN)	
•	Generate 1099-NEC forms for contractors over $600	
•	Email/print forms for contractors	
•	E-file with IRS and applicable states	
•	Generate 1096 summary transmittal	
		
10. ACCOUNTING SECTION		
The Accounting section provides the core double-entry bookkeeping functionality that forms the foundation of the entire system. This section gives accountants and bookkeepers direct access to the chart of accounts, journal entries, and financial reporting. Advanced features include multi-currency support, account reconciliation tools, closing procedures, and audit trails. The accounting engine automatically generates journal entries from transactions throughout the system while allowing manual entries for adjustments and corrections.		
10.1 Chart of Accounts		
The Chart of Accounts displays the complete list of general ledger accounts organized by type. The system comes with a default chart of accounts that can be customized to match the business's needs. Accounts can be added, edited, inactivated, or merged as the business evolves. Each account shows the current balance with drill-down capability to see all transactions affecting that account.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [New Account]  [Import]  [Export]  [Print]          🔍 Search accounts... │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Filter: [All Types ▼] [Active Only ▼]                                       │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Account #  │ Account Name         │ Type        │ Balance      │ Actions   │		
│────────────┼──────────────────────┼─────────────┼──────────────┼───────────│		
│ 1000       │ Cash and Cash Equiv. │ Asset       │ $125,450.00  │ [View]    │		
│   1001     │   Operating Account  │ Bank        │ $98,500.00   │ [View]    │		
│   1002     │   Payroll Account    │ Bank        │ $15,000.00   │ [View]    │		
│   1003     │   Petty Cash         │ Bank        │ $500.00      │ [View]    │		
│ 1100       │ Accounts Receivable  │ Asset       │ $45,200.00   │ [View]    │		
│ 1200       │ Inventory            │ Asset       │ $284,500.00  │ [View]    │		
│ 2000       │ Accounts Payable     │ Liability   │ $32,150.00   │ [View]    │		
│ 3000       │ Equity               │ Equity      │ $542,000.00  │ [View]    │		
│ 4000       │ Revenue              │ Income      │ $892,000.00  │ [View]    │		
│ 5000       │ Cost of Goods Sold   │ Expense     │ $456,000.00  │ [View]    │		
│ 6000       │ Operating Expenses   │ Expense     │ $198,500.00  │ [View]    │		
└─────────────────────────────────────────────────────────────────────────────┘		
Account Types:		
Type	Description	
Asset	Resources owned: Bank, Accounts Receivable, Inventory, Fixed Assets	
Liability	Obligations: Accounts Payable, Credit Cards, Loans, Taxes Payable	
Equity	Owner's interest: Capital, Retained Earnings, Draws	
Income	Revenue from operations: Sales, Service Income, Interest Income	
Expense	Costs of operations: COGS, Rent, Utilities, Wages, Marketing	
Other Income	Non-operating income: Gain on Sale, Investment Income	
Other Expense	Non-operating expenses: Loss on Sale, Interest Expense	
10.2 Journal Entries		
Journal Entries allow direct posting to the general ledger for adjustments, corrections, and transactions not handled elsewhere in the system. Each entry must balance (debits = credits) and includes a reference number, date, memo, and optional attachments. The system supports recurring journal entries for monthly allocations, depreciation, and other regular adjustments.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│ New Journal Entry                                         Entry #: JE-1042 │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Date: [01/31/2024]  │ Reference: [Monthly Accrual]  │ Reversing: [ ]        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Memo: January 2024 accrued expenses adjustment                             │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Account              │ Description      │ Debit      │ Credit     │        │		
│──────────────────────┼──────────────────┼────────────┼────────────│        │		
│ 6500 - Utilities     │ Jan electric     │ $1,500.00  │            │ [Del]  │		
│ 2100 - Accrued Exp.  │ Accrual          │            │ $1,500.00  │ [Del]  │		
│──────────────────────┴──────────────────┴────────────┴────────────│        │		
│                                              Total: $1,500.00  $1,500.00    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Attachments: [Upload File]                                                  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│                              [Cancel] [Save & New] [Save]                   │		
└─────────────────────────────────────────────────────────────────────────────┘		
Journal Entry Features:		
•	Auto-numbering: Sequential entry numbers for audit trail	
•	Reversing Entries: Automatically reverse on specified future date	
•	Recurring Entries: Schedule monthly/quarterly/yearly entries	
•	Allocations: Distribute amounts by percentage or fixed amounts	
•	Templates: Save common entry patterns for reuse	
•	Approval Workflow: Require approval before posting (optional)	
10.3 Account Reconciliation		
Account Reconciliation provides tools to match transactions in Haypbooks to external records such as bank statements and credit card statements. The reconciliation process identifies discrepancies and allows users to add missing transactions or flag items for investigation. Completing reconciliation each period ensures the accuracy of financial statements.		
Reconciliation Workflow:		
•	Step 1: Select account and enter statement ending balance	
•	Step 2: Match cleared transactions to statement items	
•	Step 3: Identify and resolve discrepancies	
•	Step 4: Complete reconciliation when difference is zero	
•	Step 5: View reconciliation history and reports	
10.4 Close Books		
The Close Books feature allows administrators to lock accounting periods to prevent changes to historical data. Closing periods is essential for maintaining accurate financial records and preventing unauthorized modifications after reports have been generated and taxes filed. The system supports partial closing (close prior months while leaving current month open) and can warn users attempting to modify closed periods.		
Closing Options:		
•	Soft Close: Warns users but allows changes with confirmation	
•	Hard Close: Prevents all changes to the closed period	
•	Password Required: Requires admin password to modify closed periods	
•	Year-End Close: Transfers net income to retained earnings	
		
11. REPORTS SECTION		
The Reports section provides comprehensive financial and management reporting capabilities with over 160 standard reports organized by category. Reports can be customized with filters, date ranges, and column selections, then saved as custom reports for reuse. Advanced features include scheduled report delivery, export to multiple formats, and drill-down capability from summary to detail. The reporting engine draws data from all modules to provide a complete view of business performance.		
11.1 Reports Overview		
The Reports Overview provides a dashboard showing frequently used reports, recent reports, and quick access to standard reports by category. Users can search for reports by name or keyword, access custom reports they've created, and manage scheduled report deliveries. The overview also highlights reports with exceptions or anomalies that may require attention.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [New Custom Report]  [Schedule]  [Export All]       🔍 Search reports...  │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌─────────────────────────────────────────────────────────────────────────┐ │		
│ │ Favorites (drag reports here to pin)                                    │ │		
│ │ [Profit & Loss] [Balance Sheet] [A/R Aging] [Cash Flow] [Sales by Cust] │ │		
│ └─────────────────────────────────────────────────────────────────────────┘ │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Report Categories:                                                          │		
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                   │		
│ │ 📊 Financial   │ │ 💰 Sales       │ │ 💳 Expenses    │                   │		
│ │ Reports (26)   │ │ Reports (35)   │ │ Reports (27)   │                   │		
│ └────────────────┘ └────────────────┘ └────────────────┘                   │		
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                   │		
│ │ 📁 Project     │ │ 👥 Payroll     │ │ 📦 Inventory   │                   │		
│ │ Reports (8)    │ │ Reports (13)   │ │ Reports (10)   │                   │		
│ └────────────────┘ └────────────────┘ └────────────────┘                   │		
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                   │		
│ │ 📋 Tax Reports │ │ 🔧 Accountant  │ │ 📈 Management  │                   │		
│ │ (10)           │ │ Reports (22)   │ │ Reports (12)   │                   │		
│ └────────────────┘ └────────────────┘ └────────────────┘                   │		
└─────────────────────────────────────────────────────────────────────────────┘		
11.2 Financial Reports		
Financial Reports provide the core financial statements and supporting schedules needed for management oversight and external reporting. These reports follow standard accounting formats and can be configured to match the organization's chart of accounts structure. Financial reports support comparison periods, budget vs. actual analysis, and percentage of revenue calculations.		
Key Financial Reports:		
Report	Description	
Profit & Loss	Income statement showing revenue, expenses, and net income	
Balance Sheet	Assets, liabilities, and equity at a point in time	
Cash Flow Statement	Operating, investing, financing cash flows	
Statement of Changes in Equity	Movement in equity accounts over period	
Trial Balance	All accounts with debit/credit balances	
General Ledger	Detailed transaction history by account	
Budget vs. Actual	Compare budgeted amounts to actual results	
11.3 Sales Reports		
Sales Reports analyze revenue performance from multiple angles including customer, product, salesperson, and geography. These reports help identify top performers, best-selling products, and customer buying patterns. Aging reports highlight collection priorities and potential write-offs.		
Key Sales Reports:		
•	Sales by Customer Summary: Total sales per customer with trend	
•	Sales by Product/Service: Revenue by item with quantity and margin	
•	A/R Aging: Outstanding receivables by time bucket (current, 30, 60, 90+)	
•	Invoice List: All invoices with filters by date, customer, status	
•	Collections Report: Overdue invoices with contact history	
•	Sales by Salesperson: Performance by rep with commission calculations	
•	Customer Balance Detail: All transactions affecting customer balance	
11.4 Custom Reports		
Custom Reports allow users to create tailored reports by selecting specific columns, filters, and sorting criteria. Reports can combine data from multiple modules (e.g., sales with project costs) and can be saved for reuse. Advanced users can create reports with calculated fields, conditional formatting, and complex filtering logic.		
Custom Report Features:		
•	Column Selection: Choose which fields to display	
•	Filtering: Multiple filters with AND/OR logic	
•	Sorting: Multi-level sorting by any column	
•	Grouping: Subtotal by any field (e.g., by customer, by month)	
•	Calculated Fields: Create formulas based on other fields	
•	Sharing: Share reports with specific users or all users	
•	Scheduling: Schedule automatic delivery via email	
		
12. TAXES SECTION		
The Taxes section provides comprehensive tax management capabilities including sales tax tracking, calculation, and filing; income tax preparation support; and integration with tax filing services. The system maintains tax rates for multiple jurisdictions, automatically calculates taxes on transactions, and generates reports needed for tax compliance. Sales tax features support complex scenarios including nexus tracking, tax-exempt customers, and product-specific tax codes.		
12.1 Tax Overview		
The Tax Overview provides a dashboard showing tax obligations across all jurisdictions. Users can see upcoming filing deadlines, current tax liabilities, and recent filing history. The dashboard alerts users to missing tax rates, exemption certificates nearing expiration, and other items requiring attention.		
┌─────────────────────────────────────────────────────────────────────────────┐		
│  [Add Tax Rate]  [File Return]  [Export]             🔍 Search taxes...    │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │		
│ │ Sales Tax    │ │ Use Tax      │ │ Next Filing  │ │ Exempt Certs │        │		
│ │ Liability    │ │ Liability    │ │ Due Date     │ │ Expiring     │        │		
│ │ $12,450      │ │ $850         │ │ Feb 20, 2024 │ │ 3 in 30 days │        │		
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │		
├─────────────────────────────────────────────────────────────────────────────┤		
│ Upcoming Filing Deadlines:                                                  │		
│ ┌─────────────────────────────────────────────────────────────────────────┐ │		
│ │ Jurisdiction    │ Period    │ Due Date  │ Amount  │ Status              │ │		
│ │ California      │ Jan 2024  │ Feb 20    │ $8,200  │ Ready to file       │ │		
│ │ New York        │ Jan 2024  │ Feb 20    │ $2,850  │ Ready to file       │ │		
│ │ Texas           │ Q4 2023   │ Jan 20    │ $1,400  │ ✓ Filed             │ │		
│ └─────────────────────────────────────────────────────────────────────────┘ │		
└─────────────────────────────────────────────────────────────────────────────┘		
12.2 Sales Tax Management		
Sales Tax Management handles the configuration of tax rates for all jurisdictions where the business has nexus (tax obligation). The system supports origin-based and destination-based tax calculation methods, compound taxes, and tax-inclusive pricing. Automated rate updates are available for US and Canadian jurisdictions to keep rates current as legislation changes.		
Sales Tax Features:		
•	Tax Agencies: Define tax authorities for reporting and payments	
•	Tax Rates: Combined rates for state, county, city, special districts	
•	Tax Codes: Product/service categorization for tax rules	
•	Exemptions: Customer exemption certificates with expiration tracking	
•	Nexus Tracking: Record where business has tax obligation	
•	Tax Groups: Combine multiple taxes for simplified application	
12.3 Tax Filing		
Tax Filing streamlines the process of preparing and submitting sales tax returns. The system generates pre-filled tax forms based on recorded transactions, calculates amounts due, and supports electronic filing where available. Users can review and adjust return figures before submission, with complete audit trail of all filings.		
Tax Filing Workflow:		
•	Step 1: Select tax agency and filing period	
•	Step 2: Review taxable sales and tax collected	
•	Step 3: Adjust for exemptions, deductions, credits	
•	Step 4: Review calculated tax due	
•	Step 5: File electronically or print return	
•	Step 6: Record payment and update liability	
12.4 1099 & Year-End Filing		
Year-End Tax Filing handles the preparation and submission of 1099 forms for vendors and contractors. The system automatically identifies vendors meeting filing thresholds, generates required forms, and files electronically with the IRS and applicable states. W-2 preparation and filing is handled through the Payroll module.		
1099 Filing Types:		
•	1099-NEC: Non-employee compensation (contractors over $600)	
•	1099-MISC: Rent, royalties, other income	
•	1099-INT: Interest payments over $10	
•	1099-K: Payment card and third-party transactions	
		
13. COMPLIANCE SECTION (ENTERPRISE)		
The Compliance section provides enterprise-grade controls and audit capabilities required by larger organizations and regulated industries. This section includes internal controls management, SOX compliance tools, audit trail reporting, and segregation of duties enforcement. These features help organizations maintain accountability, prevent fraud, and satisfy external audit requirements.		
13.1 Audit Trail		
Audit Trail provides a comprehensive log of all system activity including who made changes, what was changed, when it was changed, and the before/after values. This complete activity history is essential for compliance, troubleshooting, and investigating discrepancies. The audit trail cannot be modified or deleted, ensuring the integrity of historical records.		
Audit Trail Features:		
•	User Activity: Login history, actions performed, IP addresses	
•	Transaction History: All changes to invoices, bills, journal entries	
•	Master Data Changes: Customer, vendor, item modifications	
•	Configuration Changes: Settings, permissions, workflow modifications	
•	Data Exports: Who exported data, what was exported, when	
•	Search & Filter: Find activity by user, date, action type, or object	
13.2 User Permissions & Segregation of Duties		
User Permissions controls access to system functions based on roles and responsibilities. Enterprise features include segregation of duties enforcement that prevents conflicts of interest (e.g., same person cannot create and approve payments). Permission templates simplify user setup while ensuring consistent access control across the organization.		
Permission Levels:		
•	View Only: Read access without ability to modify	
•	Create: Can create new records, cannot edit or delete	
•	Edit: Can create and modify existing records	
•	Full: Create, edit, delete, and approve	
•	Admin: Full access including configuration	
13.3 Approval Workflows		
Approval Workflows enable multi-level approval processes for transactions that require oversight. Workflows can be configured based on transaction type, amount thresholds, or other criteria. The system routes transactions to appropriate approvers and maintains complete history of approval decisions.		
Workflow Examples:		
•	Invoice Approval: Invoices over $5,000 require manager approval	
•	Bill Payment: Payments over $10,000 require controller approval	
•	Journal Entry: Manual entries require accounting manager approval	
•	Customer Credit: Credits over $500 require CFO approval	
•	Vendor Setup: New vendors require procurement approval	
		
14. AUTOMATION SECTION		
The Automation section provides tools to streamline repetitive tasks and reduce manual data entry. Automation features include recurring transactions, bank rules for automatic categorization, workflow triggers, and integrations with external systems. These capabilities save time, reduce errors, and ensure consistency in routine processes.		
14.1 Recurring Transactions		
Recurring Transactions automatically create transactions on a scheduled basis. This is ideal for regular invoices (retainers, subscriptions), bills (rent, insurance), and journal entries (depreciation, amortization). Users configure the transaction template, frequency, start/end dates, and the system generates transactions automatically.		
Recurring Transaction Types:		
•	Recurring Invoice: Monthly retainers, subscription billing	
•	Recurring Bill: Regular expenses like rent, utilities	
•	Recurring Journal Entry: Monthly accruals, depreciation	
•	Recurring Expense: Regular employee reimbursements	
•	Recurring Transfer: Regular inter-account transfers	
14.2 Bank Rules		
Bank Rules automatically categorize and process bank feed transactions based on criteria you define. Rules can match on description, amount, or payee, and can automatically categorize transactions, add them to the register, or match them to existing transactions. This dramatically reduces the time spent on bank feed review.		
Rule Conditions:		
•	Description Contains: Match text in transaction description	
•	Amount Equals/Exceeds: Match based on transaction amount	
•	Payee Matches: Match specific vendor/customer	
•	Account Number: Match specific bank account	
Rule Actions:		
•	Categorize: Assign account, class, location automatically	
•	Add to Register: Auto-add without review	
•	Match to Existing: Link to open transactions	
•	Create Transaction: Generate bill, invoice, or expense	
14.3 Workflow Automation		
Workflow Automation enables triggered actions based on system events. Users can create workflows that automatically send reminders, create tasks, send notifications, or trigger external integrations when specific conditions are met. This extends automation beyond simple recurring transactions to responsive, event-driven processes.		
Workflow Triggers:		
•	Invoice Created: Automatically email invoice, create task	
•	Payment Received: Send thank you, update project status	
•	Bill Due: Send reminder, create approval task	
•	Invoice Overdue: Send dunning email, flag for collection	
•	Low Inventory: Create purchase requisition	
		
15. ACCOUNTANT WORKSPACE SECTION		
The Accountant Workspace provides specialized tools for accountants and bookkeepers who manage multiple clients or need advanced accounting capabilities. This section includes client management (for accounting firms), period close checklists, adjusting entry tools, and accountant-specific reports. The workspace can be toggled to show accountant-level features while hiding basic functionality.		
15.1 Client Management (Accounting Firms)		
Client Management enables accounting firms to organize and access all client companies from a single dashboard. Firm users can switch between client companies, track client information, manage billing, and monitor client status across their entire portfolio.		
Client Dashboard Features:		
•	Client List: All clients with status, last activity, upcoming deadlines	
•	Quick Switch: Jump between client companies instantly	
•	Client Notes: Shared notes visible to all firm members	
•	Deadline Tracking: Tax deadlines, filing dates, engagement milestones	
•	Team Access: Assign staff to specific clients	
•	Billing Integration: Track time and bill clients from the system	
15.2 Period Close Checklist		
The Period Close Checklist provides a structured workflow for month-end and year-end closing procedures. The checklist tracks completion of required tasks, assigns responsibilities, and ensures all closing procedures are completed before financial statements are finalized.		
Standard Close Tasks:		
•	Reconcile all bank accounts	
•	Reconcile credit card accounts	
•	Review and post recurring journal entries	
•	Review accounts receivable aging, write off bad debts	
•	Review accounts payable, accrue expenses	
•	Calculate and record depreciation	
•	Review inventory valuation	
•	Prepare and review financial statements	
•	Close the accounting period	
15.3 Accountant Reports		
Accountant Reports provide specialized reports used by accountants for analysis and working paper preparation. These reports support the review and audit process with detailed transaction listings, reconciliation reports, and exception reports that highlight potential issues.		
Accountant-Specific Reports:		
•	Transaction List by Date: Detailed listing with full drill-down	
•	Transaction List by Account: All transactions for selected accounts	
•	Reconciliation Reports: Bank, credit card, loan reconciliations	
•	Audit Trail: Complete change history for period	
•	Unusual Transactions: Outliers, round numbers, weekend entries	
•	Journal Entry Report: All manual entries with approval status	
•	Tax Summary: Income and deductions by category	
		
16. FINANCIAL SERVICES SECTION		
The Financial Services section provides access to integrated financial products including business loans, lines of credit, payment processing, and payroll funding. These services are offered through partnerships with financial institutions and can be accessed directly within the platform. Integration with accounting data streamlines the application process and provides real-time financial information for underwriting.		
16.1 Business Funding		
Business Funding provides access to financing options based on the company's financial profile. The system can pre-qualify businesses for loans and lines of credit using real-time accounting data, reducing application friction. Available products include term loans, lines of credit, invoice financing, and merchant cash advances.		
Funding Options:		
•	Term Loan: Fixed amount with scheduled repayment	
•	Line of Credit: Revolving credit facility for working capital	
•	Invoice Financing: Advance on outstanding invoices	
•	Equipment Financing: Purchase equipment with financing	
•	SBA Loans: Government-backed small business loans	
16.2 Payment Processing		
Payment Processing enables businesses to accept payments from customers via credit card, debit card, and ACH bank transfers. The integrated payment system syncs automatically with invoices, recording payments and updating receivables without manual entry. Competitive rates and next-day funding improve cash flow.		
Payment Features:		
•	Credit Card Processing: Accept Visa, MC, Amex, Discover	
•	ACH Processing: Bank transfers at lower cost	
•	Payment Links: Send payment links via email or text	
•	Invoice Payments: Customers pay directly from invoice	
•	Recurring Payments: Automatic billing for subscriptions	
•	Multi-Currency: Accept payments in multiple currencies	
16.3 Payroll Funding		
Payroll Funding provides short-term financing specifically for payroll obligations. This service helps businesses bridge timing gaps between paying employees and receiving customer payments. Integration with the payroll system enables automatic funding when cash position is insufficient for scheduled payroll.		
		
17. APPS & INTEGRATIONS SECTION		
The Apps & Integrations section provides access to the Haypbooks app marketplace where businesses can connect third-party applications to extend functionality. The ecosystem includes hundreds of integrations across categories including CRM, e-commerce, project management, inventory, and industry-specific solutions. All integrations are vetted for security and data privacy compliance.		
17.1 App Marketplace		
The App Marketplace browses available integrations by category or search. Each app listing includes features, pricing, reviews, and connection instructions. Users can install apps directly from the marketplace with automatic configuration where possible.		
Popular Integration Categories:		
•	CRM & Sales: Salesforce, HubSpot, Pipedrive, Zoho CRM	
•	E-commerce: Shopify, WooCommerce, Amazon, eBay, BigCommerce	
•	Payment Processors: Stripe, Square, PayPal, Authorize.net	
•	Time Tracking: TSheets, Harvest, Toggl, ClockShark	
•	Project Management: Asana, Trello, Monday.com, Basecamp	
•	Inventory: TradeGecko, Cin7, DEAR, inFlow	
•	Expense Management: Expensify, Receipt Bank, Rydoo	
17.2 Connected Apps		
Connected Apps shows all active integrations with status, sync settings, and usage statistics. Users can configure sync frequency, manage data mapping, and troubleshoot sync errors from this dashboard. Disconnection and data removal options are available for each connected app.		
Connection Management:		
•	Sync Status: Last sync time, pending items, errors	
•	Data Mapping: Configure how data translates between systems	
•	Sync Frequency: Real-time, hourly, daily, or manual	
•	Permissions: Control what data the app can access	
•	Disconnect: Remove integration and optionally delete synced data	
17.3 API Access		
API Access provides tools for developers building custom integrations. The section includes API key management, webhook configuration, and documentation links. Developers can create sandbox environments for testing without affecting production data.		
Developer Features:		
•	API Keys: Create and manage authentication credentials	
•	Webhooks: Configure real-time notifications for events	
•	Rate Limits: View current usage against limits	
•	Sandbox: Test environment for development	
•	Documentation: API reference and guides	
		
18. SETTINGS SECTION		
The Settings section provides access to all configuration options for customizing the system to match business needs. Settings are organized into logical categories including company information, account settings, users and permissions, billing, and advanced options. Most settings changes take effect immediately, though some may require system refresh or cache clearing.		
18.1 Company Settings		
Company Settings manages the fundamental business information including legal name, address, tax IDs, and branding options. This information appears on invoices, reports, and tax filings. Company settings also control fiscal year, accounting method, and base currency.		
Company Configuration:		
•	Legal Information: Company name, DBA, address, phone, email	
•	Tax Settings: EIN, state tax IDs, tax form type	
•	Fiscal Year: Start month, calendar or fiscal year reporting	
•	Accounting Method: Cash or accrual basis	
•	Currency: Base currency, additional enabled currencies	
•	Branding: Logo, colors, email templates	
18.2 Account & Settings		
Account & Settings controls user preferences including display options, default views, and notification settings. Each user can customize their experience while administrators can set organization-wide defaults.		
User Preferences:		
•	Date Format: MM/DD/YYYY, DD/MM/YYYY, etc.	
•	Number Format: Decimal separators, negative display	
•	Default Views: Starting page, default filters	
•	Notifications: Email frequency, alert preferences	
•	Theme: Light/dark mode, accessibility options	
•	Language: Interface language selection	
18.3 Users & Permissions		
Users & Permissions manages all user accounts and their access rights. Administrators can invite new users, assign roles, and configure granular permissions. The system supports various user types including employees, accountants, and vendors with appropriate access levels for each.		
User Management:		
•	User List: All users with status, role, last login	
•	Invite Users: Send email invitations to new users	
•	Roles: Predefined role templates with permission sets	
•	Custom Permissions: Fine-grained access control	
•	Two-Factor Auth: Require 2FA for additional security	
•	Session Management: View and terminate active sessions	
18.4 Billing & Subscription		
Billing & Subscription manages the Haypbooks subscription including plan selection, billing information, and usage tracking. Users can upgrade or downgrade plans, view billing history, and manage payment methods. Enterprise customers may have custom contracts with different billing arrangements.		
Subscription Management:		
•	Current Plan: Plan name, features, limits	
•	Usage: User count, storage, transactions vs. limits	
•	Upgrade/Downgrade: Change plan with prorated billing	
•	Add-ons: Purchase additional features or capacity	
•	Payment Method: Credit card, ACH, or invoice billing	
•	Billing History: Past invoices and payments	
18.5 Advanced Settings		
Advanced Settings provides access to specialized configuration options for power users and administrators. These settings control system behavior, default values, and integration parameters. Changes to advanced settings should be made carefully as they can significantly affect system operation.		
Advanced Configuration:		
•	Default Accounts: Default accounts for various transaction types	
•	Numbering Sequences: Transaction number formats and sequences	
•	Closing Date: Set date after which changes are restricted	
•	Import/Export: Data import templates and export options	
•	Custom Fields: Additional fields for transactions and records	
•	Classes/Locations: Enable and configure tracking categories	
•	Currency Settings: Exchange rates, revaluation settings	
•	Multi-Entity: Consolidation and inter-company settings (Enterprise)	
End of Document		