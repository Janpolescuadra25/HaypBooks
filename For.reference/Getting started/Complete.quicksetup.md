<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HaypBooks!</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .bg-gradient-custom { background: linear-gradient(to bottom right, #f0fdfa, #ccfbf1); }
  </style>
</head>
<body class="bg-gradient-custom min-h-screen flex items-center justify-center px-4 py-12">
  <div class="max-w-2xl w-full text-center">
    <div class="bg-white rounded-3xl shadow-2xl p-12">
      <!-- Success Icon -->
      <div class="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-8">
        <svg class="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>

      <h1 class="text-4xl font-bold text-slate-900 mb-6">
        Welcome aboard! You're all set 🎉
      </h1>

      <p class="text-xl text-slate-600 mb-4">
        Your Growth Plan subscription is active.
      </p>
      <p class="text-lg text-slate-600 mb-10">
        You've been charged $49 today. You can cancel anytime in your account settings.
      </p>

      <!-- Company Context (if known) -->
      <div class="bg-emerald-50 rounded-2xl p-6 mb-10">
        <p class="text-lg font-medium text-slate-900">
          Ready to set up <strong>Acme Widgets LLC</strong>?
        </p>
        <p class="text-slate-600">
          Let's get your books organized in minutes.
        </p>
      </div>

      <!-- Primary Action -->
      <div class="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-12">
        <a href="/onboarding" class="block px-8 py-6 bg-emerald-600 text-white text-xl font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl">
          Complete Quick Setup
        </a>
      </div>

      <p class="text-sm text-slate-500 mt-12">
        Need help? Our support team is here — <a href="/support" class="text-emerald-600 hover:underline">chat with us</a>.
      </p>
    </div>
  </div>
</body>
</html>