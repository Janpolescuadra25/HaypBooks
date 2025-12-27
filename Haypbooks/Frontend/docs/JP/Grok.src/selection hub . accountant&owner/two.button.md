<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Your Account - HaypBooks</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4 py-12">
  <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 border border-white/20">
    <!-- Logo -->
    <div class="flex justify-center mb-8">
      <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
        HB
      </div>
    </div>

    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-slate-900">Create your account</h1>
      <p class="mt-3 text-lg text-slate-600">
        Manage your accounting with clarity and confidence<br>using HaypBooks.
      </p>
    </div>

    <!-- Question -->
    <p class="text-center text-lg font-medium text-slate-800 mb-8">
      Which best describes your role?
    </p>

    <!-- Role Options -->
    <div class="space-y-4">
      <!-- My Business -->
      <button class="w-full p-6 bg-white border-2 border-slate-200 rounded-2xl text-left hover:border-emerald-400 hover:shadow-lg transition-all duration-300 group">
        <h3 class="text-xl font-bold text-slate-900">My Business</h3>
        <p class="mt-2 text-slate-700">
          I'm the owner running and managing my business
        </p>
        <div class="mt-4 flex justify-end">
          <span class="text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Continue →
          </span>
        </div>
      </button>

      <!-- Accountant -->
      <button class="w-full p-6 bg-white border-2 border-slate-200 rounded-2xl text-left hover:border-emerald-400 hover:shadow-lg transition-all duration-300 group">
        <h3 class="text-xl font-bold text-slate-900">Accountant</h3>
        <p class="mt-2 text-slate-700">
          I support clients by managing their accounts
        </p>
        <div class="mt-4 flex justify-end">
          <span class="text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Continue →
          </span>
        </div>
      </button>
    </div>

    <!-- Sign In Link -->
    <p class="text-center mt-10">
      <span class="text-slate-600">Already have an account?</span>
      <a href="#" class="ml-2 text-emerald-600 font-semibold hover:text-emerald-700 transition">
        Sign in
      </a>
    </p>

    <!-- Back Link -->
    <div class="text-center mt-8">
      <a href="#" class="inline-flex items-center text-slate-600 hover:text-slate-800 font-medium transition">
        ← Back to home
      </a>
    </div>
  </div>
</body>
</html>