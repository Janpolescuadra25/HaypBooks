# 🏦 How QuickBooks Handles Bank Selection in Bank Feed

This guide summarizes how QuickBooks Online (QBO) and QuickBooks Desktop handle bank selection and transaction review in their Bank Feeds, to inform similar UX and data integrity patterns in Haypbooks.

## 1. Account Linking

- When you first connect a bank or credit card, QuickBooks establishes a secure connection with your financial institution.
- Each account (e.g., Checking, Savings, Credit Card) is linked individually.
- You can connect multiple accounts from the same bank, and QuickBooks keeps them separate.

## 2. Bank Feed Dashboard

- QuickBooks Online (QBO):
  - At the top of the Banking tab, you see account tiles (one per connected account).
  - Each tile shows the bank name, account type, and current balance.
  - You click a tile to view that account’s transactions in the feed.
- QuickBooks Desktop:
  - Bank Feeds are tied to the Chart of Accounts.
  - Each bank account has its own register.
  - You select the account from the Banking menu to download and review its feed.

## 3. Transaction Management

- Once you select an account, QuickBooks downloads transactions for that account only.
- Transactions appear in the For Review section.
- You can:
  - Match them to existing records (invoices, bills, payments).
  - Categorize them to the right expense/income account.
  - Exclude duplicates or irrelevant entries.

## 4. Automation & Rules

- QuickBooks lets you create bank rules per account.
- Example: “If Payee = Globe Telecom, categorize as Utilities Expense.”
- These rules are account‑specific, so each bank feed can be managed independently.

## 5. Security & Data Integrity

- Each bank connection uses encrypted communication with Intuit’s servers.
- QuickBooks never merges feeds across accounts — you must select the correct account tile/register.
- This ensures transactions are always tied to the right account for reconciliation.

## 📊 Best Practices for Bank Selection

- Name accounts clearly in the Chart of Accounts (e.g., “BPI Checking – Payroll” vs. “BPI Checking – Operations”).
- Review each account separately — don’t mix feeds.
- Set rules per account to minimize manual categorization.
- Reconcile monthly per account to ensure balances match statements.

## ✅ Summary

QuickBooks manages bank selection in the Bank Feed by giving each connected account its own tile/register. You pick the account you want to review, and QuickBooks downloads, categorizes, and reconciles transactions only for that account. This separation ensures accuracy, security, and clean reconciliation.
