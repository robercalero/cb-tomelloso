param(
    [Parameter(Mandatory)]
    [string]$RenderHost,
    [Parameter(Mandatory)]
    [string]$RenderPort,
    [Parameter(Mandatory)]
    [string]$RenderUser,
    [Parameter(Mandatory)]
    [string]$RenderPass,
    [Parameter(Mandatory)]
    [string]$RenderDb
)

$ErrorActionPreference = "Stop"
$dt = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = "$PSScriptRoot\..\backup_cbtomelloso_prod_$dt.sql"
$pgDump = "pg_dump"
$psql = "psql"
$localUser = "cbtomelloso_user"
$localPass = "CbTom2025!Secure"
$localDb = "cbtomelloso"

Write-Host "=== DUMP LOCAL (PostgreSQL) ===> $dumpFile ==="
$env:PGPASSWORD = $localPass
& $pgDump -h 127.0.0.1 -p 5432 -U $localUser -d $localDb --no-owner --no-acl --file="$dumpFile" 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Dump local falló"; exit 1 }

Write-Host "=== RESTORE ===> Render PostgreSQL ($RenderHost`:$RenderPort) ==="
$env:PGPASSWORD = $RenderPass
& $psql -h $RenderHost -p $RenderPort -U $RenderUser -d $RenderDb --ssl-mode=require -f "$dumpFile" 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Restore en Render falló"; exit 1 }

Write-Host "=== VERIFICANDO ==="
$env:PGPASSWORD = $RenderPass
$tables = & $psql -h $RenderHost -p $RenderPort -U $RenderUser -d $RenderDb --ssl-mode=require -c "\dt" 2>&1
Write-Host "Tablas en Render:`n$tables"

$env:PGPASSWORD = ""
Write-Host "=== LISTO ==="
