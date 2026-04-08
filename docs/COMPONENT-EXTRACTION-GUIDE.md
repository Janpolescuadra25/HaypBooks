# Component Extraction Guide

How to wrap existing section pages inside the new tab-based layout.

---

## The Pattern

Every tab page follows the same 3-step structure after migration:

```
(owner) route file         →  thin wrapper (imports + renders)
TabbedSectionLayout        →  provides breadcrumb + both tab bars
Content component          →  the actual page content (unchanged)
```

The content component itself **never changes**. Only the route file is updated.

---

## Step-by-Step: Wrapping an Existing Page

### Before (current state)

```tsx
// src/app/(owner)/banking-cash/transactions/bank-transactions/page.tsx
'use client'
import BankTransactionsPage from '@/components/owner/BankTransactionsPage'

export default function Page() {
  return <BankTransactionsPage />
}
```

### After (tab-wrapped)

```tsx
// src/app/(owner)/banking-cash/transactions/bank-transactions/page.tsx
import { TabbedSectionLayout } from '@/components/layout/TabbedSectionLayout'
import BankTransactionsPage from '@/components/owner/BankTransactionsPage'

export default function Page() {
  return (
    <TabbedSectionLayout
      sectionId="cash-banking"
      subsectionId="transactions"
      tabId="bank-transactions"
    >
      <BankTransactionsPage />
    </TabbedSectionLayout>
  )
}
```

That's all. Three IDs drive the entire breadcrumb + tab bar UI automatically from `operations-navigation.ts`.

---

## The Three IDs

All three IDs come directly from `src/config/operations-navigation.ts`:

| Prop | Source | Example |
|------|--------|---------|
| `sectionId` | `OperationsSection.id` | `"cash-banking"` |
| `subsectionId` | `NavSubsection.id` | `"transactions"` |
| `tabId` | `NavTab.id` | `"bank-transactions"` |

To find the IDs for any page, use `resolveNavFromPath(pathname)` from the config:

```ts
import { resolveNavFromPath } from '@/config/operations-navigation'

const match = resolveNavFromPath('/banking-cash/accounts/credit-cards')
// → { section: { id: 'cash-banking', ... }, subsection: { id: 'accounts', ... }, tab: { id: 'credit-cards', ... } }
```

---

## Adding a Route Alias (for path mismatches)

When the (owner) route file lives at a **different path** than the config URL, create a thin re-export:

```tsx
// src/app/(owner)/banking-cash/management/transaction-rules/page.tsx
// Alias: the real component lives at banking-cash/transactions/transaction-rules
// but the config/sidebar points to banking-cash/management/transaction-rules

import { TabbedSectionLayout } from '@/components/layout/TabbedSectionLayout'
// Import the same component the original route uses
import TransactionRulesContent from '@/components/owner/banking-cash/TransactionRulesContent'

export default function Page() {
  return (
    <TabbedSectionLayout
      sectionId="cash-banking"
      subsectionId="management"
      tabId="transaction-rules"
    >
      <TransactionRulesContent />
    </TabbedSectionLayout>
  )
}
```

The old route file at `transactions/transaction-rules` can stay (it won't break anything) or be deleted once the new alias is working.

---

## Adding a Missing Page (stub → real)

For the 4 genuinely missing tabs, start with a stub and upgrade later:

### Stub (immediate)

```tsx
// src/app/(owner)/banking-cash/reconciliation/reconciliation-hub/page.tsx
import { TabbedSectionLayout } from '@/components/layout/TabbedSectionLayout'
import { TabPlaceholder } from '@/components/ui/TabPlaceholder'

export default function Page() {
  return (
    <TabbedSectionLayout
      sectionId="cash-banking"
      subsectionId="reconciliation"
      tabId="reconciliation-hub"
    >
      <TabPlaceholder
        title="Reconciliation Hub"
        description="Overview of reconciliation status across all bank accounts."
      />
    </TabbedSectionLayout>
  )
}
```

### Upgrade to real content

Replace `<TabPlaceholder>` with the real component when it's built. The route file and the three IDs don't change.

---

## TabbedSectionLayout Props Reference

```tsx
interface TabbedSectionLayoutProps {
  /** ID in OPERATIONS_NAV — e.g. "cash-banking" */
  sectionId: string
  /** ID of the active primary tab — e.g. "transactions" */
  subsectionId: string
  /** ID of the active secondary tab — e.g. "bank-transactions" */
  tabId: string
  children: React.ReactNode
}
```

The component internally calls `findSection`, `findSubsection`, and `findTab` from `operations-navigation.ts` to build all UI. It throws a console.error (dev only) if an ID is not found in the config.

---

## Checklist Per Page

Use this when wrapping each existing page:

- [ ] Identify the three IDs (sectionId, subsectionId, tabId) from `operations-navigation.ts`
- [ ] Add `TabbedSectionLayout` import to the route file
- [ ] Wrap the content component with the three IDs
- [ ] Run `npx tsc --noEmit` to check for type errors
- [ ] Load the URL in browser — verify breadcrumb shows correct trail
- [ ] Verify primary tab bar highlights the correct subsection
- [ ] Verify secondary tab bar highlights the correct tab
- [ ] Click adjacent tabs — verify navigation works
- [ ] Check browser back button — verify URL changes correctly

---

## Common Pitfalls

### Wrong IDs
If you pass an ID that doesn't exist in the config, `TabbedSectionLayout` will render with a broken tab bar. Always copy IDs directly from `operations-navigation.ts` rather than typing them manually.

### `'use client'` on route file
Route files that only import server-safe components should **not** have `'use client'`. The `TabbedSectionLayout` itself uses `usePathname` so it must be a client component, but the route file can remain a server component. If you see errors about client/server boundaries, check that your content component isn't accidentally marked server-only.

### Duplicate routes
When creating route aliases for path mismatches, confirm the old route file still exists (it's not deleted). Both URLs will work in parallel — the old URL still resolves for anyone with bookmarks.

### Catch-all conflicts
When promoting a catch-all page to a proper (owner) route, Next.js will prefer the specific `(owner)` route over the `[[...slug]]` catch-all automatically. You can remove the switch-case from the catch-all file once the (owner) route is working, but it's not required immediately.
