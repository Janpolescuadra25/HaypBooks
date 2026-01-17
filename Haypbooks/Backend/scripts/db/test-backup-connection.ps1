# Quick Backup Test Script
# Tests if pg_dump works before running the real backup

$DbName = "haypbooks"
$DbUser = "postgres"
$DbHost = "localhost"
$DbPort = "5432"

Write-Host "`n🔍 Testing PostgreSQL connection and pg_dump..." -ForegroundColor Cyan

# Find pg_dump
$pgDumpPath = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\pg_dump.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-not $pgDumpPath) {
    Write-Host "❌ pg_dump not found in PostgreSQL installation" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL or add it to PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Found pg_dump: $pgDumpPath" -ForegroundColor Green

# Test connection
Write-Host "`n🔄 Testing database connection..." -ForegroundColor Cyan
$env:PGPASSWORD = "Ninetails45"

try {
    $testFile = "test_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    
    $dumpArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-d", $DbName,
        "-F", "p",
        "-f", $testFile,
        "--schema-only",  # Only schema, no data (fast test)
        "--no-owner",
        "--no-privileges"
    )
    
    & $pgDumpPath @dumpArgs 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $testFile)) {
        $size = (Get-Item $testFile).Length / 1KB
        Write-Host "✅ Connection successful!" -ForegroundColor Green
        Write-Host "   Test backup created: $testFile" -ForegroundColor Green
        Write-Host "   Size: $([math]::Round($size, 2)) KB (schema only)" -ForegroundColor Green
        
        # Clean up test file
        Remove-Item $testFile -Force
        Write-Host "✓ Test file cleaned up" -ForegroundColor Gray
        
        Write-Host "`n✅ Backup script is ready to use!" -ForegroundColor Green
        Write-Host "   Run: .\scripts\db\backup-before-cleanup.ps1" -ForegroundColor Cyan
        
    } else {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Host "`n❌ Connection test failed: $_" -ForegroundColor Red
    Write-Host "   Check database credentials and ensure PostgreSQL is running" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
