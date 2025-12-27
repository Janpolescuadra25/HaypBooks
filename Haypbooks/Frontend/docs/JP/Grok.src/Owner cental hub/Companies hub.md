<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Companies Hub - HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .sidebar-link:hover { background-color: rgba(16, 185, 129, 0.1); }
    .sidebar-link.active { background-color: rgba(16, 185, 129, 0.2); border-left: 4px solid #10b981; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex">
  <!-- Fixed Sidebar (No Collapse) -->
  <aside class="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col">
    <!-- Header -->
    <div class="p-6 flex items-center gap-3 border-b border-slate-100">
      <div class="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
        HB
      </div>
      <h1 class="text-xl font-bold text-slate-900">HaypBooks</h1>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
      <a href="#" class="sidebar-link active flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-900">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        Companies
      </a>
      <a href="#" class="sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-700">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        Billing Management
      </a>
      <a href="#" class="sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-700">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        Team
      </a>
      <a href="#" class="sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-700">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Reminders
      </a>
      <a href="#" class="sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-700">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        Support
      </a>
      <a href="#" class="sidebar-link flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-slate-700">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Settings
      </a>
    </nav>

    <!-- User Profile Section (Pinned to Bottom) -->
    <div class="border-t border-slate-200 p-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
          JD
        </div>
        <div>
          <p class="font-semibold text-slate-900">Juan Dela Cruz</p>
          <p class="text-sm text-slate-600">juan@haypbooks.com</p>
        </div>
      </div>
      <div class="space-y-2">
        <button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          Switch Hub
        </button>
        <button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign Out
        </button>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 ml-64 p-12">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-bold text-slate-900">Your Companies</h2>
          <p class="mt-2 text-lg text-slate-600">Select a company to manage its books or create a new one.</p>
        </div>
        <button class="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-lg">
          + Create New Company
        </button>
      </div>
      <div class="text-center py-20 text-slate-500">
        Company cards would go here...
      </div>
    </div>
  </main>
</body>
</html>