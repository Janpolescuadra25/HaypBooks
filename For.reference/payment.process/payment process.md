<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscribe to HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .step-active { @apply text-emerald-600 font-bold border-emerald-600; }
    .step-inactive { @apply text-slate-400 border-slate-300; }
  </style>
</head>
<body class="bg-gradient-to-br from-emerald-50 to-white min-h-screen py-12 px-4">
  <div class="max-w-5xl mx-auto">
    <!-- Progress Steps -->
    <div class="flex items-center justify-center mb-12">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">1</div>
        <div class="w-32 h-1 bg-emerald-600 mx-4"></div>
      </div>
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xl">2</div>
        <div class="w-32 h-1 bg-slate-300 mx-4"></div>
      </div>
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xl">3</div>
      </div>
    </div>
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-slate-900">Step 1: Choose Your Plan</h2>
      <p class="text-slate-600">Your 30-day free trial starts immediately — no card needed yet.</p>
    </div>

    <!-- Step 1: Plan Selection -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      <!-- Starter -->
      <div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-emerald-600 transition-all cursor-pointer">
        <h3 class="text-2xl font-bold text-slate-900 mb-4">Starter</h3>
        <div class="text-5xl font-bold text-slate-900 mb-2">$19<span class="text-2xl">/month</span></div>
        <p class="text-slate-600 mb-8">For solo entrepreneurs and small businesses</p>
        <ul class="space-y-4 mb-10">
          <li class="flex items-center gap-3">✓ 1 company</li>
          <li class="flex items-center gap-3">✓ Owner + 2 team members</li>
          <li class="flex items-center gap-3">✓ Unlimited invoices</li>
          <li class="flex items-center gap-3">✓ Basic reports</li>
        </ul>
        <button class="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
          Select Starter
        </button>
      </div>

      <!-- Growth (Most Popular) -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border-4 border-emerald-600 relative">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold">
          Most Popular
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-4 mt-6">Growth</h3>
        <div class="text-5xl font-bold text-slate-900 mb-2">$49<span class="text-2xl">/month</span></div>
        <p class="text-slate-600 mb-8">For growing teams needing automation and insights</p>
        <ul class="space-y-4 mb-10">
          <li class="flex items-center gap-3">✓ Up to 5 companies</li>
          <li class="flex items-center gap-3">✓ Unlimited team members</li>
          <li class="flex items-center gap-3">✓ Recurring invoices + payments</li>
          <li class="flex items-center gap-3">✓ Advanced reports</li>
        </ul>
        <button class="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
          Select Growth
        </button>
      </div>

      <!-- Professional -->
      <div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-emerald-600 transition-all cursor-pointer">
        <h3 class="text-2xl font-bold text-slate-900 mb-4">Professional</h3>
        <div class="text-5xl font-bold text-slate-900 mb-2">$99<span class="text-2xl">/month</span></div>
        <p class="text-slate-600 mb-8">For established businesses with advanced needs</p>
        <ul class="space-y-4 mb-10">
          <li class="flex items-center gap-3">✓ Unlimited companies</li>
          <li class="flex items-center gap-3">✓ Advanced roles & permissions</li>
          <li class="flex items-center gap-3">✓ Custom dashboards</li>
          <li class="flex items-center gap-3">✓ Priority support</li>
        </ul>
        <button class="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
          Select Professional
        </button>
      </div>
    </div>

    <!-- Example: Step 2 - Billing Details (Hidden until plan selected) -->
    <div class="hidden" id="step2">
      <h2 class="text-3xl font-bold text-center mb-8">Step 2: Billing Details</h2>
      <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <form>
          <label class="block text-lg font-medium mb-3">Card Information</label>
          <div class="grid grid-cols-2 gap-6 mb-8">
            <input type="text" placeholder="Card number" class="px-6 py-4 border rounded-xl">
            <input type="text" placeholder="MM/YY" class="px-6 py-4 border rounded-xl">
            <input type="text" placeholder="CVC" class="px-6 py-4 border rounded-xl">
            <input type="text" placeholder="Name on card" class="px-6 py-4 border rounded-xl col-span-2">
          </div>
          <button class="w-full py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
            Continue to Review
          </button>
        </form>
      </div>
    </div>

    <!-- Example: Step 3 - Review & Pay (Hidden) -->
    <div class="hidden" id="step3">
      <h2 class="text-3xl font-bold text-center mb-8">Step 3: Review & Pay</h2>
      <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
        <div class="mb-8">
          <p class="text-xl font-bold">Growth Plan — $49/month</p>
          <p class="text-slate-600">30-day free trial starts today<br>Billing begins January 22, 2026</p>
        </div>
        <div class="border-t pt-8">
          <p class="font-bold mb-4">Total today: $0.00</p>
          <p class="text-sm text-slate-600 mb-8">No charge until trial ends. Cancel anytime.</p>
          <button class="w-full py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
            Start My Free Trial
          </button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>

===================================================================================

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Billing Details - HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .bg-gradient-custom { background: linear-gradient(to bottom right, #f8fafc, #ecfdf5); }
    .secure-badge { @apply flex items-center gap-2 text-slate-600 text-sm; }
  </style>
</head>
<body class="bg-gradient-custom min-h-screen py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <!-- Progress Steps -->
    <div class="flex items-center justify-center mb-12">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-xl">1</div>
        <div class="w-32 h-1 bg-slate-300 mx-4"></div>
      </div>
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">2</div>
        <div class="w-32 h-1 bg-emerald-600 mx-4"></div>
      </div>
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xl">3</div>
      </div>
    </div>
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-slate-900">Step 2: Billing Details</h2>
      <p class="text-lg text-slate-600 mt-4">Securely add your payment method. No charge until your 30-day trial ends.</p>
    </div>

    <!-- Main Form Card -->
    <div class="bg-white rounded-3xl shadow-2xl p-10">
      <!-- Secure Badges -->
      <div class="flex justify-center gap-8 mb-10">
        <div class="secure-badge">
          <svg class="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          <span>256-bit SSL Encryption</span>
        </div>
        <div class="secure-badge">
          <svg class="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.953a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.953z"/>
          </svg>
          <span>PCI DSS Compliant</span>
        </div>
      </div>

      <form class="space-y-8">
        <!-- Card Information -->
        <div>
          <h3 class="text-xl font-semibold text-slate-900 mb-4">Card Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Card number" class="w-full px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
            <input type="text" placeholder="MM / YY" class="w-full px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
            <input type="text" placeholder="CVC" class="w-full px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
            <input type="text" placeholder="Name on card" class="w-full px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all md:col-span-2">
          </div>
        </div>

        <!-- Billing Address -->
        <div>
          <h3 class="text-xl font-semibold text-slate-900 mb-4">Billing Address</h3>
          <div class="space-y-6">
            <input type="text" placeholder="Street address" class="w-full px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
            <div class="grid grid-cols-2 gap-6">
              <input type="text" placeholder="City" class="px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
              <input type="text" placeholder="State / Province" class="px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
            </div>
            <div class="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Postal code" class="px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
              <select class="px-6 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                <option>Country</option>
                <option>United States</option>
                <option>Canada</option>
                <!-- Add more -->
              </select>
            </div>
          </div>
        </div>

        <!-- Continue Button -->
        <div class="pt-8">
          <button class="w-full py-5 bg-emerald-600 text-white text-xl font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl">
            Continue to Review
          </button>
          <p class="text-center text-sm text-slate-600 mt-4">
            No charge today — your card will be saved securely for billing after your 30-day trial.
          </p>
        </div>
      </form>
    </div>

    <!-- Back Link -->
    <div class="text-center mt-8">
      <a href="/plans" class="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
        ← Back to plan selection
      </a>
    </div>
  </div>
</body>
</html>

==================================================================================

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Review & Pay - HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .bg-gradient-custom { background: linear-gradient(to bottom right, #f8fafc, #ecfdf5); }
    .secure-badge { @apply flex items-center gap-2 text-slate-600 text-sm; }
  </style>
</head>
<body class="bg-gradient-custom min-h-screen py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <!-- Progress Steps -->
    <div class="flex items-center justify-center mb-12">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-xl">1</div>
        <div class="w-32 h-1 bg-slate-300 mx-4"></div>
      </div>
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-xl">2</div>
        <div class="w-32 h-1 bg-slate-300 mx-4"></div>
      </div>
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">3</div>
      </div>
    </div>
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-slate-900">Step 3: Review & Pay</h2>
      <p class="text-lg text-slate-600 mt-4">Confirm your plan and start your free trial.</p>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 text-center">
        <h3 class="text-2xl font-bold mb-2">You're almost there!</h3>
        <p class="text-lg opacity-90">Your 30-day free trial starts immediately — no charge today.</p>
      </div>

      <!-- Content -->
      <div class="p-10 space-y-10">
        <!-- Plan Summary -->
        <div class="border-b pb-8">
          <h4 class="text-xl font-semibold text-slate-900 mb-6">Your Selected Plan</h4>
          <div class="flex justify-between items-center bg-emerald-50 rounded-2xl p-6">
            <div>
              <p class="text-2xl font-bold text-slate-900">Growth Plan</p>
              <p class="text-slate-600 mt-2">Most popular — perfect for growing teams</p>
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold text-emerald-600">$49</p>
              <p class="text-slate-600">per month after trial</p>
            </div>
          </div>
        </div>

        <!-- Billing Summary -->
        <div class="border-b pb-8">
          <h4 class="text-xl font-semibold text-slate-900 mb-6">Billing Summary</h4>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-slate-600">Plan cost</span>
              <span class="font-medium">$49.00</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">30-day free trial</span>
              <span class="font-medium text-emerald-600">- $49.00</span>
            </div>
            <div class="flex justify-between text-xl font-bold pt-4 border-t">
              <span>Total due today</span>
              <span class="text-emerald-600">$0.00</span>
            </div>
          </div>
          <p class="text-sm text-slate-600 mt-6">
            Your card will be charged $49 on <strong>January 22, 2026</strong> unless you cancel.<br>
            You can cancel or change plans anytime.
          </p>
        </div>

        <!-- Payment Method -->
        <div class="pb-8">
          <h4 class="text-xl font-semibold text-slate-900 mb-6">Payment Method</h4>
          <div class="flex items-center gap-6 bg-slate-50 rounded-2xl p-6">
            <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-12 flex items-center justify-center">
              <span class="text-2xl">💳</span>
            </div>
            <div>
              <p class="font-medium text-slate-900">Visa ending in 4242</p>
              <p class="text-slate-600">Expires 12/27 • Billing: Acme Widgets LLC</p>
            </div>
            <a href="/billing" class="ml-auto text-emerald-600 font-medium hover:text-emerald-700">
              Change →
            </a>
          </div>
        </div>

        <!-- Final CTA -->
        <div class="pt-8">
          <button class="w-full py-6 bg-emerald-600 text-white text-2xl font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98]">
            Start My Free Trial
          </button>
          <p class="text-center text-sm text-slate-600 mt-6">
            By clicking above, you agree to HaypBooks <a href="/terms" class="text-emerald-600 hover:underline">Terms of Service</a> and <a href="/privacy" class="text-emerald-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>

    <!-- Back Link -->
    <div class="text-center mt-10">
      <a href="/billing" class="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
        ← Back to billing details
      </a>
    </div>
  </div>
</body>
</html>

===================================================================================