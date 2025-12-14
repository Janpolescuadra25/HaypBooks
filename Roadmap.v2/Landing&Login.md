
# **1️⃣ Landing Page**

Purpose:
* Present your product
* Show features
* CTA: “Sign Up”, “Login”
* Show non-functional pricing tiers (like QuickBooks before checkout)

Requirements:
* Fast, clean UI
* Sections:


* Hero banner
* Features
* Pricing preview (but no backend logic yet)
* Testimonials (optional)
* Footer

---

# **2️⃣ Subscription Plans (Visual Only for Now)**

This step is ONLY UI.

You show:

* 4 pricing tiers

But:

* No Stripe integration yet
* No access control yet

Just UI, so users see it but cannot pay.

---

# **3️⃣ Authentication System**

This part includes:

### **3.1 Login**

* Email + Password
* Validate against mock DB (for now)
* Show errors (invalid, not exist, etc.)

### **3.2 Sign Up**

* Create account
* Send confirmation email (optional for MVP)
* Save user to mock DB

### **3.3 Password Reset**

* Email request → send link (Mock process only)
* New password screen

### **3.4 Security**

* JWT tokens
* Refresh tokens
* Rate limit login
* Password hashing
* Session expiration
* Device/IP tracking (optional)

---

# **4️⃣ Account Setup / Company Setup**

After a user signs up, they must complete **7 onboarding steps** before entering the dashboard.
Below is the *full, detailed breakdown*.

# **1️⃣ Business Details**
Ask the user for the core identity of the business.

### **Required fields:**
* **Business / Company name**
* **Business type**
* Sole Proprietor
* Corporation
* Partnership
* Non-profit
* Others

* **Industry**
* Retail
* Services
* Construction
* Hospitality
* Freelance
* Manufacturing
* Real estate
* IT / SaaS
* Others

* **Business address**
* Street
* City
* Province
* Zip code
* Country

* **Business phone number**
* **Business email** (used in invoices)




### **QuickBooks Logic Example:**

Industry determines which **Chart of Accounts** QuickBooks auto-generates.

---

# **2️⃣ What does your business sell?**

This determines which modules to enable.

### **Options:**

* **Services only**
* **Products only (with or without inventory)**
* **Both services and products**

### **If they choose:**

#### ✔ *Products with inventory*

Enable:

* Inventory module
* Stock levels
* COA accounts:

* Inventory Asset
* COGS
* Income account

#### ✔ *Services only*

Simplify:

* No stock tracking
* Only one default income account

---

# **3️⃣ Fiscal & Accounting Settings**

These settings define how the accounting engine works.

### **Fields:**

* **Start of fiscal year**

* January
* April
* July
* October
* **Accounting method**

* **Accrual** (default for most businesses)
* **Cash**
* **Default currency**

* PHP
* USD
* EUR
* Multi-currency? (optional to enable)

### **QuickBooks Logic:**

* Fiscal year affects reporting periods
* Accounting method affects how revenue/expenses appear

---

# **4️⃣ Tax Settings (VAT/GST/Sales Tax)**

Important for invoice calculations.

### **Fields:**

* **Tax type**

* VAT
* GST
* Percent-based tax
* No tax
* **Default tax rate**

* Example: 12% (Philippines VAT)
* **Tax calculation preference**

* **Inclusive** (price already includes tax)
* **Exclusive** (tax added on top)

### **QuickBooks Logic:**

If inclusive → Rate = Price ÷ (1 + VAT%).
If exclusive → Rate = Price × VAT%.

---

# **5️⃣ Branding Setup (Invoice Settings)**

This affects how invoices appear.

### **Fields:**

* **Upload company logo**
* **Invoice prefix**

* Example: HYP-00001
* **Default invoice footer**

* E.g., “Thank you for doing business with us!”
* **Default payment terms**

* Due on receipt
* Net 15
* Net 30
* Custom

### **Optional:**

* Brand color (for template)
* Signature image (for invoice)

---

# **6️⃣ Banking & Payment Setup (Optional for now)**

For MVP, mark this part as "Setup later".

### **Fields:**

* Does your business accept bank payments?
* Does your business accept cash?
* Bank accounts (only visual for now)

* Account number
* Bank name

In QuickBooks, this comes after full onboarding — but offering "Skip for now" is good.

---

# **7️⃣ Opening Balances (Optional for now)**

This is **for future migration or fresh setup**.

### **Fields:**

* Starting cash balance
* Starting bank balance
* Accounts receivable beginning balance
* Accounts payable beginning balance
* Inventory beginning quantity & value
* Owner’s equity

Most users skip this — add a **“Skip for now”** button.

---

# 📌 **FULL ONBOARDING FLOW (User Experience)**

### **Step 1 → Business Details**

Collect identity and address.

### **Step 2 → What do you sell?**

Enable services / products / inventory modules.

### **Step 3 → Fiscal & Accounting Settings**

Set fiscal year, currency, accrual/cash.

### **Step 4 → Tax Setup**

Default VAT, inclusive/exclusive logic.

### **Step 5 → Branding**

Logo, invoice prefix, terms.

### **Step 6 → Payment Setup**

Bank / cash preferences (optional).

### **Step 7 → Opening Balances**

Optional – “Set up later”.

### **Done → Redirect to Dashboard**

* Auto-create Chart of Accounts (based on industry)
* Auto-create default tax codes
* Auto-create default invoice settings
* User sees welcome modal

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# 🌟 **HAYPBOOKS — Subscription Plans (Visual Only)**

### *(4-tier SaaS pricing for your landing page)*

---

# **1️⃣ Starter Plan (Free / Basic)**

Perfect for freelancers and small side businesses.
**Visual-only — No payment, no backend required.**

**Includes:**

* Create invoices (up to 5 per month)
* Add unlimited customers
* Basic dashboard
* Store products/services
* Company profile setup
* Email support

**UI Notes:**

* Grey/Neutral card
* Tag: “Best for Beginners”
* Button: `Get Started`

---

# **2️⃣ Essential Plan (Popular)**

Ideal for growing small businesses.
**This is your main attractive plan.**

**Includes everything in Starter +**

* Unlimited invoices
* Custom invoice templates
* Add bills & expenses
* Multi-step authentication (2FA)
* Basic reports (Sales summary, Expenses summary)
* Accept partial payments
* Estimate → Invoice conversion

**UI Notes:**

* Highlighted card (green or blue)
* Tag: “Most Popular”
* Slight scale animation
* Button: `Choose Essential`

---

# **3️⃣ Professional Plan**

For companies with inventory, multiple users, and deeper reporting.

**Includes everything in Essential +**

* Inventory tracking
* Multiple team users
* Roles & permissions
* Recurring invoices
* Payment reminders
* Profit & Loss report
* Balance sheet
* Audit logs
* Priority support

**UI Notes:**

* Premium look, gold/blue accent
* Tag: “Best for Businesses with Inventory”
* Button: `Upgrade to Professional`

---

# **4️⃣ Enterprise Plan**

For larger businesses with advanced needs.
(Visual only — no real backend logic now.)

**Includes everything in Professional +**

* Advanced reporting (GL, cash flow, aging)
* Bank feeds & reconciliation
* Custom workflows
* Approval processes
* Unlimited team users
* Dedicated account manager
* API access
* Custom onboarding

**UI Notes:**

* Dark or black card with neon accents
* Tag: “For Large Teams”
* Button: `Contact Sales`

---

# 🎨 **Bonus — Visual Layout Suggestions**

Use a **4-column grid** on desktop and **vertical stack on mobile**.

Each card should include:

* Title
* Subtitle (1–2 lines)
* Price (Visual only — no Stripe yet)
* Bullet list
* CTA button
* Highlight tag (optional)

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Below is the **industry-standard UI flow** used by QuickBooks, Stripe, Notion, Xero, and other SaaS apps — adapted for your system (Haypbooks).
This is the **recommended flow** for:

✅ **Login with OTP**
✅ **Sign in**
✅ **Sign up**
✅ **Forgot password**
✅ **Reset password with OTP or link**

Everything is structured in a clean step-by-step flow so you can use it directly in your frontend.

---

# 🎨 **1. SIGN IN FLOW (Email + Password)**

### **Screen 1 — "Sign in"**

Fields:

* Email
* Password
* **Button:** Sign In
* Links:

  * “Forgot password?”
  * “Don’t have an account? Sign up”

Flow:

1. User enters email + password
2. Backend validates
3. On success → redirect to dashboard
4. On failure → show inline error (“Incorrect email or password”)
5. If account has **OTP enabled**, proceed to OTP verification screen

---

# 🔐 **2. LOGIN WITH OTP (2-Step Verification)**

### **Screen 2 — "Enter the 6-digit code"**

* Show masked email or phone number:
  “We sent a 6-digit code to **j****@gmail.com**”
* Input: 6 boxes (auto-jump)
* Button: Verify Code
* Link: Resend Code (activated after 15–30 seconds)

Flow:

1. User enters code
2. Backend validates:

   * Code matches
   * Code not expired
3. If valid → login success
4. If invalid → show error (“Wrong or expired code”)
5. Optionally: remember device for 30 days

This is exactly how QuickBooks, Google, and banking apps do it.

---

# 🆕 **3. SIGN UP FLOW (Create Account)**

### **Screen 1 — "Create your account"**

Fields:

* Email
* Password
* Confirm password
* Company name OR First name + last name (optional at signup, depending on your onboarding)
* Button: Create Account
* Link: Already have an account? Sign in

Flow:

1. User fills form
2. Validate email uniqueness
3. Create user record
4. Send **verification OTP** to email
5. Redirect to **Verify Email OTP** screen

---

### **Screen 2 — "Verify your email"**

* “Enter the 6-digit code sent to your email”
* Inputs: 6 boxes
* Button: Verify
* Link: Resend code

Flow:

1. User enters OTP
2. If valid → go to **Company Setup / Onboarding**
3. If not, show error

This is now required for real SaaS signups.

---

# 🔁 **4. FORGOT PASSWORD FLOW**

### **Screen 1 — "Forgot your password?"**

Text:
“Enter the email associated with your account and we’ll send instructions to reset your password.”

Fields:

* Email

Button:

* Send Reset Instructions

Flow:

1. User enters email
2. Backend checks if email exists
3. If exists → send **OTP** OR **reset link**
4. Redirect to **Check your email** screen

---

### **Screen 2 — "Check your email"**

Text:
“We sent a 6-digit code to **j****@gmail.com**”

Buttons:

* Enter Code

Link:

* Resend Code

---

# 🔁 **5. RESET PASSWORD FLOW (OTP-Based)**

### **Screen — "Enter Reset Code"**

Fields:

* OTP (6 boxes)

Button:

* Verify OTP

After OTP is valid → show:

### **Screen — "Set a New Password"**

Fields:

* New password
* Confirm new password

Button:

* Update Password

Flow:

1. Validate passwords
2. Save new password
3. Redirect to “Password updated” screen
4. Then: return to Sign In page

---

# 📌 **RECOMMENDED HIERARCHY FLOW SUMMARY**

```
Sign In
 ├─→ (Optional) OTP Login
 ├─→ Forgot Password
       ├─→ Enter Email
       ├─→ Enter OTP / Reset Link
       ├─→ Set New Password
       └─→ Back to Sign In
Sign Up
 ├─→ Verify Email OTP
 └─→ Company Setup / Onboarding
```

---

# ⭐ **UI EXPERIENCE GUIDELINES (Best Practice)**

### 🔹 Always show masked emails in OTP screens

Like: **j****@gmail.com**

### 🔹 Use auto-focus + auto-advance for 6 input boxes

Industry standard.

### 🔹 Resend OTP timer:

* Disabled for 30 seconds
* Then allowed

### 🔹 Error messaging should be inline and clear

Example:

* “Invalid code”
* “Code expired”
* “Email not found"

### 🔹 Do not say “User not found” for security

Instead say:
"Check your inbox for reset instructions."
(even if email doesn't exist)

### 🔹 After resetting password → Confirm with a modal/screen

---

