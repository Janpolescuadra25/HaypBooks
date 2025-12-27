# Haypbooks v9 - Development Startup Script

Write-Host "🚀 Starting Haypbooks v9 Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
$backendProcess = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($backendProcess) {
    Write-Host "⚠️  Backend already running on port 4000" -ForegroundColor Yellow
} else {
    Write-Host "📦 Starting NestJS Backend (port 4000)..." -ForegroundColor Green
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 3
}

# Check if frontend is already running
$frontendProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendProcess) {
    Write-Host "⚠️  Frontend already running on port 3000" -ForegroundColor Yellow
} else {
    Write-Host "🎨 Starting Next.js Frontend (port 3000)..." -ForegroundColor Green
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Frontend'; npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "✅ Development servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://127.0.0.1:4000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Demo credentials:" -ForegroundColor Cyan
Write-Host "   Email:    demo@haypbooks.test" -ForegroundColor White
Write-Host "   Password: password" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
