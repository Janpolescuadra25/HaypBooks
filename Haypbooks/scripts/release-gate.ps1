#!/usr/bin/env pwsh
# ──────────────────────────────────────────────────────────────────────────────
# HaypBooks Release Gate
# Runs all quality checks that must pass before any deploy / merge.
# Usage:  pwsh scripts/release-gate.ps1
# Exit 0 = all green, non-zero = at least one gate failed
# ──────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path "$root\Haypbooks")) {
    $root = Split-Path -Parent $PSScriptRoot
}

$backend  = Join-Path $root 'Haypbooks\Backend'
$frontend = Join-Path $root 'Haypbooks\Frontend'

$failed = @()

function Run-Gate {
    param([string]$Name, [string]$Dir, [string]$Command)
    Write-Host "`n═══ $Name ═══" -ForegroundColor Cyan
    Push-Location $Dir
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            $script:failed += $Name
            Write-Host "  FAIL: $Name" -ForegroundColor Red
        } else {
            Write-Host "  PASS: $Name" -ForegroundColor Green
        }
    } catch {
        $script:failed += $Name
        Write-Host "  FAIL: $Name — $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

Write-Host '╔══════════════════════════════════════╗' -ForegroundColor Yellow
Write-Host '║   HaypBooks Release Gate             ║' -ForegroundColor Yellow
Write-Host '╚══════════════════════════════════════╝' -ForegroundColor Yellow

# Gate 1: Backend prisma generate
Run-Gate 'Backend: Prisma Generate'  $backend 'npm run -s prisma:generate'

# Gate 2: Backend typecheck
Run-Gate 'Backend: TypeCheck'        $backend 'npx tsc --noEmit'

# Gate 3: Backend build
Run-Gate 'Backend: Build'            $backend 'npx tsc'

# Gate 4: Frontend typecheck
Run-Gate 'Frontend: TypeCheck'       $frontend 'npx tsc --noEmit'

# Gate 5: Backend unit tests
Run-Gate 'Backend: Unit Tests'       $backend 'npx jest --runInBand --config jest.unit.config.js --passWithNoTests'

# Gate 6: Seed reliability
Run-Gate 'Backend: Seed Smoke'       $backend 'npx ts-node prisma/seed.ts'

# ── Summary ──────────────────────────────────────────────────────────────────
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host '║   Release Gate Summary               ║' -ForegroundColor Yellow
Write-Host '╚══════════════════════════════════════╝' -ForegroundColor Yellow

if ($failed.Count -eq 0) {
    Write-Host '  ALL GATES PASSED' -ForegroundColor Green
    exit 0
} else {
    Write-Host "  $($failed.Count) GATE(S) FAILED:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    exit 1
}
