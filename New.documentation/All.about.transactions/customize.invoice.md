# Customize Invoice Layout & Company Info (Haypbooks)

This guide shows how to customize the invoice layout and update company information using the panel similar to the screenshot reference.

## Company Info Panel
Changes here update your company information everywhere (header, footers, statement PDFs).

### Fields
1. Company name (required)
2. Email
3. Phone number
4. Website
5. Company address
	 - Street
	 - City
	 - State (select or type)
	 - Zip code
6. Public facing address
	 - Checkbox: Same as company address (when checked, hides separate input block)

### Behavior
- Validation: Company name required; phone, email format verified client-side.
- Save button enabled when form is dirty and valid.
- On Save: Persist to `localStorage.hb.company` (or backend API when wired); show toast “Company info updated”.
- Close (X icon): Discards unsaved changes after confirmation prompt if dirty.

### Accessibility
- Each input labelled; error messages use `aria-live="polite"` region below the field.
- Checkbox grouped with public facing address section for assistive tech clarity.

## Accessing the Layout Customization Page
Navigate to `Settings → Invoices → Customize` or visit: `/settings/invoices/customize`.
Changes persist locally until backend sync is available.

## Layout Customization Tabs
Tabs: Design | Content | Payment | Emails

### Design Tab
- Logo upload / replace
- Primary color palette (swatches + custom hex)
- Accent color (for totals, headers)
- Font family selector (e.g. Inter, Roboto, System)
- Preview panel updates instantly (no Save needed)
- “Reset to defaults” button reverts company & layout settings to initial defaults.

#### Screenshot / Image Accessibility
Provide descriptive alt text for every screenshot illustrating the panel states.
Examples:
```
![Invoice Layout – Design Tab](./screenshots/invoice-layout-design.png "ALT: Design tab with logo upload, color swatches, hex field, font dropdown and live invoice preview.")
![Invoice Layout – Content Tab](./screenshots/invoice-layout-content.png "ALT: Content tab with field visibility toggles (SKU, Service Date, Discount, Deposit, Shipping) and footer/terms inputs.")
![Invoice Layout – Emails Tab](./screenshots/invoice-layout-emails.png "ALT: Emails tab with subject/body templates, token helper list, and sample email preview.")
```
Guidelines: focus on functional controls the user can operate; omit decorative details; keep under ~140 characters.

#### Color Palette Specification
- 18 swatches (example grid 3 x 6) representing curated, accessible contrast options.
- Hex input field (`#RRGGBB`) auto-validates; invalid hex shows red border and disables Save until corrected.
- Selecting a swatch also updates hex input; typing a valid hex updates selected swatch highlight (if matching) otherwise creates a temporary custom swatch.
- Recommended template label (e.g. “Modern”) shown above palette; link “Remove default” clears recommended tag and exposes full template chooser.

##### Design Tokens
Define a shared token surface for preview and PDF rendering:
| Token | Purpose | Default |
|-------|---------|---------|
| `--hb-invoice-color-primary` | Headings, buttons | `#1463ff` |
| `--hb-invoice-color-accent` | Totals, subtle text | `#1f2937` |
| `--hb-invoice-color-border` | Table dividers | Accent blended @30% lightness |
| `--hb-invoice-font-family` | Root font | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` |
| `--hb-invoice-spacing-x` | Cell padding X | `0.75rem` |
| `--hb-invoice-spacing-y` | Cell padding Y | `0.5rem` |
| `--hb-invoice-radius` | Corner radius | `4px` |
| `--hb-invoice-font-scale-heading` | Heading multiplier | `1.15` |

Contrast guidance (non‑blocking): warn if primary vs background < 4.5:1 (normal text) or accent vs totals background < 3:1 (large text).

#### Font Selector
- Dropdown listing: Inter (default), Avenir, Roboto, System UI.
- On change: re-render preview with CSS variable `--invoice-font-family`.
- Persist selected font in `invoiceLayout.fontFamily`.

Fallback behavior:
- Compose runtime CSS stack: `<selected>, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- Avoid FOIT; if a webfont is later introduced, use `font-display: swap`.
- Persist only the chosen primary family; derive the full stack at render time.

### Content Tab
- Toggle visibility: SKU, Service Date, Discount column, Deposit field, Shipping address block.
- Custom footer text (supports basic markdown: **bold**, _italic_)
- Terms & conditions textarea

#### Field Toggle Matrix
| Field | Storage Key | Default | Notes |
|-------|-------------|---------|-------|
| Ship to | showShippingAddress | false | Shows separate shipping block below bill-to |
| Invoice no. | showInvoiceNumber | true | Required for numbering sequence; cannot be turned off if numbering policy enforced |
| Invoice date | showInvoiceDate | true | Critical for aging; disabling blocked if terms enabled |
| Due date | showDueDate | true | Auto-derived from terms; disabled & unchecked if Terms off |
| Terms | showTerms | true | Disabling clears/locks Due date |
| Service date | showServiceDate | false | Per line item optional column |
| SKU | showSKU | false | Per line item optional column |
| Tags | showTags | true | Tag selector below line items; Manage tags link opens tag admin |
| Discount | showDiscount | true | Per line discount column; if off and invoice has discount lines → confirmation dialog |
| Deposit | showDeposit | true | Deposit field above totals; cannot hide while outstanding deposit exists |

All toggles are switches. Disabled state (grayed) indicates dependency not met (e.g. `Due date` depends on `Terms`).

### Payment Tab
Configure accepted payment methods and discount / fee application.

#### Accepted Payment Methods
- Card (cards icons: Visa, MC, AmEx, Discover) — toggle on/off; shows fee tooltip (e.g. 2.9% + 25¢)
- Bank transfer (ACH) — toggle on/off; fee line (1%, max $10 per transaction)
- PayPal — toggle (requires connection). If not connected show helper link to connect in Settings.

State persisted in `hb.payments.acceptedMethods` and mirrored into invoice email tokens.

#### Discounts & Fees Subsection
Toggles:
- Sales tax (enables tax calculation engine integration)
- Discount (global discount row below line items; option: Apply discount after sales tax)
- Shipping fee (adds shipping row before subtotal)

Dependencies:
- “Apply discount after sales tax” checkbox visible only when Discount toggle is ON.

### Design Palette Interaction Flow
1. User clicks a swatch → preview updates border/header/button colors.
2. User types a hex → live validate; preview updates on valid hex.
3. User switches font → preview text re-renders; totals alignment maintained via flex layout.
4. User clicks “Remove default” → recommended template tag removed; template radio group appears (Modern, Classic, Compact). Selecting a template changes base spacing + typography scale.

### State & Persistence Additions
Extend `InvoiceLayout`:
```ts
type InvoiceLayout = {
	// existing fields...
	showInvoiceNumber: boolean;
	showInvoiceDate: boolean;
	showDueDate: boolean;
	showTerms: boolean;
	showTags: boolean;
	showDiscount: boolean; // already present
	showDeposit: boolean;
	paymentMethods?: {
		card: boolean;
		bankTransfer: boolean;
		paypal: boolean;
	};
	applyDiscountAfterTax: boolean;
	templateStyle: 'modern' | 'classic' | 'compact';
};
```

### Validation Rules Summary
- At least one payment method must remain enabled if any payment method section is active.
- `applyDiscountAfterTax` only valid if `showDiscount` is true (auto-clears when Discount turned off).
- `showDueDate` requires `showTerms` true (auto-clears & toggle disabled when Terms off).
- Disabling `showInvoiceNumber` blocked when existing invoices depend on numbering sequence (future server check).

### UX Copy Guidelines (Haypbooks voice)
- Payment method help text: “By enabling PayPal, you agree to PayPal terms and conditions. To disable PayPal at the company level, go to your default settings.”
- Disabled PayPal toggle: “Connect PayPal in Settings to enable.”
- Discount after tax checkbox helper: “If selected, discount applies to subtotal + tax.”

### Analytics Events (Optional Future)
- `invoice_layout_toggle_changed` (field, new_value)
- `invoice_layout_color_changed` (color_hex)
- `invoice_layout_font_changed` (font)
- `invoice_payment_method_changed` (method, enabled)

### Sample Combined Object After User Adjustments
```json
{
	"invoiceLayout": {
		"primaryColor": "#0D909A",
		"accentColor": "#1f2937",
		"fontFamily": "Avenir",
		"templateStyle": "modern",
		"showSKU": false,
		"showServiceDate": false,
		"showDiscount": true,
		"applyDiscountAfterTax": false,
		"showDeposit": true,
		"showShippingAddress": false,
		"showInvoiceNumber": true,
		"showInvoiceDate": true,
		"showDueDate": true,
		"showTerms": true,
		"showTags": true,
		"footerMarkdown": "**Thank you for your business!**",
		"terms": "Payment due within 30 days.",
		"emailSubjectTemplate": "Invoice {{invoiceNumber}} from {{companyName}}",
		"emailBodyTemplate": "Hi {{customerName}}, your invoice {{invoiceNumber}} totaling {{amountDue}} is due {{dueDate}}. Pay securely: {{payUrl}}",
		"paymentMethods": {"card": true, "bankTransfer": true, "paypal": false}
	}
}
```

### Emails Tab
- Default subject template: “Invoice {{invoiceNumber}} from {{companyName}}”
- Default email body template tokens: {{companyName}}, {{invoiceNumber}}, {{amountDue}}, {{dueDate}}, {{payUrl}}, {{customerName}}
#### Supported Tokens
| Token | Description |
|-------|-------------|
| `{{companyName}}` | Company name |
| `{{invoiceNumber}}` | Invoice number |
| `{{amountDue}}` | Amount due (post discounts & tax) |
| `{{dueDate}}` | Due date (if terms enabled) |
| `{{payUrl}}` | Secure payment link |
| `{{customerName}}` | Customer display name |

Unknown tokens remain unreplaced (preview shows them verbatim, optionally highlight for future validation).
- Payment method badges (Card / Bank Transfer / PayPal / Venmo) auto-shown if enabled in Payments settings.

## Data Model (Client Side)
```ts
type CompanyInfo = {
	name: string;
	email?: string;
	phone?: string;
	website?: string;
	address: { street?: string; city?: string; state?: string; zip?: string };
	publicAddressSame: boolean;
};

type InvoiceLayout = {
	logoUrl?: string;
	primaryColor: string;
	accentColor: string;
	fontFamily: string;
	templateStyle: 'modern' | 'classic' | 'compact';
	showSKU: boolean;
	showServiceDate: boolean;
	showDiscount: boolean;
	applyDiscountAfterTax: boolean;
	showDeposit: boolean;
	showShippingAddress: boolean;
	showInvoiceNumber: boolean;
	showInvoiceDate: boolean;
	showDueDate: boolean;
	showTerms: boolean;
	showTags: boolean;
	paymentMethods?: { card: boolean; bankTransfer: boolean; paypal: boolean };
	footerMarkdown?: string;
	terms?: string;
	emailSubjectTemplate: string;
	emailBodyTemplate: string;
};
```

Storage keys:
- `hb.company`
- `hb.invoice.layout`

## Save & Preview Flow
1. User edits Design → changes reflect in live preview.
2. User switches to Content → toggles columns → preview table updates.
3. Emails tab edits templates → sample email preview updates (right side).
4. Press Save (bottom of panel) → persist both CompanyInfo & InvoiceLayout → close panel (optional).

## Future Enhancements (Roadmap)
- Multi-layout profiles (e.g., Standard, Proforma, Deposit Request)
- Per-customer email template overrides
- Auto image compression for high‑res logos
- Dark mode invoice theme variant
- Server-side rendering of PDF preview for pixel parity

---

### Screenshot Mapping
| Screenshot Element | Spec | Notes |
|--------------------|------|-------|
| Company name       | Required text input | Max length 120 chars |
| Email              | Text input (email)  | Basic pattern `/.+@.+\..+/` |
| Phone number       | Text input          | Store raw; format for display |
| Website            | Text input (URL)    | Prepend https:// if missing |
| Address block      | 4 inputs            | State free text (later dropdown) |
| Public facing addr | Checkbox            | When unchecked: show separate address inputs |
| Save button        | Action              | Disabled if invalid |
| Close X            | Icon button         | Confirm dialog if dirty |

---

### Example LocalStorage Object
```json
{
	"company": {
		"name": "Craig's Design and Landscaping Services",
		"email": "craig@email.com",
		"phone": "650-555-1234",
		"website": "websiteurl.com",
		"address": {"street": "333 Easy Street", "city": "Middlefield", "state": "California", "zip": "98756"},
		"publicAddressSame": true
	},
	"invoiceLayout": {
		"primaryColor": "#1463ff",
		"accentColor": "#1f2937",
		"fontFamily": "Inter",
		"templateStyle": "modern",
		"showSKU": false,
		"showServiceDate": true,
		"showDiscount": true,
		"applyDiscountAfterTax": false,
		"showDeposit": true,
		"showShippingAddress": false,
		"showInvoiceNumber": true,
		"showInvoiceDate": true,
		"showDueDate": true,
		"showTerms": true,
		"showTags": true,
		"footerMarkdown": "**Thank you for your business!**",
		"terms": "Payment due within 30 days.",
		"emailSubjectTemplate": "Invoice {{invoiceNumber}} from {{companyName}}",
		"emailBodyTemplate": "Hi {{customerName}}, your invoice {{invoiceNumber}} totaling {{amountDue}} is due {{dueDate}}. Pay securely: {{payUrl}}",
		"paymentMethods": {"card": true, "bankTransfer": true, "paypal": false}
	}
}
```

---

### Implementation Checklist
- [ ] Build CompanyInfoForm component (controlled inputs + validation)
- [ ] Build LayoutTabs (Design/Content/Emails) with state slices
- [ ] Implement live Preview pane (sync colors, font, visible columns)
- [ ] Add template token helper + validation (warn on unknown tokens)
- [ ] Persist on Save (debounce optional)
- [ ] Add dirty state tracking & confirm dialog on close
- [ ] Add unit tests for token replacement & validation edge cases
- [ ] Integrate Brand Guard to ensure forbidden legacy terms never appear

---

### Edge Cases
- Empty company name → disable Save + inline error
- Invalid email format → error but allow Save only once corrected
- Large logo (>1MB) → show warning (future compression)
- Removing discount while invoice has discount lines → prompt to confirm
- Switching font → reflow preview gracefully, maintain totals alignment
- Low contrast chosen colors → show non-blocking accessibility warning
- Missing logo alt text → prompt for description before finalizing

---

### Sample Token Replacement Function (Draft)
```ts
const renderTemplate = (tpl: string, ctx: Record<string,string>): string =>
	tpl.replace(/{{(\w+)}}/g, (_, k) => (k in ctx ? ctx[k] : `{{${k}}}`));
```

---

This specification replaces legacy references and aligns the Customize Layout feature with Haypbooks branding and architecture. Updated to reflect the live `/settings/invoices/customize` route, Payment tab, dependencies auto-clearing behavior, reset defaults control, and expanded token list.

<!-- Legacy transcript removed and replaced with structured Haypbooks specification above. -->