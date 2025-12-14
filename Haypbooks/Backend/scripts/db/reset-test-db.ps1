param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    Write-Host "DATABASE_URL is not set. Please set DATABASE_URL or pass as argument." -ForegroundColor Red
    exit 1
}

# Attempt to use psql if available to drop/create database
try {
    $psql = Get-Command psql -ErrorAction Stop
    $uri = [Uri]$DatabaseUrl
    $db = $uri.AbsolutePath.TrimStart('/')
    $host = $uri.Host
    $user = $uri.UserInfo.Split(':')[0]
    $password = $uri.UserInfo.Split(':')[1]

    Write-Host "Dropping and recreating database $db on $host as $user..."
    & psql -h $host -U $user -c "DROP DATABASE IF EXISTS $db;" 2>$null
    & psql -h $host -U $user -c "CREATE DATABASE $db;" 2>$null
} catch {
    Write-Host "psql not found or failed; falling back to prisma migrate reset..."
}

Write-Host "Resetting database via Prisma migrate reset..."
npx prisma migrate reset --force --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma migrate reset failed. See output above." -ForegroundColor Red
    exit 1
}

Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "Seeding database (if seed script exists)..."
if (Test-Path prisma/seed.ts) {
    npx ts-node prisma/seed.ts
}

Write-Host "Reset complete. Run db validation scripts next: npm run check:schema && npm run db:smoke"
