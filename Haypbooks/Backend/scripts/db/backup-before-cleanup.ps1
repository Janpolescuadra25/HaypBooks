# Database Backup Script for TenantId_old Cleanup
# Run this BEFORE any schema changes

param(
    [string]$BackupDir = ".\backups",
    [string]$DbName = "haypbooks",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "haypbooks_before_tenantid_cleanup_${timestamp}.sql"

# Find pg_dump executable
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $pgDumpPath) {
    # Try common PostgreSQL installation paths
    $pgDumpPath = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\pg_dump.exe" -ErrorAction SilentlyContinue | 
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $pgDumpPath) {
    Write-Host "❌ pg_dump not found!" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL or add pg_dump to your PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Using pg_dump: $pgDumpPath" -ForegroundColor Gray

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "✓ Created backup directory: $BackupDir" -ForegroundColor Green
}

Write-Host "`n🔄 Starting database backup..." -ForegroundColor Cyan
Write-Host "Database: $DbName" -ForegroundColor Yellow
Write-Host "Backup file: $backupFile" -ForegroundColor Yellow

# Run pg_dump
$env:PGPASSWORD = "Ninetails45"  # Set your password here or use .pgpass file
try {
    $dumpArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-d", $DbName,
        "-F", "p",  # Plain text format
        "-f", $backupFile,
        "--no-owner",
        "--no-privileges",
        "--verbose"
    )
    
    & $pgDumpPath @dumpArgs
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "`n✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "   File: $backupFile" -ForegroundColor Green
        Write-Host "   Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        
        # Test backup file
        Write-Host "`n🔍 Verifying backup file..." -ForegroundColor Cyan
        $content = Get-Content $backupFile -First 10
        if ($content -match "PostgreSQL database dump") {
            Write-Host "✓ Backup file format verified" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Warning: Backup file format looks unusual" -ForegroundColor Yellow
        }
        
        # List all backups
        Write-Host "`n📋 Available backups in $BackupDir:" -ForegroundColor Cyan
        Get-ChildItem $BackupDir -Filter "*.sql" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 5 |
            ForEach-Object {
                $size = [math]::Round($_.Length / 1MB, 2)
                Write-Host "   $($_.Name) - ${size}MB - $($_.LastWriteTime)" -ForegroundColor Gray
            }
        
        Write-Host "`n✅ Backup script completed!" -ForegroundColor Green
        Write-Host "   You can now proceed with schema changes." -ForegroundColor Green
        Write-Host "   Keep this backup until changes are verified!" -ForegroundColor Yellow
        
    } else {
        throw "pg_dump exited with code $LASTEXITCODE"
    }
    
} catch {
    Write-Host "`n❌ Backup failed: $_" -ForegroundColor Red
    Write-Host "   Fix errors before proceeding with schema changes!" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n📝 To restore this backup later, run:" -ForegroundColor Cyan
Write-Host "   psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f `"$backupFile`"" -ForegroundColor White
