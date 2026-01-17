<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your Business Portfolio - HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <style>
    body { font-family: 'Inter', sans-serif; }

    .company-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.15);
    }

    .add-entity-card {
      border: 2px dashed #e2e8f0;
    }

    .add-entity-card:hover {
      border-color: #10b981;
      box-shadow: 0 20px 40px -12px rgba(16, 185, 129, 0.1);
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2.5rem;
      font-weight: bold;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }

    .plan-badge {
      @apply px-4 py-1.5 rounded-full text-xs font-medium;
    }

    .user-dropdown:hover {
      background-color: #f1f5f9;
    }
  </style>
</head>
<body class="bg-white min-h-screen">
  <!-- Top Navigation Bar -->
  <header class="border-b border-slate-200 px-8 py-5">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900">HaypBooks Owner Workspace</h1>
            <p class="text-sm text-slate-500">Business Control Center</p>
          </div>
        </div>

        <div class="relative">
          <input type="text" placeholder="Search" class="pl-10 pr-6 py-3 rounded-full border border-slate-300 focus:outline-none focus:border-emerald-500 w-80" />
          <svg class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button class="p-2 rounded-lg hover:bg-slate-100">
          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>
        <button class="p-2 rounded-lg hover:bg-slate-100">
          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>

        <!-- Demo User Dropdown Button -->
        <button class="flex items-center gap-3 px-4 py-2 rounded-lg user-dropdown transition">
          <span class="text-sm font-medium text-slate-700">Demo User</span>
          <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <button class="text-pink-600 hover:text-pink-700 p-2 rounded-lg hover:bg-pink-50 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-8 py-16">
    <div class="mb-16">
      <h2 class="text-4xl font-bold text-slate-900 mb-4">Your Business Portfolio</h2>
      <p class="text-lg text-slate-600">Manage all your connected businesses in one place.</p>
    </div>

    <!-- Business Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
      <!-- Global Assets Ltd -->
      <div class="company-card bg-white rounded-3xl shadow-lg p-10 transition">
        <div class="flex flex-col items-center text-center">
          <div class="avatar bg-blue-600 mb-6">G</div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Global Assets Ltd</h3>
          <p class="text-slate-500 mb-4">Enterprise</p>
          <span class="plan-badge bg-purple-100 text-purple-700 mb-8">Enterprise Plan</span>
          <div class="flex items-center gap-3 text-slate-600 mb-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span class="font-medium">12 Members</span>
            <span class="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span class="text-emerald-600 font-medium">Active</span>
          </div>
          <button class="w-full py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition shadow-lg">
            Open Dashboard →
          </button>
        </div>
      </div>

      <!-- Hayp Creative Agency -->
      <div class="company-card bg-white rounded-3xl shadow-lg p-10 transition">
        <div class="flex flex-col items-center text-center">
          <div class="avatar bg-purple-600 mb-6">H</div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Hayp Creative Agency</h3>
          <p class="text-slate-500 mb-4">Small Business</p>
          <span class="plan-badge bg-emerald-100 text-emerald-700 mb-8">Pro Plan</span>
          <div class="flex items-center gap-3 text-slate-600 mb-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span class="font-medium">5 Members</span>
            <span class="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span class="text-emerald-600 font-medium">Active</span>
          </div>
          <button class="w-full py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition shadow-lg">
            Open Dashboard →
          </button>
        </div>
      </div>

      <!-- Northern Logistics -->
      <div class="company-card bg-white rounded-3xl shadow-lg p-10 transition">
        <div class="flex flex-col items-center text-center">
          <div class="avatar bg-orange-600 mb-6">N</div>
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Northern Logistics</h3>
          <p class="text-slate-500 mb-4">Mid-Market</p>
          <span class="plan-badge bg-amber-100 text-amber-700 mb-8">Starter Plan</span>
          <div class="flex items-center gap-3 text-slate-600 mb-10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span class="font-medium">8 Members</span>
            <span class="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span class="text-emerald-600 font-medium">Active</span>
          </div>
          <button class="w-full py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition shadow-lg">
            Open Dashboard →
          </button>
        </div>
      </div>

      <!-- Register a New Company -->
      <div class="add-entity-card bg-white rounded-3xl shadow-lg p-16 flex flex-col items-center justify-center text-center transition cursor-pointer">
        <div class="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center mb-8">
          <svg class="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-4">Register a New Company</h3>
        <p class="text-slate-600 max-w-xs">Add a new company to your business portfolio.</p>
      </div>
    </div>
  </main>
</body>
</html>