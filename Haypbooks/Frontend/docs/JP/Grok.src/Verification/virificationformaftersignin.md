<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Identity</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .otp-input:focus {
      outline: none;
      ring: 2px solid #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-6">
  <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-12">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-slate-900 mb-2">Confirm Your Identity</h2>
      <p class="text-md text-slate-600">We sent a 6-digit code to your email</p>
    </div>

    <!-- Form -->
    <form id="otpForm" class="space-y-6">
      <!-- OTP Inputs -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-700 text-center">Enter verification code</label>
        <div class="flex gap-3 justify-center">
          <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                 class="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl otp-input focus:border-emerald-500"
                 id="digit1" autocomplete="off">
          <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                 class="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl otp-input focus:border-emerald-500"
                 id="digit2" autocomplete="off">
          <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                 class="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl otp-input focus:border-emerald-500"
                 id="digit3" autocomplete="off">
          <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                 class="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl otp-input focus:border-emerald-500"
                 id="digit4" autocomplete="off">
          <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                 class="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl otp-input focus:border-emerald-500"
                 id="digit5" autocomplete="off">
          <input type="text" maxlength="1" inputmode="numeric" pattern="[0-9]*"
                 class="w-14 h-14 text-center text-2xl font-semibold border-2 border-slate-300 rounded-xl otp-input focus:border-emerald-500"
                 id="digit6" autocomplete="off">
        </div>
      </div>

      <!-- Remember-me removed from the verification UX; device memory is no longer offered here -->

      <!-- Error message (hidden by default) -->
      <div id="errorMsg" class="hidden text-center text-red-600 text-sm"></div>

      <!-- Buttons -->
      <div class="flex gap-4">
        <button type="button" id="resendBtn" class="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition">
          Resend Code
        </button>
        <button type="submit" id="verifyBtn" class="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60">
          Verify & Continue
        </button>
      </div>

      <!-- NOTE: After successful verification the app redirects to hub selection so the user can choose Owner or Accountant -->
      <p class="text-center text-sm text-slate-500 mt-3">After successful verification you'll be redirected to <strong>/hub/selection</strong> to choose your Hub (Owner or Accountant).</p>
    </form>

    <!-- Footer link -->
    <div class="text-center mt-8">
      <button class="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
        Not you? Switch account
      </button>
    </div>
  </div>

  <script>
    // Auto-focus next input
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        if (/^\d$/.test(value)) {
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        } else {
          e.target.value = '';
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

    // Form submission (demo only) — in production the server verifies the OTP then redirects
    document.getElementById('otpForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = Array.from(inputs).map(i => i.value).join('');

      if (code.length !== 6) {
        document.getElementById('errorMsg').textContent = 'Please enter all 6 digits';
        document.getElementById('errorMsg').classList.remove('hidden');
        return;
      }

      try {
        // In real app: POST to /api/auth/email/verify-code with { code }
        const res = await fetch('/api/auth/email/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          document.getElementById('errorMsg').textContent = err?.message || 'Verification failed. Please try again.';
          document.getElementById('errorMsg').classList.remove('hidden');
          return;
        }

        // On success: redirect to hub selection where the user chooses Owner or Accountant
        window.location.href = '/hub/selection';
      } catch (err) {
        document.getElementById('errorMsg').textContent = 'Network error. Please try again.';
        document.getElementById('errorMsg').classList.remove('hidden');
      }
    });

    // Resend button (demo)
    document.getElementById('resendBtn').addEventListener('click', () => {
      alert('Code resent!');
      // In real app: call /api/auth/email/send-code
    });
  </script>
</body>
</html>