$ErrorActionPreference = 'Stop'
$email = "smoke-presignup-$((Get-Date).ToFileTimeUtc())@haypbooks.test"
Write-Host "Using test email: $email"
$pre = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/auth/pre-signup' -Method Post -Body (ConvertTo-Json @{email=$email; password='Presign1!'; name='E2E Pre'; role='owner'}) -ContentType 'application/json' -ErrorAction Stop
Write-Host "pre-signup response:"; $pre | ConvertTo-Json -Depth 5 | Write-Host
$otp = $pre.otp
if (-not $otp) {
  Write-Host "No OTP returned by pre-signup; creating test OTP via /api/test/create-otp"
  $inject = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/test/create-otp' -Method Post -Body (ConvertTo-Json @{email=$email; otp='654321'; purpose='VERIFY'}) -ContentType 'application/json' -ErrorAction Stop
  $otp = $inject.otp
  Write-Host "Injected OTP: $otp"
} else { Write-Host "Pre-supplied OTP: $otp" }

Write-Host "Completing signup..."
$complete = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/auth/complete-signup' -Method Post -Body (ConvertTo-Json @{signupToken=$pre.signupToken; code=$otp; method='email'}) -ContentType 'application/json' -ErrorAction Stop
Write-Host "Complete-signup response:"; $complete | ConvertTo-Json -Depth 5 | Write-Host

# Poll for created user
$profileUrl = "http://127.0.0.1:4000/api/test/user?email=$([uri]::EscapeDataString($email))"
$maxPollMs = 10000; $interval = 500; $elapsed = 0; $found = $false
while ($elapsed -lt $maxPollMs) {
  try {
    $u = Invoke-RestMethod -Uri $profileUrl -Method Get -ErrorAction Stop
    if ($u) { $found = $true; break }
  } catch { }
  Start-Sleep -Milliseconds $interval
  $elapsed += $interval
}
if (-not $found) { Write-Host "ERROR: User not found after verification"; exit 2 }
Write-Host "User found:"; $u | ConvertTo-Json -Depth 5 | Write-Host

# Attempt login
$login = Invoke-RestMethod -Uri 'http://127.0.0.1:4000/api/auth/login' -Method Post -Body (ConvertTo-Json @{email=$email; password='Presign1!'}) -ContentType 'application/json' -ErrorAction Stop
Write-Host "Login result:"; $login | ConvertTo-Json -Depth 5 | Write-Host
Write-Host 'Smoke pre-signup flow: SUCCESS'