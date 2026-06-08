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

$ErrorActionPreference = "Stop"
$dt = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = "$PSScriptRoot\..\backup_cbtomelloso_prod_$dt.sql"
$mysqlDump = "C:\Program Files\MariaDB 12.2\bin\mysqldump.exe"
$mysql = "C:\Program Files\MariaDB 12.2\bin\mysql.exe"
$localUser = "cbtomelloso_user"
$localPass = "CbTom2025!Secure"

Write-Host "=== DUMP LOCAL ===> $dumpFile ==="
& $mysqlDump -h 127.0.0.1 -u $localUser -p"$localPass" --databases $AivenDb --routines --triggers --events --add-drop-database --result-file="$dumpFile" 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Dump local falló"; exit 1 }

Write-Host "=== RESTORE ===> Aiven ($AivenHost`:$AivenPort) ==="
& $mysql -h $AivenHost -P $AivenPort -u $AivenUser -p"$AivenPass" --ssl --ssl-verify-server-cert=OFF $AivenDb -e "source $dumpFile" 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Restore en Aiven falló"; exit 1 }

Write-Host "=== VERIFICANDO ==="
$tables = & $mysql -h $AivenHost -P $AivenPort -u $AivenUser -p"$AivenPass" --ssl --ssl-verify-server-cert=OFF $AivenDb -e "SHOW TABLES" 2>&1
Write-Host "Tablas en Aiven:`n$tables"

Write-Host "=== LISTO ==="
