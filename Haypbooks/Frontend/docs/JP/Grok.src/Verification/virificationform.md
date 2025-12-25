<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm Your Identity – HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .bg-gradient-custom { background: linear-gradient(to bottom right, #f0fdfa, #ccfbf5); }
  </style>
</head>
<body class="bg-gradient-custom min-h-screen flex items-center justify-center p-4">
  <!-- Compact Verification Card -->
  <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
        HB
      </div>
      <h2 class="text-2xl font-bold text-slate-900 mb-2">Confirm Your Identity</h2>
      <p class="text-base text-slate-600">Choose a secure way to verify it's you.</p>
    </div>

    <div class="space-y-5">
      <!-- Option 1: Enter Your PIN -->
      <button class="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center gap-5 hover:border-emerald-400 hover:shadow-lg transition-all group">
        <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-all">
          <svg class="w-7 h-7 text-slate-600 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0-6c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm0 12c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z"/>
          </svg>
        </div>
        <div class="text-left flex-1">
          <p class="text-lg font-semibold text-slate-900">Enter Your PIN</p>
          <p class="text-sm text-slate-600 mt-0.5">Quick access with your 6-digit PIN</p>
        </div>
        <svg class="w-6 h-6 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Option 2: Send Code to Email -->
      <button class="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center gap-5 hover:border-emerald-400 hover:shadow-lg transition-all group">
        <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-all">
          <svg class="w-7 h-7 text-slate-600 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div class="text-left flex-1">
          <p class="text-lg font-semibold text-slate-900">Send Code to Email</p>
          <p class="text-sm text-slate-600 mt-0.5">One-time code sent to your email</p>
        </div>
        <svg class="w-6 h-6 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Switch Account Link -->
    <div class="text-center mt-6">
      <button class="text-emerald-600 hover:text-emerald-700 font-medium text-base" onclick="location.href='/auth/logout'">
        Not you? Switch account
      </button>
    </div>
  </div>
</body>
</html>


====================================================================================


