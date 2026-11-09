# Phase 17 Journey 5: Multi-Currency & Tax Handling Acceptance Test Harness

## Overview
Phase 17 Journey 5 adds the final release-blocking acceptance validation for multi-currency conversion and tax computation in Haypbooks. The harness exercises the real backend integration points around exchange-rate resolution and company-scoped tax configuration.

## Architecture Overview
- **Currency flow:** `resolveCurrency` → `enforceCurrency` → `baseTotal` for consistent transactional accounting.
- **Exchange services:** `CurrencyController` and `ExchangeRateService` provide active-currency listing and conversion at `/api/currency/*`.
- **Tax services:** `TaxController` and `TaxService` expose company-scoped tax configuration under `/api/companies/:companyId/tax/*`.

## Multi-Currency Resolution
Exchange calculations are performed by converting source amounts using the configured exchange rate and then enforcing the company base currency for ledger postings.

Formula:

- `convertedAmount = originalAmount * rate`
- `baseTotal = netAmount + taxAmount` when the company base currency is enforced.

## Tax Calculation Logic
The acceptance test seeds a Standard VAT rate of 12% and validates the conversion path:

- `Net USD = 1,000.00`
- `Tax USD = 120.00`
- `Gross USD = 1,120.00`
- `Tax in PHP = 120.00 * 55.00 = 6,600.00`

This preserves the invariant:

- `Base Net + Base Tax = Base Gross`

## Multi-Tenant Protection
Company-scoped tax settings must not leak across tenants. The harness ensures the isolated company cannot read the primary company tax rate and that tax-rate configuration remains bounded by company ownership.

## Negative Testing & Fallbacks
The harness checks known failure conditions:
- Unrecognized currency codes return `404`.
- Unconfigured conversion pairs return `404`.
- Invalid tax or FX lookups fail gracefully without leaking implementation details.

## Verification Commands
```powershell
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
$env:NODE_OPTIONS='--max-old-space-size=8192'
npx tsc --noEmit
```

## Coverage Mapping
- **Journey Step 1:** Setup and currency resolution
- **Journey Step 2:** FX conversion accuracy
- **Journey Step 3:** Tax calculation across currencies
- **Journey Step 4:** Multi-tenant tax isolation
- **Journey Step 5:** Invalid currency and fallback handling
