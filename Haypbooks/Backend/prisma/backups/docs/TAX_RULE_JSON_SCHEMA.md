# Tax Rule & Form Template JSON Schema (v1)

This document defines the **recommended JSON structure** for tax rules and form templates stored in:
- `TaxRule.rules`
- `BirFormTemplate.structure`

Use these schemas to validate JSON at runtime and to keep tax logic portable across countries.

---

## 1) TaxRule.rules JSON Schema (v1)

### Minimal structure
```json
{
  "version": "1.0",
  "taxType": "INCOME_TAX",
  "jurisdiction": "PH",
  "currency": "PHP",
  "rounding": { "mode": "HALF_UP", "precision": 2 },
  "brackets": [
    { "upTo": 250000, "rate": 0.0 },
    { "upTo": 400000, "rate": 0.20 },
    { "upTo": 800000, "rate": 0.25 },
    { "upTo": 2000000, "rate": 0.30 },
    { "upTo": 8000000, "rate": 0.32 },
    { "upTo": null, "rate": 0.35 }
  ],
  "additionalConditions": {
    "deductions": [
      { "name": "Personal Exemption", "amount": 50000 }
    ],
    "specialTaxRates": [
      { "type": "Capital Gains", "rate": 0.15 }
    ]
  },
  "effective": {
    "from": "2024-01-01",
    "to": null
  },
  "status": "ACTIVE"
}
```

### Field definitions
- `version` (string, required): schema version (e.g., "1.0").
- `taxType` (string, required): canonical type (e.g., INCOME_TAX, VAT, SALES_TAX).
- `jurisdiction` (string, required): country code or jurisdiction label.
- `currency` (string, required): ISO 4217 code.
- `rounding` (object, required): `{ mode: "HALF_UP"|"DOWN"|"UP", precision: number }`.
- `brackets` (array, required): ordered ascending by `upTo`.
  - `upTo` (number|null): upper bound; null means no upper limit.
  - `rate` (number): decimal rate (0.12 for 12%).
- `additionalConditions` (object, optional): deductions, special rates, thresholds.
- `effective` (object, required): `{ from: ISODate, to: ISODate|null }`.
- `status` (string, required): ACTIVE|INACTIVE.

### Validation rules
- `brackets` must be sorted ascending by `upTo`, last bracket `upTo=null`.
- `rate` must be between 0 and 1.
- `precision` must be a non-negative integer.

---

## 2) BirFormTemplate.structure JSON Schema (v1)

### Minimal structure
```json
{
  "version": "1.0",
  "formName": "BIR 2550Q",
  "fields": [
    {
      "name": "taxPayerName",
      "label": "Taxpayer Name",
      "type": "text",
      "validation": { "required": true, "maxLength": 100 }
    },
    {
      "name": "taxableIncome",
      "label": "Taxable Income",
      "type": "number",
      "validation": { "required": true, "min": 0 }
    },
    {
      "name": "taxDue",
      "label": "Tax Due",
      "type": "number",
      "validation": { "required": false },
      "readonly": true
    }
  ],
  "validationRules": {
    "taxableIncome": { "min": 0 }
  }
}
```

### Field definitions
- `version` (string, required): schema version.
- `formName` (string, required): human-readable name.
- `fields` (array, required): list of fields.
  - `name` (string, required)
  - `label` (string, required)
  - `type` (string, required): text|number|date|select|boolean
  - `validation` (object, optional): required, min, max, maxLength, pattern
  - `readonly` (boolean, optional)
- `validationRules` (object, optional): cross-field validations.

---

## 3) Notes for implementation
- Normalize all `rate` values to **decimal** (e.g., 12% → 0.12).
- Perform **schema validation at write-time** in admin UI or API.
- Keep JSON **versioned** to allow safe upgrades.

---

## 4) Recommended validator behavior
- Reject invalid `rate`, missing required fields, or non-ordered brackets.
- Warn on duplicate bracket `upTo` values.
- Ensure `effective.from` ≤ `effective.to` when `to` is set.

---

## 5) Recurrence JSON Schema (v1)

Use this for `RecurringInvoice.recurrenceRule` and `RecurringSchedule.recurrencePattern`.

### Example
```json
{
  "version": "1.0",
  "type": "MONTHLY",
  "interval": 1,
  "dayOfMonth": 15,
  "weekdays": [1, 3, 5],
  "monthOfYear": 6,
  "timezone": "Asia/Manila",
  "end": { "type": "NONE" }
}
```

### Field definitions
- `version` (string, required)
- `type` (string, required): DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY
- `interval` (number, required): every N units
- `dayOfMonth` (number, optional): 1–31
- `weekdays` (array, optional): 0–6 (Sun–Sat)
- `monthOfYear` (number, optional): 1–12
- `timezone` (string, required): IANA tz (e.g., "Asia/Manila")
- `end` (object, required):
  - `{ "type": "NONE" }`
  - `{ "type": "AFTER", "count": 12 }`
  - `{ "type": "ON", "date": "2026-12-31" }`

### Validation rules
- `interval` must be >= 1
- If `type` is MONTHLY or YEARLY, use `dayOfMonth`
- If `type` is WEEKLY, use `weekdays`
