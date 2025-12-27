<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscriptions & Billing - HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .bg-gradient-custom { background: linear-gradient(to bottom right, #f0fdfa, #ccfbf5); }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08); }
    .sidebar-active { @apply bg-emerald-50 border-l-4 border-emerald-600; }
    .sidebar-hover:hover { @apply bg-emerald-50; }

    /* Row background color by status */
    .row-active { @apply bg-emerald-50; }
    .row-trial { @apply bg-amber-50; }
    .row-pastdue { @apply bg-red-50; }
  </style>
</head>
<body class="bg-gradient-custom min-h-screen flex">
  <!-- Left Sidebar – Retained -->
  <aside class="w-72 bg-white shadow-lg flex flex-col">
    <div class="p-6 border-b">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          HB
        </div>
        <h1 class="text-2xl font-bold text-slate-900">HaypBooks</h1>
      </div>
    </div>
    <nav class="flex-1 p-4 space-y-2">
      <a href="/hub/companies" class="block px-4 py-3 rounded-lg sidebar-hover transition-all flex items-center gap-2">
        🏢 <span>Companies</span>
      </a>
      <a href="/hub/reminders" class="block px-4 py-3 rounded-lg sidebar-hover transition-all flex items-center justify-between">
        <span>🔔 Reminders</span>
        <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">3</span>
      </a>
      <a href="/hub/billing" class="block px-4 py-3 rounded-lg sidebar-active transition-all font-medium text-emerald-700 flex items-center gap-2">
        💳 <span>Subscriptions & Billing</span>
      </a>
      <a href="/hub/team" class="block px-4 py-3 rounded-lg sidebar-hover transition-all flex items-center gap-2">
        👥 <span>Team</span>
      </a>
    </nav>
    <div class="p-4 border-t">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-slate-300 rounded-full"></div>
        <div>
          <p class="font-medium text-slate-900">Alex Rivera</p>
          <p class="text-sm text-slate-500">alex@rivera.com</p>
        </div>
      </div>
      <a href="/logout" class="block mt-4 text-center text-slate-600 hover:text-slate-900">Logout</a>
    </div>
  </aside>

  <!-- Main Content – Revised Subscriptions & Billing -->
  <main class="flex-1 p-12">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-12">
        <h2 class="text-4xl font-bold text-slate-900 mb-4">Subscriptions & Billing</h2>
        <p class="text-xl text-slate-600">Manage plans, view invoices, and update payment methods across all your companies.</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p class="text-5xl font-bold text-emerald-600">2</p>
          <p class="text-slate-600 mt-2">Active Plans</p>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p class="text-5xl font-bold text-amber-600">1</p>
          <p class="text-slate-600 mt-2">Free Trials</p>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p class="text-5xl font-bold text-red-600">1</p>
          <p class="text-slate-600 mt-2">Past Due</p>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p class="text-5xl font-bold text-slate-700">$178</p>
          <p class="text-slate-600 mt-2">Next Billing Total</p>
        </div>
      </div>

      <!-- Search + Single Filter (Removed redundant "Sort by") -->
      <div class="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- Search Box -->
        <div class="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search companies..."
            class="w-full px-6 py-4 pl-14 text-lg border border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
          />
          <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>

        <!-- Single Filter Dropdown -->
        <div class="flex items-center gap-4">
          <label class="text-lg font-medium text-slate-700">Show:</label>
          <select class="px-6 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 text-lg">
            <option>All Subscriptions</option>
            <option>Active Only</option>
            <option>Free Trials</option>
            <option>Past Due</option>
          </select>
        </div>
      </div>

      <!-- Billing Table with Row Background Color by Status -->
      <div class="bg-white rounded-3xl shadow-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-8 py-5 text-left text-sm font-semibold text-slate-900">Company</th>
              <th class="px-8 py-5 text-left text-sm font-semibold text-slate-900">Plan</th>
              <th class="px-8 py-5 text-left text-sm font-semibold text-slate-900">Status</th>
              <th class="px-8 py-5 text-left text-sm font-semibold text-slate-900">Next Billing / Trial End</th>
              <th class="px-8 py-5 text-left text-sm font-semibold text-slate-900">Monthly Amount</th>
              <th class="px-8 py-5 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <!-- Active Plan -->
            <tr class="row-active card-hover transition-all">
              <td class="px-8 py-6">
                <p class="font-medium text-slate-900">Acme Widgets LLC</p>
                <p class="text-sm text-slate-500">Created June 2025</p>
              </td>
              <td class="px-8 py-6">
                <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">Growth Plan</span>
              </td>
              <td class="px-8 py-6">
                <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">Active</span>
              </td>
              <td class="px-8 py-6">Jan 15, 2026</td>
              <td class="px-8 py-6 font-medium">$99.00</td>
              <td class="px-8 py-6">
                <a href="#" class="text-emerald-600 hover:underline mr-4">View Invoice</a>
                <a href="#" class="text-emerald-600 hover:underline">Manage</a>
              </td>
            </tr>

            <!-- Free Trial -->
            <tr class="row-trial card-hover transition-all">
              <td class="px-8 py-6">
                <p class="font-medium text-slate-900">Rivera Consulting</p>
                <p class="text-sm text-slate-500">Created December 2025</p>
              </td>
              <td class="px-8 py-6">
                <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">Free Trial</span>
              </td>
              <td class="px-8 py-6">
                <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">Trial Active</span>
              </td>
              <td class="px-8 py-6">Trial ends Jan 11, 2026</td>
              <td class="px-8 py-6 font-medium">$0.00</td>
              <td class="px-8 py-6">
                <a href="#" class="text-emerald-600 hover:underline">Choose Plan</a>
              </td>
            </tr>

            <!-- Past Due -->
            <tr class="row-pastdue card-hover transition-all">
              <td class="px-8 py-6">
                <p class="font-medium text-slate-900">Tech Innovations Inc</p>
                <p class="text-sm text-slate-500">Created March 2025</p>
              </td>
              <td class="px-8 py-6">
                <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">Professional Plan</span>
              </td>
              <td class="px-8 py-6">
                <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Past Due</span>
              </td>
              <td class="px-8 py-6 text-red-600 font-medium">Overdue since Dec 15</td>
              <td class="px-8 py-6 font-medium text-red-600">$79.00</td>
              <td class="px-8 py-6">
                <a href="#" class="text-red-600 hover:underline font-medium mr-4">Pay Now</a>
                <a href="#" class="text-emerald-600 hover:underline">Update Card</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment Methods -->
      <div class="mt-12 bg-white rounded-3xl shadow-lg p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-6">Payment Methods</h3>
        <div class="space-y-6">
          <div class="flex items-center justify-between py-4 border-b border-slate-200">
            <div class="flex items-center gap-6">
              <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-12"></div>
              <div>
                <p class="font-medium text-slate-900">Visa ending in 4242</p>
                <p class="text-sm text-slate-600">Expires 12/28 • Default</p>
              </div>
            </div>
            <button class="text-emerald-600 hover:underline font-medium">Edit</button>
          </div>
          <button class="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-lg">
            + Add Payment Method
          </button>
        </div>
      </div>

      <!-- Billing History -->
      <div class="mt-10 text-center">
        <a href="/billing/history" class="text-emerald-600 font-medium hover:underline text-lg">
          View full billing history →
        </a>
      </div>
    </div>
  </main>
</body>
</html>