

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**An "Unscheduled" recurring entry is a saved template that does *not* run automatically—you trigger it manually whenever needed.**

Here’s how it works and why it’s useful:

---

### 🧩 What “Unscheduled” Means (general)

- **Manual control**: The transaction is saved as a reusable template but *won’t post automatically* on any date.
- **No reminders or automation**: Unlike “Scheduled” or “Reminder” types, it doesn’t notify you or generate entries unless you manually initiate it.
- **Use case**: Ideal for transactions that recur *irregularly*—like adjusting entries, one-off journal entries, or seasonal expenses.

---

### 🛠 How to Use an Unscheduled Recurring Entry

1. **Create the template**:
   - Go to ⚙️ **Settings** > **Recurring Transactions**.
   - Choose the transaction type (e.g., journal entry, invoice).
   - Set **Type** to “Unscheduled.”
   - Fill out the details and save.

2. **Trigger it manually**:
   - When needed, go to the **Recurring Transactions list**.
   - Find your unscheduled template.
   - Click **Use** to generate a new transaction based on it.
   - Review and save.

---

### 🧠 Why Choose “Unscheduled”?

| Scenario | Why It Fits |
|---------|-------------|
| Irregular depreciation | You decide when to post it |
| Seasonal bonuses | Not tied to a fixed schedule |
| Manual adjustments | Only post when conditions are met |
| Audit entries | Controlled posting for compliance |

---

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**A “Reminder” recurring entry is a template that doesn’t post automatically—it simply prompts you to review and approve the transaction before it’s created.**  

---

### 🧩 What “Reminder” Means (general)
- **Notification-based**: The system will remind you when the transaction is due, but it won’t record it until you take action.  
- **User control**: You decide whether to post, edit, or skip the transaction each time.  
- **Middle ground**: It sits between “Scheduled” (automatic posting) and “Unscheduled” (manual-only).  

---

### 🛠 How It Works
1. **Create the template**:
   - Go to ⚙️ **Settings** > **Recurring Transactions**.  
   - Choose the transaction type (invoice, bill, journal entry, etc.).  
   - Set **Type** to “Reminder.”  
   - Define the recurrence schedule (daily, weekly, monthly, etc.).  

2. **When the due date arrives**:
   - The system places the transaction in your **Reminders list** (surface this as a Reminders window, tasks, or alerts depending on your setup).  
   - You open the reminder, review the details, and decide whether to save/post it.  

---

### 🧠 Why Choose “Reminder”?
| Scenario | Benefit |
|----------|---------|
| Variable amounts | Lets you adjust before posting |
| Approval workflows | Ensures manager or accountant reviews |
| Sensitive entries | Prevents accidental auto-posting |
| Compliance checks | Keeps audit trail clear with manual confirmation |

---

### 🔑 Comparison of Recurring Types
| Type | Behavior | Best Use |
|------|----------|----------|
| **Scheduled** | Posts automatically on schedule | Fixed, predictable transactions (e.g., rent) |
| **Reminder** | Prompts you to approve before posting | Variable or sensitive transactions |
| **Unscheduled** | Saved template, triggered manually | Irregular or occasional entries |

---

For your HaypBooks design project, the “Reminder” type could be modeled as a **“Pending Approval” workflow**: the system generates a draft entry on schedule, but requires user confirmation before it’s finalized. This keeps flexibility while still reducing repetitive setup.  

Would you like me to sketch out a **UI flow diagram** showing how Scheduled, Reminder, and Unscheduled could coexist in a single recurring entry tab for HaypBooks?
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**A “Scheduled” recurring transaction is the fully automated option—it posts the transaction on the exact schedule you set, without requiring any manual approval.**  

---

### 🧩 What “Scheduled” Means (general)
- **Automatic posting**: The system creates and records the transaction (invoice, bill, expense, journal entry, etc.) on the chosen interval (daily, weekly, monthly, yearly).  
- **No user intervention**: Once set up, the system posts it consistently with the same details each cycle.  
- **Audit trail**: Each generated transaction is logged with its source template, so you can trace back to the recurring setup.  
- **Limitations**: You can schedule invoices, bills, journal entries, and sales receipts—but not bill *payments*. For payments, you’d use recurring sales receipts or autopay setups.  

---

### 🛠 How to Use a Scheduled Recurring Entry
1. **Create the template**:  
   - Go to ⚙️ **Settings** > **Recurring Transactions**.  
   - Choose the transaction type (e.g., invoice, bill, journal entry).  
   - Set **Type** to “Scheduled.”  
   - Define the recurrence (e.g., every month on the 1st).  
   - Fill in all transaction details (customer/vendor, accounts, amounts).  

2. **System posts automatically**:  
   - On the scheduled date, the system generates and records the transaction.  
   - No reminder or manual trigger is needed.  

3. **Manage the template**:  
   - You can pause, edit, or delete the template at any time.  
   - Changes affect future postings but not past entries.  

---

### 🧠 Why Choose “Scheduled”?
| Scenario | Benefit |
|----------|---------|
| Monthly rent | Posts automatically, ensuring consistency |
| Depreciation journal entry | Keeps books accurate without manual effort |
| Subscription billing | Automates invoices for recurring customers |
| Fixed expenses | Reduces repetitive data entry |

---

### 🔑 Comparison of Recurring Types
| Type | Behavior | Best Use |
|------|----------|----------|
| **Scheduled** | Posts automatically on schedule | Fixed, predictable transactions |
| **Reminder** | Prompts you to approve before posting | Variable or sensitive transactions |
| **Unscheduled** | Saved template, triggered manually | Irregular or occasional entries |

---

Paul, since you’re designing HaypBooks’ recurring entry system, you can think of **Scheduled** as the “auto-render loop” in animation: once the rig is set, the system generates frames every cycle without asking. It’s perfect for predictable, fixed entries where precision and automation matter most.  


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Got it 👍 — you’re asking for a **full breakdown of the fields and inputs** that a recurring template (and by extension, your HaypBooks design) requires. Let’s lay it out in a structured way, showing which ones are **dropdowns**, **text boxes**, or **date pickers**, and what options they typically contain.

---

## 🧾 Recurring Template Fields

| Field | Input Type | Purpose | Typical Options / Behavior |
|-------|------------|---------|-----------------------------|
| **Template Name** | Text box | User-defined name for the recurring template | Free text (e.g., “Monthly Rent JE”) |
| **Type** | Dropdown | Defines how the template behaves | - **Scheduled** (auto-posts)<br>- **Reminder** (prompts approval)<br>- **Unscheduled** (manual trigger) |
| **Create [ ] days in advance** | Numeric text box | Determines how many days before the due date the system generates the transaction | Integer (e.g., 0, 1, 5, 10) |
| **Interval** | Dropdown + numeric fields | Sets frequency of recurrence | - **Daily**<br>- **Weekly** (every X weeks, on specific day)<br>- **Monthly** (on day X of every Y months)<br>- **Yearly** (on specific date each year) |
| **On day [ ]** | Numeric text box | Specifies the day of the month for posting | 1–31 (with handling for months shorter than 31 days) |
| **Of every [ ] month(s)** | Numeric text box | Defines spacing for monthly recurrence | Integer (e.g., 1 = every month, 2 = every other month) |
| **Start Date** | Date picker | First date the template becomes active | Calendar input |
| **End** | Dropdown + date picker | Defines when recurrence stops | - **None** (no end)<br>- **By [date]** (calendar input)<br>- **After [X] occurrences** (numeric text box) |
| **Transaction Details** | Standard transaction form | Captures the actual bill/invoice/journal entry details | Vendor/Customer, Accounts, Amounts, Memo, etc. |

---

## 🧠 How Each Field Plays Together
- **Template Name** → purely organizational, helps identify templates in the list.  
- **Type** → the *behavioral logic* (Scheduled = auto, Reminder = approval, Unscheduled = manual).  
- **Create days in advance** → useful for invoices/bills where you want them ready before the due date.  
- **Interval + On day + Of every month(s)** → the recurrence engine; defines the cycle.  
- **Start/End** → lifecycle control; prevents templates from running indefinitely.  
- **Transaction Details** → the payload; what actually gets posted when the template fires.  

---

### 🔑 Example Setup (Journal Entry for Depreciation)
- Template Name: **“Monthly Depreciation JE”**  
- Type: **Scheduled**  
- Create days in advance: **0**  
- Interval: **Monthly**  
- On day: **1st**  
- Of every month(s): **1**  
- Start Date: **01/01/2026**  
- End: **None**  
- Transaction Details: Debit Depreciation Expense, Credit Accumulated Depreciation  

---

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

---

```markdown
# 📊 Recurring Transaction Flow (general)

Start
  │
  ├── Open ⚙️ Gear Icon
  │     └── Select "Recurring Transactions" under Lists
  │
  ├── Click "New"
  │     └── Choose Transaction Type
  │           ├── Invoice
  │           ├── Bill
  │           └── Journal Entry
  │
  ├── Enter Template Details
  │     ├── Template Name (e.g., "Chad's Monthly Gardening Invoice")
  │     ├── Type
  │     │     ├── Scheduled (auto-posts)
  │     │     ├── Reminder (requires approval)
  │     │     └── Unscheduled (manual trigger)
  │     ├── Create [X] days in advance (optional)
  │     └── Additional Options
  │           ├── Auto-send email
  │           ├── Print later
  │           └── Include unbilled charges
  │
  ├── Define Interval
  │     ├── Daily
  │     ├── Weekly
  │     ├── Monthly
  │     │     └── On day [X] of every [Y] month(s)
  │     └── Yearly
  │
  ├── Set Lifecycle
  │     ├── Start Date (e.g., 03-01-2018)
  │     └── End
  │           ├── None
  │           ├── By [date]
  │           └── After [X] occurrences
  │
  ├── Enter Transaction Details
  │     ├── Customer/Vendor info
  │     ├── Products/Services
  │     ├── Quantity/Hours
  │     ├── Rate/Amount
  │     └── Payment options (credit card, bank transfer)
  │
  ├── Save Template
   │     └── System auto-generates transaction on schedule
  │
  └── Manage Template
        ├── Edit
        ├── Duplicate
        ├── Pause
        ├── Skip Next Date
        └── Delete
```

---

### 🔑 How to Read This
- **Top-down flow**: Each step cascades into the next.  
- **Branching points**: Dropdowns (Type, Interval, End) show multiple paths.  
- **Lifecycle control**: Start/End dates define when the template is active.  
- **Management options**: Edit, duplicate, pause, skip, delete keep flexibility.  

---

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# 📊 Recurring Invoice Flow (example)

Start
  │
  ├── Select Transaction Type
  │     └── Invoice
  │
  ├── Enter Template Details
  │     ├── Template Name: "Chad's Monthly Invoice"
  │     ├── Type: Scheduled
  │     └── Create [ ] days in advance (optional)
  │
  ├── Customer Information
  │     ├── Customer: Chad Kuntz
  │     ├── Email: office@freakladoors.com
  │     └── Billing Address: 123 Main St, New York, NY 10001
  │
  ├── Options
  │     ├── [x] Automatically send emails
  │     ├── [x] Print later
  │     ├── [x] Include unbilled charges
  │
  ├── Online Payments
  │     ├── [x] Cards
  │     └── [ ] Free bank transfer
  │
  ├── Interval Setup
  │     └── Monthly → On day 1st of every 1 month(s)
  │
  ├── Lifecycle Control
  │     ├── Start Date: [blank]
  │     └── End: None
  │
  ├── Terms & Shipping
  │     ├── Terms: Net 30
  │     └── Shipping Info: [blank]
  │
  ├── Transaction Line Items
  │     ├── Product/Service: Gardening
  │     ├── Description: Hourly gardening services
  │     ├── Qty: 5
  │     ├── Rate: 45
  │     ├── Amount: 225.00
  │     ├── Tax: [none specified]
  │     └── Message on Invoice: [optional free text]
  │
  ├── Invoice Summary
  │     ├── Subtotal: 225.00
  │     ├── Taxable Subtotal: 0.00
  │     ├── Sales Tax: 0.00
  │     └── Discount %: [optional field]
  │
  └── Save Template
   └── System auto-generates invoice on schedule


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

The Importance of Recurring Transactions
For many businesses, financial transactions are repeated month after month. In fact, it’s estimated that about 80% of transactions fall into this category. Instead of manually entering the same data every time, modern cloud systems provide two primary ways to automate this process:

Bank Rules – These automate transaction categorization based on patterns in the bank feed.
Recurring Transactions – These create templates for transactions that are repeatedly recorded.
While bank rules and recurring transactions share similarities, they are used in different scenarios. We are going to focus on recurring transactions, covering when and how to use them efficiently.

 

When to Use Recurring Transactions
The choice between bank rules and recurring transactions depends on the type of transaction and whether it appears in the bank feed. Here’s a quick breakdown:

If the transaction affects a bank or credit card account and the account is connected, then bank rules are preferable.
If the transaction affects a bank or credit card account but the account is not connected, then recurring transactions should be used.
If the transaction does not affect a bank or credit card account, bank rules cannot be used, so recurring transactions are necessary.
For example, recurring invoices are ideal when invoicing customers for the same amount each month. Unlike bank rules, recurring invoices can be automatically emailed, scheduled, or used as reminders.

Cloud transactions

Why Use Recurring Transactions Over Bank Rules?
Even when transactions go through the bank feed, recurring transactions may still be the best choice. If a transaction involves product or service items, use recurring transactions because bank rules cannot apply item-based details.

For instance:

If your business sells products and needs itemized sales reports, a recurring sales receipt is the best option.
If you track purchase orders with specific items, a recurring purchase order is necessary.
Bank rules only assign categories but do not allow for detailed product/service tracking.

 

How to Set Up Recurring Transactions
Recurring transactions create templates to streamline data entry. You can create a new template from:

The Recurring Transactions Screen (ideal for setting up from scratch).
An Existing Transaction (by selecting “Make Recurring” at the bottom of the transaction form).
There are several transaction Types Eligible for Recurring Templates:
Bills
Checks
Credit Card Credits
Credit Memos
Deposits
Estimates
Expenses
Invoices
Journal Entries
Non-Posting Charges (Delayed Charges)
Non-Posting Credits (Delayed Credits)
Purchase Orders
Refunds
Sales Receipts
Transfers
Vendor Credits
Note: You cannot create recurring transactions for Receive Payment or Pay Bills because recurring templates only apply to the first step in a workflow. For example, you can set up a recurring invoice but not an automatic payment received.

 

Types of Recurring Transaction Templates
There are three types of recurring transaction templates:

1. Unscheduled Templates
These templates store transaction details without a set date for processing.
Best used for transactions that need modifications before being finalized.
Examples:

Pre-Populated Estimate Templates: Used when estimates have a consistent structure but require slight modifications for each customer.
Complex Journal Entries: Useful for payroll or other transactions requiring multiple accounts with varying amounts.
Generic Invoices: Create an invoice for common services and adjust details before sending it to different customers.
2. Scheduled Templates
Automatically create and process transactions at a specified frequency.
Ideal for payments and invoices with fixed amounts.
Examples:

Recurring Invoices: Automate monthly billing for a subscription or retainer service.
Recurring Auto-Pay from Customers: Set up sales receipts with auto-pay to collect funds without manual intervention.
Recurring Bills: Schedule recurring expenses like rent or lease payments.
Recurring Journal Entries: Automate depreciation or amortization adjustments.
 

3. Reminder Templates
A hybrid option that creates a transaction but requires approval before posting.
Best for transactions where amounts or details change slightly each period.
Example:

If a customer’s invoice amount varies each month, a reminder template ensures accuracy while automating the process.
recurring expenses

tasks

Important Note: Avoiding Duplicate Entries
While recurring transactions and bank rules are both powerful automation tools, using both for the same transaction can create duplicate entries in the general ledger. Be mindful of how transactions enter your books to ensure clean, accurate records.

Conclusion: 
By effectively utilizing recurring transactions, businesses can save time, reduce errors, and improve efficiency in financial management.