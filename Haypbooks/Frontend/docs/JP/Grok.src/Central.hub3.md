Here’s a clean, professional, and user-friendly **4-step checkout flow** for the **"My Business"** path in HaypBooks — designed to feel modern, trustworthy, and frictionless while enforcing your key requirements (Company Name required, smart handling of existing accounts, clear plan summary, secure payment).

### Recommended Flow After Clicking "My Business"

```mermaid
flowchart TD
    A[User clicks "My Business"] --> B[Step 1: Choose Your Plan]
    B --> C[Step 2: Account & Company Setup]
    C --> D[Step 3: Review Summary]
    D --> E[Step 4: Payment & Subscribe]
    E --> F[Welcome! Redirect to Owner Hub<br>"My Companies"]
```

### Detailed 4-Tab Checkout Flow (Visual Text Mockups)

#### **Step 1: Choose Your Plan**  
*Active tab highlighted*

```
Choose the perfect plan for your business
Start your free 30-day trial. No credit card required.

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│     Starter        │  │      Growth        │  │   Professional     │  │     Enterprise     │
│   $0 / month       │  │   $29 / month      │  │   $79 / month      │  │    Custom pricing  │
│ (after trial)      │  │ (after trial)      │  │ (after trial)      │  │                    │
│                    │  │                    │  │                    │  │                    │
│ • 1 company        │  │ • Up to 5 companies│  │ • Unlimited        │  │ • Everything in    │
│ • Basic accounting │  │ • Multi-company    │  │   companies        │  │   Professional     │
│ • Invoicing        │  │ • Advanced reports │  │ • Priority support │  │ • Dedicated account│
│ • Expenses         │  │ • Payroll add-on   │  │ • Custom fields    │  │   manager          │
│                    │  │                    │  │ • API access       │  │ • SLA              │
└────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────────┘

                                   [ Continue to setup → ]
```

#### **Step 2: Account & Company Setup**  
*Smart detection: new vs existing user*

**Case A: New User**
```
Create your account

Email address
[______________________________]

Password
[______________________________]

Company name (required)
[______________________________]
This is the name of your business and will appear on invoices

                          [ Continue → ]
               Already have an account? Sign in
```

**Case B: Existing User (detected by email)**
```
Welcome back!

It looks like you already have an account.

Please sign in to add a new company.

Email address
[pre-filled]

Password
[______________________________]

New company name (required)
[______________________________]
We'll add this company to your existing account

                          [ Sign in & Continue → ]
```

#### **Step 3: Review Your Selection**
```
Review and confirm

Plan
Growth Plan — $29/month after 30-day free trial

Billing
Monthly

Company
Acme Widgets LLC

Trial period
30 days free — starts today
No charges until January 19, 2026

After trial
$29.00 USD charged monthly
Cancel anytime

                          [ Continue to payment → ]
                                 ← Edit plan
```

#### **Step 4: Payment Setup**
```
Secure payment

✓ 30-day free trial — no charge today
Your card will be charged $29/month starting January 19, 2026

Card information
[ Credit card form — number, expiry, CVC ]

Billing address
[ Same as company address checkbox ]
[ Address fields ]

Save card for future use
[ ] Save my card securely for faster checkout

By clicking Subscribe, I authorize HaypBooks to charge my card monthly and agree to the Terms of Service and Privacy Policy.

                          [ Subscribe & Start Trial ]
                                 ← Back
```

**After successful subscription:**
→ Redirect to **Owner Hub ("My Companies")** with welcome banner:
```
Welcome to HaypBooks, Acme Widgets LLC!
Your 30-day free trial has started. Explore your dashboard →
```

### Why This Flow Is Perfect

- **Clear progression** with 4 intuitive tabs
- **No credit card required upfront** — builds trust
- **Company name always required** — ensures clean data and proper hub labeling
- **Smart existing account handling** — no duplicates, seamless multi-company support
- **Transparent summary** — reduces drop-off before payment
- **Secure, professional payment step** — feels enterprise-grade

This flow matches top SaaS tools (Stripe Billing, Paddle, Chargebee-powered apps) while being tailored perfectly to your dual-hub architecture.

---

## Implementation status

- **Step 1: PlanSelector** — **Implemented**: `src/components/companies/create/PlanSelector.tsx` (unit tests at `src/components/companies/create/__tests__/PlanSelector.test.tsx`).
- **Step 2: Account & Company form** — **Implemented**: `src/components/companies/create/AccountCompanyForm.tsx` (unit tests at `src/components/companies/create/__tests__/AccountCompanyForm.test.tsx`).
- **Step 3: ReviewSummary** — **Implemented**: `src/components/companies/create/ReviewSummary.tsx` (unit tests at `src/components/companies/create/__tests__/ReviewSummary.test.tsx`).
- **Step 4: PaymentStep** — **Implemented (mock)**: `src/components/companies/create/PaymentStep.tsx` (unit tests at `src/components/companies/create/__tests__/PaymentStep.test.tsx`).

**Routing**: The creation UI is exposed at **`/create-business`** and lives in the public signup area (see `src/app/(public)/create-business/page.tsx`). The page uses the same `Create your account` signup-style layout and is reached when a user selects **My Business** during signup or from the Hub Selection UI.

**E2E**: Playwright tests for the flow added at `e2e/companies.create.spec.ts` and currently pass locally (new and existing user mocked flows).

**Notes**: All four steps and the `/create-business` page are scaffolded and unit-tested; Playwright e2e tests are present and passing locally. Next: strengthen unit test integration with the project's Jest configuration (some test path patterns may require small config tweaks) and stabilize tests in CI.
