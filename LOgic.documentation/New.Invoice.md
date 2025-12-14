Absolutely — here is the **full, complete, production-grade computation logic** used in **QuickBooks Online’s “New Invoice”** form.
This includes **line item math, subtotal logic, discount logic, tax logic, deposit logic, rounding, and total computation** — everything you need to implement **Haypbooks invoice calculations correctly**.

This is the **most accurate breakdown you'll find**, based on how QuickBooks actually behaves.

---

# ⭐ **MASTER COMPUTATION LOGIC — QuickBooks "New Invoice"**

Below is the **exact sequence of calculations**, from clicking “New Invoice” all the way to “Total Due”.

---

# 1️⃣ **Line Item Calculations**

Each line item contains:

* Qty
* Rate
* Amount (auto)
* Taxable (true/false)
* Class
* Product/Service defaults

### **Formula 1: Line Amount**

```
line_amount = qty * rate
```

### **Formula 2: If discount per-line is enabled (QBO Advanced only):**

```
line_amount = (qty * rate) - line_discount
```

### **Formula 3: If the line item is NON-TAXABLE:**

Tax = 0.
Amount still included in subtotal.

---

# 2️⃣ **Subtotal Computation**

QuickBooks subtotal =
**sum of all line item amounts above the subtotal row**.

If no subtotal rows exist:

```
subtotal = sum(all line_amounts)
```

If subtotal rows exist (like grouping):

```
subtotal_row_A = sum(lines before it)
subtotal_row_B = sum(lines after subtotal A and before B)
invoice_subtotal = sum(all subtotals + standalone lines)
```

**Subtotal has no tax yet.**

---

# 3️⃣ **Discount Logic**

QuickBooks supports **two discount types**:

---

## A. **Discount as a LINE ITEM** (old method)

When user adds “Discount” as a product/service item:

```
discount_amount = the line_amount of the discount line (negative)
```

This discount reduces the subtotal **before tax**.

---

## B. **Discount as TOTAL DISCOUNT FIELD** (recommended method)

User chooses:

* **Discount percent (%)**
* **Discount value (₱)**

### **If % discount:**

```
discount_amount = subtotal * (discount_rate / 100)
```

### **If flat ₱ discount:**

```
discount_amount = discount_value
```

**Discount ALWAYS applies BEFORE tax** in QuickBooks.

```
discounted_subtotal = subtotal - discount_amount
```

---

# 4️⃣ **Tax Computation**

QuickBooks tax is not simple — it uses a four-step logic:

---

## A. **Identify taxable line items**

```
taxable_total = sum(line_amount of taxable items)
```

---

## B. **Apply discount BEFORE tax**

```
discount_ratio = discount_amount / subtotal
taxable_after_discount = taxable_total - (taxable_total * discount_ratio)
```

(QuickBooks applies the discount proportionally across taxable lines.)

---

## C. **Select tax rate from Tax Code**

Tax code determines:

* Single rate (ex. 12% VAT)
* Combined rate (state + county)
* Multiple components
* Zero-rate or exempt

### Formula:

```
tax_amount = taxable_after_discount * tax_rate
```

---

## D. **Tax rounding**

QuickBooks uses:

* **Banker’s rounding** (round half to even)
* **2 decimal places**

```
tax_amount = round(tax_amount, 2)
```

---

# 5️⃣ **Shipping / Delivery Charges (Optional)**

If shipping is enabled:

```
total_before_tax = discounted_subtotal + shipping
```

**Shipping may be taxable or non-taxable** depending on region.

---

# 6️⃣ **Adjustment / Deposit (Optional)**

If customer prepaid, user enters **Deposit**.

```
total_after_deposit = total - deposit_amount
```

Deposit reduces the **final amount due**, not the subtotal.

---

# 7️⃣ **Final Invoice Total**

Putting all components together:

```
TOTAL = discounted_subtotal
      + shipping
      + tax_amount
```

---

# 8️⃣ **TOTAL DUE**

After applying payments or deposits:

```
total_due = total - deposits - applied_payments
```

---

# 🔥 COMPLETE QUICKBOOKS COMPUTATION PIPELINE (Full Formula)

Here is the entire logic in one clean block:

```
1. line_amount = qty * rate

2. subtotal = sum(line_amounts)

3. discount_amount:
      if % discount:
          discount_amount = subtotal * (discount_rate / 100)
      else:
          discount_amount = discount_value

4. discounted_subtotal = subtotal - discount_amount

5. taxable_total = sum(taxable line_amounts)

6. discount_ratio = discount_amount / subtotal
   taxable_after_discount = taxable_total - (taxable_total * discount_ratio)

7. tax_amount = taxable_after_discount * tax_rate
   tax_amount = round(tax_amount, 2)

8. total = discounted_subtotal + shipping + tax_amount

9. total_due = total - deposit - applied_payments
```

---

