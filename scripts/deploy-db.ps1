# Script para migrar la BBDD local → Aiven MySQL
# Uso: .\scripts\deploy-db.ps1 -AivenHost "host.aivencloud.com" -AivenPort "12345" -AivenUser "avnadmin" -AivenPass "password" -AivenDb "cbtomelloso"

param(
    [Parameter(Mandatory)]
    [string]$AivenHost,
    [Parameter(Mandatory)]
    [string]$AivenPort,
    [Parameter(Mandatory)]
    [string]$AivenUser,
    [Parameter(Mandatory)]
    [string]$AivenPass,
    [Parameter(Mandatory)]
    [string]$AivenDb
)

$dt = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = "$PSScriptRoot\..\backup_cbtomelloso_prod_$dt.sql"
$mysqlDump = "C:\Program Files\MariaDB 12.2\bin\mysqldump.exe"
$mysql = "C:\Program Files\MariaDB 12.2\bin\mysql.exe"

Write-Host "=== DUMP LOCAL → $dumpFile ==="
& $mysqlDump -u cbtomelloso_user -p"CbTom2025!Secure" cbtomelloso --routines --triggers --events --result-file="$dumpFile"
if (-not $?) { Write-Host "ERROR: Dump local falló"; exit 1 }

Write-Host "=== RESTORE → Aiven ($AivenHost:$AivenPort) ==="
& $mysql -h $AivenHost -P $AivenPort -u $AivenUser -p"$AivenPass" $AivenDb < "$dumpFile"
if (-not $?) { Write-Host "ERROR: Restore en Aiven falló"; exit 1 }

Write-Host "=== LISTO ==="
