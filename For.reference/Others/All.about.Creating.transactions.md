**The “+ New” menu (or equivalent) is the central hub for creating transactions.** It’s typically divided into categories — **Customers, Vendors, Team, and Other** — each grouping the types of entries you can create. Here’s a comprehensive breakdown:

---

## 🧾 Customers (Sales & Receivables)
These are transactions related to selling products/services and managing customer accounts:
- **Invoice** → Bill customers for products/services; can be recurring.  
- **Receive Payment** → Record payments against invoices.  
- **Statement** → Summarize customer activity (open invoices, balances).  
- **Estimate** → Non‑posting quote for customers; can be recurring.  
- **Sales Order** (Desktop only, not Online) → Track orders before invoicing.  
- **Credit Memo** → Issue credits/refunds to customers.  
- **Sales Receipt** → Record immediate payment at point of sale.  
- **Recurring Payment** → Automate customer billing (subscription/retainer).  
- **Shipping Label** → Generate shipping documents.  
- **Refund Receipt** → Record customer refunds.  
- **Delayed Credit** → Non‑posting credit to apply later.  
- **Delayed Charge** → Non‑posting charge to apply later.  
- **Add Customer** → Create new customer record.  
- **Contract** → Store agreements linked to customers.

---

## 💰 Vendors (Purchases & Payables)
Transactions for expenses, bills, and vendor management:
- **Expense** → Record spending (cash, card, bank).  
- **Check** → Record check payments.  
- **Bill** → Record vendor charges; can be recurring.  
- **Pay Bills** → Apply payments to open bills.  
- **Purchase Order** → Non‑posting order to vendors; can be recurring.  
- **Vendor Credit** → Record credits/refunds from vendors.  
- **Credit Card Credit** → Record refunds to credit cards.  
- **Print Checks** → Batch print checks.  
- **Add Vendor** → Create new vendor record.

---

## 👥 Team (Payroll & Time)
Transactions for employee/contractor management:
- **Payroll** → Run payroll for employees.  
- **Single Time Activity** → Record one employee’s hours.  
- **Weekly Timesheet** → Record weekly hours for multiple employees.  
- **Add Contractor** → Create contractor record.

---

## 🔄 Other (Banking & Adjustments)
General ledger and banking transactions:
- **Task** → Create reminders or to‑dos.  
- **Bank Deposit** → Record deposits to bank accounts.  
- **Transfer** → Move money between accounts.  
- **Journal Entry** → Record manual debits/credits; can be recurring.  
- **Inventory Qty Adjustment** → Adjust stock levels.  
- **Pay Down Credit Card** → Record credit card payments.  
- **Add Product/Service** → Add items to sell or track.

---

### 🔑 Key Takeaways
- **Posting vs. Non‑Posting**: Invoices, Bills, Expenses, Journal Entries affect the books immediately. Estimates, POs, Delayed Charges/Credits are non‑posting until converted.  
- **Recurring Templates**: Supported for most posting transactions (Invoices, Bills, Expenses, Journal Entries, Checks, Deposits, Credit Memos, Estimates, POs). Not supported for Bill Payments or Time Activities.  
- **Workflow Logic**: Customers = inflows, Vendors = outflows, Team = labor/time, Other = adjustments/banking.  

---

This breakdown is a generic **taxonomy of a transaction engine**. For HaypBooks, you can mirror this structure:  
- **Customer module** (sales, receivables, credits)  
- **Vendor module** (purchases, payables, credits)  
- **Team module** (time, payroll)  
- **Other module** (banking, adjustments, inventory)  


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**Here’s a set of clean `.md` text templates for the major transaction types.**  
Each template is structured like the invoice example you showed, with fields grouped logically. You can use these as **UI blueprints** for HaypBooks or documentation.

---

```markdown
# 🧾 Invoice Template (Customer)
- Customer: [Dropdown]
- Email: [Text box]
- Billing Address: [Text box]
- Terms: [Dropdown e.g., Net 30]
- Invoice Date: [Date picker]
- Due Date: [Date picker]
- Options:
  - [ ] Automatically send emails
  - [ ] Print later
  - [ ] Include unbilled charges
- Online Payments:
  - [ ] Cards
  - [ ] Bank Transfer
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Summary:
  - Subtotal: [Auto-calc]
  - Tax: [Auto-calc]
  - Discount: [Optional %]
  - Total: [Auto-calc]
- Message on Invoice: [Text box]
- Buttons: Save, Save & Send, Make Recurring, Customize
```

---

```markdown
# 💰 Bill Template (Vendor)
- Vendor: [Dropdown]
- Bill Date: [Date picker]
- Due Date: [Date picker]
- Terms: [Dropdown]
- Reference No.: [Text box]
- Line Items:
  - Category | Description | Amount | Tax
- Attachments: [Upload option]
- Memo: [Text box]
- Summary:
  - Subtotal: [Auto-calc]
  - Tax: [Auto-calc]
  - Total: [Auto-calc]
- Buttons: Save, Save & Close, Make Recurring
```

---

```markdown
# 📒 Journal Entry Template
- Journal Date: [Date picker]
- Journal No.: [Auto-number]
- Line Items:
  - Account | Debits | Credits | Description
- Memo: [Text box]
- Attachments: [Upload option]
- Options:
  - [ ] Make Recurring
- Buttons: Save, Save & Close
```

---

```markdown
# 💵 Expense Template
- Payee: [Dropdown]
- Payment Account: [Dropdown]
- Payment Date: [Date picker]
- Payment Method: [Dropdown]
- Reference No.: [Text box]
- Line Items:
  - Category | Description | Amount | Tax
- Attachments: [Upload option]
- Memo: [Text box]
- Buttons: Save, Save & Close, Make Recurring
```

---

```markdown
# 🏦 Deposit Template
- Received From: [Dropdown]
- Payment Method: [Dropdown]
- Deposit To: [Dropdown]
- Date: [Date picker]
- Reference No.: [Text box]
- Line Items:
  - Received From | Account | Payment Method | Amount
- Memo: [Text box]
- Buttons: Save, Save & Close, Make Recurring
```

---

```markdown
# 📑 Purchase Order Template
- Vendor: [Dropdown]
- Ship To: [Dropdown]
- PO Date: [Date picker]
- Delivery Date: [Date picker]
- Terms: [Dropdown]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Memo: [Text box]
- Buttons: Save, Save & Close, Make Recurring
```

---

```markdown
# 💳 Receive Payment Template (Customer)
- Customer: [Dropdown]
- Payment Date: [Date picker]
- Payment Method: [Dropdown e.g., Cash, Check, Card, ACH]
- Reference No.: [Text box]
- Deposit To: [Dropdown e.g., Undeposited Funds, Bank]
- Invoices to Apply:
  - Invoice # | Date | Due | Original Amt | Open Balance | Amt Received [Input]
- Amount Received: [Auto-sum]
- Attachments: [Upload]
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 🧮 Estimate Template (Customer, Non‑Posting)
- Customer: [Dropdown]
- Email: [Text box]
- Estimate Date: [Date picker]
- Expiration Date: [Date picker]
- Terms: [Dropdown]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Summary:
  - Subtotal | Tax | Discount | Total [Auto-calc]
- Message on Estimate: [Text box]
- Options: [ ] Allow customer to accept online
- Buttons: Save, Save & Send, Make Recurring
```

---

```markdown
# 🔁 Credit Memo Template (Customer)
- Customer: [Dropdown]
- Credit Memo Date: [Date picker]
- Reference No.: [Text box]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Reason: [Dropdown/Text]
- Apply Credits: [Auto/Manual]
- Summary: Subtotal | Tax | Total Credit [Auto-calc]
- Memo: [Text box]
- Buttons: Save, Save & Close, Make Recurring
```

---

```markdown
# 🧾 Sales Receipt Template (Immediate Payment)
- Customer: [Dropdown]
- Email: [Text box]
- Sales Receipt Date: [Date picker]
- Payment Method: [Dropdown]
- Deposit To: [Dropdown]
- Online Payments: [ ] Cards [ ] Bank Transfer
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Summary: Subtotal | Tax | Discount | Total [Auto-calc]
- Message on Sales Receipt: [Text box]
- Buttons: Save, Save & Send, Make Recurring
```

---

```markdown
# ↩️ Refund Receipt Template (Customer)
- Customer: [Dropdown]
- Refund Date: [Date picker]
- Refund From (Account): [Dropdown bank/credit card]
- Payment Method: [Dropdown]
- Reference No.: [Text box]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# ⏳ Delayed Charge Template (Customer, Non‑Posting)
- Customer: [Dropdown]
- Date: [Date picker]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Memo: [Text box]
- Note: Converts to invoice later; non‑posting until converted.
- Buttons: Save, Save & Close
```

---

```markdown
# ⏱️ Delayed Credit Template (Customer, Non‑Posting)
- Customer: [Dropdown]
- Date: [Date picker]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Memo: [Text box]
- Note: Applies as credit later; non‑posting until applied.
- Buttons: Save, Save & Close
```

---

```markdown
# 🧾 Check Template (Vendor Payment)
- Payee (Vendor): [Dropdown]
- Bank Account: [Dropdown]
- Check No.: [Auto/Manual]
- Date: [Date picker]
- Options: [ ] Print later
- Line Items:
  - Category | Description | Amount | Tax
  - Items (optional) | Qty | Rate | Amount
- Attachments: [Upload]
- Memo: [Text box]
- Buttons: Save, Save & Close, Make Recurring
```

---

```markdown
# 🧾 Pay Bills Template (Apply Payments to Bills)
- Payment Account: [Dropdown]
- Payment Date: [Date picker]
- Payment Method: [Dropdown: Check, Credit Card]
- Starting Check No.: [Text box] (if Check)
- Bills to Pay:
  - Vendor | Bill # | Due | Original Amt | Open Balance | Amt to Pay [Input] | Credits/Discounts
- Options: [ ] Print later
- Memo: [Text box]
- Buttons: Save, Save & Print, Save & Close
```

---

```markdown
# 🧾 Vendor Credit Template
- Vendor: [Dropdown]
- Date: [Date picker]
- Reference No.: [Text box]
- Line Items:
  - Category | Description | Amount | Tax
  - Items (optional) | Qty | Rate | Amount
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 💳 Credit Card Credit Template (Refund to Card)
- Payee (Vendor): [Dropdown]
- Credit Card Account: [Dropdown]
- Date: [Date picker]
- Reference No.: [Text box]
- Line Items:
  - Category | Description | Amount | Tax
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 🖨️ Print Checks (Batch)
- Bank Account: [Dropdown]
- Starting Check No.: [Text box]
- Check Date: [Date picker]
- Checks to Print: [Selection from queue]
- Buttons: Print, Mark as Printed
```

---

```markdown
# 🔁 Transfer Template
- Transfer Funds From: [Dropdown]
- Transfer Funds To: [Dropdown]
- Amount: [Number]
- Date: [Date picker]
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 📄 Statement Template (Customer)
- Customer: [Dropdown]
- Statement Type: [Open Item | Balance Forward]
- Statement Period: Start Date | End Date [Date pickers]
- Include Aging: [ ] 30/60/90
- Delivery Method: [ ] Print [ ] Email
- Message on Statement: [Text box]
- Buttons: Create, Print, Send
```

---

```markdown
# 📦 Inventory Quantity Adjustment Template
- Adjustment Date: [Date picker]
- Inventory Adjustment Account: [Dropdown]
- Location (optional): [Dropdown]
- Line Items:
  - Product/Service | Qty on Hand | New Qty | Change | Cost (optional)
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# ⏱️ Single Time Activity Template
- Employee/Contractor: [Dropdown]
- Date: [Date picker]
- Customer/Project: [Dropdown]
- Service Item: [Dropdown]
- Time: [Start/End or Duration]
- Billable?: [ ] Rate: [Number]
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 📅 Weekly Timesheet Template
- Employee/Contractor: [Dropdown]
- Week of: [Date picker]
- Rows:
  - Customer/Project | Service Item | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Billable? | Rate
- Memo: [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 🧑‍💼 Payroll Run Template (Summary)
- Pay Schedule: [Dropdown]
- Pay Period: Start | End [Date pickers]
- Pay Date: [Date picker]
- Employees: [Multi-select]
- Earnings: [Per-employee items & hours]
- Deductions/Contributions: [Per-employee]
- Taxes: [Auto-calc]
- Review: Gross | Taxes | Net | Total [Auto-calc]
- Buttons: Preview Payroll, Submit Payroll
```

---

```markdown
# 🕒 Review Time Template (Approvals)
- Period: Start | End [Date pickers]
- Team: [Multi-select]
- Filters: [Customer/Project, Billable, Status]
- Grid:
  - Employee | Day | Hours | Customer/Project | Service Item | Billable? | Status [Pending/Approved/Rejected]
- Actions: Approve Selected, Reject Selected
- Memo (optional): [Text box]
- Buttons: Save, Save & Close
```

---

```markdown
# 🤝 Add Contractor Template
- Name: [Text box]
- Email: [Text box]
- Phone: [Text box]
- Address: [Text box]
- Tax ID (optional): [Text box]
- Default Service Item (optional): [Dropdown]
- Notes: [Text area]
- Buttons: Save, Save & Close
```

---

```markdown
# 📦 Sales Order Template (Customer, Non‑Posting)
- Customer: [Dropdown]
- Email: [Text box]
- Sales Order Date: [Date picker]
- Expected Ship Date: [Date picker]
- Ship To: [Dropdown]
- Terms: [Dropdown]
- Line Items:
  - Product/Service | Description | Qty | Rate | Amount | Tax
- Message on Sales Order: [Text box]
- Note: Non‑posting. Convert to Invoice or Fulfillment.
- Buttons: Save, Save & Close
```

---

```markdown
# 🔁 Recurring Payment Template (Customer Autopay)
- Customer: [Dropdown]
- Payment Method: [Dropdown: Card, ACH]
- Authorization On File: [ ] (required)
- Interval: [Daily | Weekly | Monthly | Yearly | Custom]
- Start Date: [Date picker]
- End Date (optional): [Date picker]
- Amount: [Number] or Use Items Below: [ ]
- Line Items (optional): Product/Service | Description | Qty | Rate | Amount | Tax
- Options: [ ] Email receipt automatically
- Buttons: Save, Save & Close
```

---

```markdown
# 🚚 Shipping Label Template
- Carrier: [Dropdown]
- Service: [Dropdown]
- Ship Date: [Date picker]
- From: [Address]
- To: [Address]
- Package: Weight | Dimensions | Declared Value
- Reference (optional): [Text]
- Buttons: Create Label, Void Label
```

---

```markdown
# 👤 Add Customer Template
- Display Name: [Text]
- Company Name (optional): [Text]
- Email: [Text]
- Phone: [Text]
- Billing Address: [Text]
- Shipping Address (optional): [Text]
- Terms (default): [Dropdown]
- Tax Exemption (optional): [Dropdown]
- Notes: [Textarea]
- Buttons: Save, Save & Close
```

---

```markdown
# 🧑 Add Vendor Template
- Display Name: [Text]
- Company Name (optional): [Text]
- Email: [Text]
- Phone: [Text]
- Billing Address: [Text]
- Default Expense Account (optional): [Dropdown]
- Tax ID (optional): [Text]
- Notes: [Textarea]
- Buttons: Save, Save & Close
```

---

```markdown
# 🧾 Add Product/Service Template
- Type: [Inventory | Non-inventory | Service | Bundle]
- Name: [Text]
- SKU (optional): [Text]
- Category (optional): [Dropdown]
- Sales Information:
  - Description: [Text]
  - Sales Price/Rate: [Number]
  - Income Account: [Dropdown]
- Purchasing Information (optional):
  - Description: [Text]
  - Cost: [Number]
  - Expense Account: [Dropdown]
- Inventory Tracking (if Inventory):
  - Initial Qty on Hand | As Of Date | Reorder Point | Inventory Asset Account
- Tax: [Taxable?]
- Buttons: Save, Save & Close
```

---

```markdown
# ✅ Task Template
- Title: [Text]
- Assigned To: [Dropdown]
- Due Date: [Date]
- Related To (optional): [Customer | Vendor | Project | Transaction]
- Priority: [Low | Medium | High]
- Notes: [Textarea]
- Buttons: Save, Save & Close
```

---

```markdown
# 💳 Pay Down Credit Card Template
- Pay From: [Bank Account]
- Pay To: [Credit Card Account]
- Amount: [Number]
- Date: [Date]
- Reference/Memo: [Text]
- Buttons: Save, Save & Close
```

---

### 🔑 Key Notes
- **Consistency**: Each template follows the same modular structure → Header info → Line items → Summary → Options → Actions.  
- **Recurring Support**: Invoices, Bills, Journal Entries, Expenses, Deposits, and Purchase Orders can all be marked as recurring.  
- **Posting vs Non‑Posting**: Invoices, Bills, Expenses, Journal Entries, Deposits post immediately; Estimates and POs are non‑posting until converted.  

---



