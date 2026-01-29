# Bank feeds: process and accounting effects (industry reference)

> At a glance (guardrails we follow in HaypBooks):
> - Review-only feed surface: items in For review do not post until you act.
> - One-sided matching: deposits clear A/R (invoices), withdrawals clear A/P (bills). No AR/AP netting inside the feed.
> - Exact tie-out required: selected transactions must equal the bank amount, or provide an equal adjustment with a valid account.
> - Matching-first, then rules: always try to Match to existing documents; fall back to Add via bank rules for predictable, non-subledger items.
> - Reconciliation happens in the Reconcile page, not inside the feed.



---

## How bank feeds flow into your books

#### Bank connection and intake

- **Link accounts:** You connect bank or credit card accounts in the Banking module. Many cloud systems display account tiles at the top so you can switch and filter quickly.  
  

- **Import cadence:** Transactions flow into the feed (daily for most banks). They initially land in the “For review” tab and are not yet part of your financials.  
  

#### The “for review” staging area

- **Staging, not posted:** Items in For review are pending; they do not affect the GL, reports, or reconciliations until you take action (Match/Add/Transfer).  
  

- **Actions available:** For each line you can Match, Add, Transfer, or Exclude. These actions govern whether the item updates an existing record, creates a new one, moves between accounts, or gets ignored.

#### Reconciling is separate

- **Reconciliation happens in the Reconcile page:** Even if you process feeds, formal reconciliation is done in the Reconcile workflow against a statement, not directly in the feed.  
  

---

## Account list and totals headers (HaypBooks UI)

The Banking sidebar’s account list and headers are designed to keep context clear without extra dialogs:

- Selected account is pinned at the top and excluded from the expanded list below, so it never appears twice.
- A non-interactive bottom header mirrors the visual design of the top header. When the list is expanded, it shows aggregated totals labeled “Total” with Bank / Books / Δ. When the list is collapsed, labels are hidden and the totals are integrated into the single visible row.
- The “All accounts” row is no longer clickable; its role is effectively replaced by the bottom totals header. Hover effects are disabled on the bottom header to convey non-interactivity.
- The top selected header and the bottom totals header remain visible at all times and do not collapse; only the middle list collapses/expands.

Accessibility details:
- When labels are visually hidden in the collapsed view, accessible names are preserved so screen reader users can still identify the totals.
- The bottom header is non-interactive and announced appropriately; interactive controls remain in the main list and row actions.

Notes:
- These totals are informational and complement the workflow; formal reconciliation continues to happen in the Reconcile page.

---

## The four main actions and their accounting effects

### 1) Match

- **Purpose:** Link the bank feed line to an existing transaction you already entered (e.g., a bill payment, check, sales receipt, invoice payment, or credit card charge).
- **Accounting effect:** No new GL entry is created. The existing transaction is marked as “cleared,” updating the bank/credit card register’s clear status and supporting reconciliation. Balances and ledgers reflect whatever the original entry posted (e.g., A/P or A/R relief already handled).
- **When to use:** You maintain accrual integrity (A/R and A/P) and avoid duplicates if you pre-enter operational documents (invoices, bills, payroll, etc.).

### 2) Add

- **Purpose:** Create a brand-new transaction directly from the feed (e.g., Expense, Check, Deposit, Credit Card Expense, or Other Income).
- **Accounting effect:** A new GL entry posts and affects the bank or card register immediately:
  - **Expense/Check:** Dr expense (or asset like Prepaid), Cr bank.
  - **Deposit:** Dr bank, Cr income or clearing account (or AR via Receive payment if handled properly).
  - **Credit card charge:** Dr expense/asset, Cr credit card liability.
- **When to use:** Simple cash-basis workflows, card charges, or when no prior document exists. Be cautious with customer/vendor subledgers.

### 3) Transfer

- **Purpose:** Move funds between your connected accounts (e.g., checking → savings, checking → credit card payment).
- **Accounting effect:** Creates an inter-account transfer: Dr receiving account, Cr paying account. No impact on income/expense. If the opposite-side transaction also appears in a second feed, match them to avoid duplicates.

#### HaypBooks specifics: transfer counterpart matching
- **Counterpart auto-suggestions:** When a transfer appears in one account’s feed, HaypBooks searches for a plausible counterpart in the other connected account based on amount equality, date proximity, and account pairing (bank ↔ savings/credit card).  
- **Single-candidate flow:** If exactly one counterpart is found, the row shows a direct action labeled “Apply match for …” to link it immediately (no new GL entry is created).  
- **Multi-candidate flow:** If multiple plausible counterparts are found, the row shows “Suggested match,” which opens an inline list so you can pick the correct item.  
- **Cross-feed linking:** Linking on one side preserves accounting integrity and supports reconciliation on both registers; the operation has no P&L impact, consistent with common accounting practice.

### 4) Exclude

- **Purpose:** Ignore a feed line (duplicates, personal charges on business account, or already recorded and cleared via other means).
- **Accounting effect:** No posting. Does not affect registers or reports.

---

## Transaction types and their specific effects

#### Expenses and checks

- **Add from feed:** Dr expense (or asset), Cr bank. Cash-basis users often rely on this. Accrual users should prefer Match to an existing bill payment to properly relieve A/P.
- **Match to bill payment:** Preserves vendor subledger integrity (A/P is relieved on the bill payment date and amount). The feed line only clears the payment—no new expense is created.

#### Deposits and customer payments

- **Add as Deposit to income:** Dr bank, Cr income. Fast, but can bypass A/R and distort revenue timing.
- **Match to Receive payment + Bank deposit:** Supports proper A/R relief. If you use Undeposited Funds, match the bank deposit (Dr bank, Cr Undeposited Funds) and ensure the Receive payment already relieved A/R. This prevents double counting and aligns to customer subledger best practice.

#### Credit card charges and payments

- **Card charges (feed on card):** Add as Credit Card Expense (Dr expense, Cr card liability).
- **Card payment (feed on bank):** Transfer or Add as payment to the credit card account (Cr bank, Dr card liability). Then match on the credit card feed to the same payment to avoid duplicates.

#### Refunds, reversals, and NSF

- **Customer refund (bank outflow):** Add as Refund Receipt or Match to a pre-entered Refund/Check. Typically Dr income/refund liability or A/R depending on method; Cr bank.
- **Vendor refund (bank inflow):** Add as Deposit to an expense reversal or match to Vendor Credit + Bank Deposit. Ensure the vendor subledger reflects the credit properly.
- **NSF or chargebacks:** Record the reversal with the correct AR/AP impact and any bank fees separately to keep audit trails clean.

---

## Automation that shapes accounting outcomes

#### Bank rules

- **Purpose:** Auto-categorize feed lines based on description, amount, payee, or bank text, and split lines across multiple accounts.
- **Accounting effect:** Rules determine which accounts get debited/credited upon Add. They accelerate processing but should be audited to avoid misclassification drift.
- **Tip:** Use rules for recurring, low-risk items (subscriptions, utilities). Avoid rules for items that should Match to operational documents (e.g., invoice payments).

#### Payees and categories

- **Consistent payees:** Stabilize vendor histories and 1099 reporting.
- **Category mapping:** Reuse for faster classification and cleaner P&L. Review periodically for drift.

> Note: The “For review” staging behavior and bank rules-driven categorization are central to modern feed processing and do not post until reviewed and accepted. The Banking tab provides account tiles for quick filtering. Formal reconciliation is completed in the Reconcile page, separate from the feed processing flow.

---

## Reconciliation impacts and workflow

#### Why reconciliation is still required

- **Cleared vs. reconciled:** Matching/Add clears items in the register, but reconciliation compares cleared activity to the bank statement end balance and dates. This validates completeness and prevents omissions or duplicates.  
  

#### Clean monthly sequence

1. **Enter operational documents:** Invoices, bills, payroll, transfers.
2. **Process feed:** Prefer Match for items that originate from operations; use Add for simple cash items; Transfer for inter-account moves; Exclude duplicates.
3. **Review registers:** Confirm clear statuses and posting accounts.
4. **Reconcile in Reconcile page:** Tie to statement, resolve differences, finalize the period.  
   

---

## Common pitfalls and how to avoid them

- **Duplicate expense or revenue:** Adding from feed when an operational document already exists. Use Match to avoid double posting.
- **Bypassing subledgers:** Adding deposits as income instead of matching to Receive payments and deposits. This leaves A/R hanging and skews aging.
- **Credit card payment duplication:** Adding payment in bank feed and again in credit card feed. Use Transfer and match the counterpart.
- **Rule drift:** Overly broad bank rules misclassify transactions. Keep rules tight and review monthly.
- **Uncleared historical items:** If prior entries don’t match your feed, you may have timing or data-entry issues—resolve before reconciling.

---

## Practical recommendations for a robust setup

- **Define a policy:** When to pre-enter bills/invoices vs. rely on Add in feed. Align to cash or accrual.
- **Use Undeposited Funds for batching:** Match grouped deposits to the bank feed, keeping A/R clean.
- **Lock reconciled periods:** After reconciling, avoid editing reconciled transactions without documentation.
- **Audit bank rules monthly:** Confirm categories, payees, and splits still make sense.
- **Leverage tags/memos:** Preserve context for audit trails and analytics.

---

## Quick reference: action-to-effect matrix

| Action | Creates new GL entry? | Impacts AR/AP? | Changes clear status? | Typical use case |
|---|---|---|---|---|
| Match | No | Preserves existing AR/AP logic | Yes | You pre-entered invoices/bills/payroll |
| Add | Yes | Only if you choose subledger-linked forms | Yes | Simple cash expenses/deposits |
| Transfer | Yes (between accounts) | No | Yes (both sides when matched) | Bank↔Savings; Bank→Credit card payment |
| Exclude | No | No | No | Duplicates, personal charges |

> Note: This reflects common patterns: staged review, explicit match/add actions, and separate reconciliation outside the feed.


---

## Documentation & accuracy (how guidance stays current)

Many products keep help center articles and in-product tooltips synchronized with product changes (for example, shifts in MFA prompts or new bank rule options). This ensures users see current guidance while working or troubleshooting.  

HaypBooks mirrors this approach by:
- Maintaining this bank-feed reference and the completion summary side-by-side, so conceptual guidance and feature status stay in sync.
- Keeping the visual completion view (`Visual.completion/Visual.html`) data-driven from `Visual.js`, so a small data change updates the summary without layout edits.

Brand-neutral product surfaces:
- The in-product UI uses brand-neutral wording. This document may reference industry tools for context, but those terms don’t appear inside HaypBooks UI surfaces.

> Tip: When workflows change, update both the detailed reference and the visual completion data. If workflows remain stable, the summary remains valid without edits.

---

## Clearing-account netting workflow (outside the bank feed)

Some organizations legally net receivables and payables with the same counterparty. Industry-standard feeds do not net A/R and A/P within the bank feed. To preserve subledger integrity, use a clearing account and post AR/AP offsets before matching the bank line.

### Setup
- Create a Balance Sheet clearing account (e.g., “1099 · AR/AP Clearing”).

### When netting AR and AP for a counterparty
1) Offset A/R to the clearing account (for invoices being netted):
  - Dr Clearing, Cr A/R (customer). This marks those invoices as paid (or partially) against Clearing.
2) Offset A/P to the clearing account (for bills being netted):
  - Dr A/P (vendor), Cr Clearing. This marks those bills as paid (or partially) from Clearing.
3) Verify the clearing account balance equals the net amount expected to hit the bank.
4) When the bank feed line arrives:
  - If it’s a deposit of the netted amount: Match to the clearing account activity (Dr Bank, Cr Clearing).
  - If it’s a withdrawal of the netted amount: Match to the clearing account activity (Dr Clearing, Cr Bank).

This keeps customer and vendor subledgers accurate, leaves a clear audit trail, and reconciles the bank properly.

### Small differences (fees, discounts, write-offs)
- Use designated accounts and forms for differences:
  - Bank fee on inflow: Dr Bank fee expense, Cr Bank.
  - Discount on receivable: Dr Discount/Allowance, Cr A/R.
  - Write-off: use a write-off/bad debt account via the appropriate form.

> Tip: In a manual match flow, the “adjustment” field should only resolve small residuals to approved accounts. Larger, intentional offsetting belongs in the clearing-account workflow above.

## One‑sided matching and UI guardrails (HaypBooks alignment)

- One‑sided policy: deposits clear A/R (invoices); withdrawals clear A/P (bills). AR/AP netting is not supported inside the bank feed.
- Manual Match requires exact tie‑out: you cannot confirm a match unless selected totals equal the bank feed amount, or an adjustment equal to the difference is provided with a valid account.
- Complex/arbitrary bundling across A/R and A/P is not available in the feed UI; use the clearing‑account workflow above for legitimate netting.
- The “Find match…” action remains visible while the manual panel is open for discoverability; users can adjust selections or add an adjustment without losing context.

### Accessibility and discoverability details
- Per‑row “Suggested match” is exposed with a unique accessible name for screen readers (e.g., “Open match suggestions for Two”), preventing ambiguous control names across rows.
- The inline “Match suggestions” panel presents actionable buttons (e.g., “Apply match to BILL‑22”) that are focusable and announce their target clearly. When only one match exists, a direct per-row button appears (e.g., “Apply match for Checking → Credit card payment”).
- Controls persist visually (e.g., “Find match…”) while the manual panel is open, reducing mode confusion for keyboard and SR users alike.
- Manual Match panel includes a Close button (aria‑label “Close manual match panel”) so users can exit without collapsing the entire row.
 - Keyboard: when a panel opens (Match suggestions or Manual match), initial focus is moved to the panel container (role="region" with clear aria‑label). Pressing Escape closes the focused panel without altering row expansion. A dedicated Close button remains available for mouse/touch users.
 - Regions and names: interactive drawers/panels are announced as regions with descriptive names (e.g., “Match suggestions”, “Manual match”) so screen reader users have a reliable landmark and can quickly navigate.

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


---

## 1. What the **Adjustment Amount** is for
- In many systems, when the **bank feed line amount** doesn’t exactly equal the sum of the invoices/bills you’ve selected, you can enter an **Adjustment**.  
- Typical reasons:  
  - **Bank fees** deducted from a customer payment.  
  - **Customer short‑pay** (they paid less than the invoice).  
  - **Discounts or write‑offs** applied at settlement.  
  - **Foreign exchange differences** when payments are converted.  

---

## 2. How industry systems handle it
- **Adjustment account required:** You must choose an account (e.g., *Bank Fees Expense*, *Discounts Given*, *Exchange Gain/Loss*).  
- **Posting logic:**  
  - Example: Bank feed deposit = $105.00  
  - Invoice = $110.00  
  - Adjustment = $5.00 (Bank Fees)  
  - Journal entry:  
    - Dr Bank $105  
    - Dr Bank Fees Expense $5  
    - Cr Accounts Receivable $110  
- **Result:** The invoice is fully closed, the bank matches the feed, and the difference is transparently posted to the adjustment account.

---

## 3. Why you “can’t save” unless it matches
- Common guardrail: the total of selected invoices/bills + adjustment must equal the bank feed amount.  
- If the numbers don’t tie out, the **Save/Confirm button is disabled**.  
- This prevents:  
  - Posting mismatched amounts to the bank register.  
  - Leaving invoices/bills partially open without explanation.  
  - Breaking reconciliation (bank register must equal bank statement line).  

---

## 4. Best practice enforced by many systems
- **Always reconcile to the exact bank feed amount.**  
- If there’s a difference, it must be explained via an adjustment.  
- No “half‑saving” is allowed — either the match balances, or you can’t confirm it.  

---

✅ **Summary:**  
The **Adjustment Amount** is a controlled way to explain differences between the bank feed line and the invoices/bills being matched. You cannot finalize/save the match unless the **bank feed amount = selected transactions + adjustment**. This ensures the bank register always reconciles to the statement, while still preserving A/R and A/P integrity.  

---


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**Bank Rules** automate how transactions from the bank feed are categorized, matched, or created. These rules reduce manual work and enforce consistency, but they still respect the requirement that the bank feed must reconcile exactly.  

---

## 1. Purpose of Bank Rules  
- **Automation:** Rules automatically assign categories, payees, classes, or tax codes to imported transactions.  
- **Consistency:** Ensures recurring transactions (e.g., monthly subscriptions, utility bills) are always coded the same way.  
- **Efficiency:** Cuts down on repetitive manual matching and speeds up reconciliation.  

---

## 2. How Rules Work (general)  
- **Conditions:** You define “if/then” logic. For example:  
  - *If* the bank text contains “Spotify”  
  - *Then* categorize as “Software Subscriptions” expense, payee = Spotify.  
- **Scope:** Rules can apply to money in (deposits), money out (expenses), or both.  
- **Priority:** If multiple rules could apply, systems use the order of rules (you can reorder them).  
- **Auto‑add option:** You can choose to automatically add transactions that meet a rule, bypassing manual review.  

---

## 3. How Rules Interact with Matching  
- **Matching first:** Always try to match a bank feed line to an existing transaction (invoice payment, bill payment, check).  
- **Rules apply if no match is found:** If there’s no existing transaction, the rule kicks in to categorize it.  
- **Safeguard:** Even with rules, you shouldn’t be able to save unless the bank feed line amount equals the transaction amount (or equals selected transactions + adjustment).  

---

## 4. Examples of Rule Usage  
- **Recurring vendor expense:**  
  - Bank memo: “Meralco Bill Payment”  
  - Rule: Categorize as Utilities: Electricity, Payee = Meralco.  
- **Customer deposits with consistent memo:**  
  - Bank memo: “Shopee Payout”  
  - Rule: Categorize as Sales Income, Payee = Shopee.  
- **Credit card payments:**  
  - Bank memo: “Payment to BDO Credit Card”  
  - Rule: Categorize as Transfer → BDO Credit Card account.  

---

## 5. Best Practices (general)  
- **Start broad, refine later:** Begin with simple rules (vendor name → category), then add complexity.  
- **Review auto‑add carefully:** Only enable auto‑add for transactions that are always predictable.  
- **Use rules for categorization, not for A/R or A/P settlement:** Customer invoices and vendor bills should still be matched, not auto‑added, to preserve subledger integrity.  
- **Audit regularly:** Review rules periodically to ensure they still reflect your chart of accounts and business needs.  

---

✅ **Summary:** Bank rules automate categorization and reduce manual work, but they never override the fundamental requirement that the bank feed must reconcile exactly. Rules apply only when no direct match exists, and they’re best used for predictable, recurring transactions — not for receivables or payables.  

---


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**Link your bank account** by connecting directly to your bank’s online system, then automatically downloading transactions into the software. Once linked, every transaction flows into the Bank Feed for review, matching, or categorization.  

---

## 1. How a system links a bank account  
- **Cloud systems:**  
  - You go to the **Banking/Transactions tab** and select *Connect account*.  
  - You search for your bank, authenticate securely with your bank (OAuth/MFA), and authorize read access to your account.  
  - A secure API connection is established with your bank.  
  - Transactions are imported automatically (usually daily).  

- **Desktop systems:**  
  - You set up Bank Feeds under *Banking → Bank Feeds → Set up Bank Feed for an Account*.  
  - Two connection methods:  
  - **Direct Connect:** The app communicates directly with your bank’s servers.  
  - **Web Connect:** You download a bank-provided file from your bank’s website and import it into the app.  

---

## 2. How systems handle the bank feed  
Once linked, the app manages transactions in a structured workflow:  

- **Download:** Transactions flow into the Bank Feed center.  
- **Match:** The system first tries to match each bank line to an existing transaction (invoice payment, bill payment, check, transfer).  
- **Rules:** If no match exists, the app applies any **Bank Rules** you’ve set up (e.g., “If memo contains ‘Spotify,’ categorize as Software Subscriptions”).  
- **Add:** If still unmatched, you can “Add” it as a new transaction (Deposit, Expense, Transfer).  
- **Exclude:** If irrelevant (duplicate, personal, already recorded), you can exclude it.  

---

## 3. Common safeguards enforced  
- **Exact match required:** You cannot finalize/save unless the bank feed line amount equals the selected transactions plus any adjustment.  
- **Adjustment handling:** Differences (like bank fees) must be posted to a designated account.  
- **Audit trail:** Every linked bank account and feed action is logged for traceability.  
- **Reconciliation:** Formal reconciliation occurs in the Reconcile workflow against the bank statement. Processing a bank-feed line requires the action to equal that line’s amount (including any permitted adjustment), but month-end reconciliation remains a separate control.  

---

## 4. Benefits of Linking a Bank Account  
- **Automation:** Eliminates manual entry of transactions.  
- **Accuracy:** Reduces errors by pulling data directly from the bank.  
- **Speed:** Daily sync keeps books up to date.  
- **Control:** You still review and approve each transaction before it posts.  

---

### Security and sync cadence  
- **Secure connections:** Use secure APIs with token-based access and support MFA where required. Credentials are handled via secure auth flows.  
- **Cadence:** Most banks sync daily; some support multiple syncs per day. Manual file import or CSV upload can backfill history when needed.  

✅ **In short:** A well‑designed system links your bank account through a secure connection, automatically downloads transactions, and then enforces a strict workflow of matching, rules, or adding. It never lets you confirm a mismatched action—each bank line action must equal the line amount (including any permitted adjustment). Formal reconciliation to the statement is a separate step.  

---

## Troubleshooting bank connections (common patterns)

When a bank connection has issues, mature systems typically surface proactive guidance in the Banking tab and help center:

- Re-authentication prompts when access tokens or credentials expire.
- MFA frequency notices when your bank requires a code on each login or periodically.
- Date range limits (some institutions provide only ~90 days of history per sync).  

Recommended steps:
- Reconnect/re-authenticate via the Banking/Transactions tab and follow MFA challenges as prompted.
- If historical data is missing, import older transactions using your bank’s Web Connect file or CSV upload where supported.
- Check institution-specific limits in the help center; some banks stagger availability of pending vs. posted transactions.

HaypBooks alignment:
- Product guidance is documented here and in the completion summary; planned UX enhancements include unobtrusive banners and status hints in the Banking surface for connection health and re-auth prompts (non-blocking to core processing).

### Link bank control and connection-health banners (HaypBooks UI)
- A visible “Link bank…” button is provided in the Banking surface header. In production, this would launch a secure OAuth/MFA flow. In this mock, it opens a guidance dialog with options to simulate/demo or upload statements.
- A non-blocking connection health banner can surface common states using a simple query flag in this environment:
  - `?bankConn=reauth` — token expired; prompts for re-authentication (opens Link bank dialog).
  - `?bankConn=mfa` — bank may require an MFA challenge during sync; user can proceed via Link bank.
  - `?bankConn=daterange` — institutions may limit history (e.g., ~90 days); the banner links to import guidance.  
  Banners are dismissible and do not block feed processing, following an unobtrusive approach.

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

1. Documentation & Accuracy
- Industry approach:
Help articles and in‑product tooltips should be continuously updated as features evolve.
- Example: If bank feed workflows change (e.g., MFA prompts, new rule options), update both the online help center and in‑app guidance.
- This ensures users always see accurate, current instructions when reconciling or troubleshooting.

2. Completion Summary / Visuals
- Industry approach:
Provide a Banking dashboard that shows:
- Number of transactions For Review, In Books, or Excluded.
- Visual indicators (badges, counts, status bars) to give users a quick sense of progress.
- These visuals don’t change unless the underlying workflow changes — so if the process is stable, the summary remains valid without edits.

3. Troubleshooting Bank Connections
- Industry approach:
Proactively surface connection health checks and troubleshooting prompts, such as:
- Re‑authentication prompts when bank credentials expire.
- MFA (multi‑factor authentication) frequency notices, since some banks require codes every login.
- Date range limits (e.g., some banks only allow 90 days of history per sync).
- Document these in the support center and, when helpful, show as banners in the Banking tab.

✅ In short:
Handle this by keeping documentation accurate and synced with product changes, ensuring completion summaries/visuals remain consistent unless workflows change, and providing clear troubleshooting guidance for bank connections (auth prompts, MFA, date limits).

---

## HaypBooks accessibility note (Nov 1, 2025)

- The Bank Register page now includes an aria-live announcement that summarizes the selected account, the report caption (As of or range), and the Opening/Closing balances whenever data or filters change. This aligns with our Report Accessibility Baseline and makes key totals available to screen readers without additional navigation.
