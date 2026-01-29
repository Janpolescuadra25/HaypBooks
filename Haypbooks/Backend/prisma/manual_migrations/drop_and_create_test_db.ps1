# PowerShell helper: drop and recreate test DB
$env:PGPASSWORD = "Ninetails45"
$psql = "psql -h localhost -U postgres -d postgres -c"
Invoke-Expression "$psql \"DROP DATABASE IF EXISTS haypbooks_migration_test;\""
Invoke-Expression "$psql \"CREATE DATABASE haypbooks_migration_test;\""
Write-Output "Recreated test DB"