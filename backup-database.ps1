# Zboun Database Backup Script (Windows / PowerShell)
# Saves dumps to: F:\zboun\backups\
# Uses pg_dump + Supabase Session pooler (IPv4) — no Docker required.

$ErrorActionPreference = "Stop"

# Always save SQL dumps here (project root / backups)
$ProjectRoot = if ($PSScriptRoot -and (Split-Path $PSScriptRoot -Leaf) -ne "backups") {
    $PSScriptRoot
} else {
    "F:\zboun"
}
$BackupDir = Join-Path $ProjectRoot "backups"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "zboun_backup_$Date.sql"

# Your project settings (password is NOT stored — you enter it when prompted)
$ProjectRef = "tbnfrqftpocihuzvlttm"
$PoolerHost = "aws-1-ap-northeast-2.pooler.supabase.com"
$DbUser = "postgres.$ProjectRef"
$PgDump = "F:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Zboun Database Backup Tool" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dumps will be saved to: $BackupDir" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

if (!(Test-Path $PgDump)) {
    Write-Host "pg_dump not found at: $PgDump" -ForegroundColor Red
    Write-Host "Update `$PgDump in this script if PostgreSQL is installed elsewhere." -ForegroundColor Yellow
    exit 1
}

$securePass = Read-Host "Enter Supabase database password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
try {
    $plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
} finally {
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

$encodedPass = [System.Uri]::EscapeDataString($plainPass)
$DbUrl = "postgresql://${DbUser}:${encodedPass}@${PoolerHost}:5432/postgres?sslmode=require"

Write-Host ""
Write-Host "Creating backup..." -ForegroundColor Cyan
Write-Host "Target: $BackupFile" -ForegroundColor Cyan
Write-Host ""

try {
    & $PgDump $DbUrl -f $BackupFile
    if ($LASTEXITCODE -ne 0 -or !(Test-Path $BackupFile)) {
        throw "pg_dump failed (exit code $LASTEXITCODE)"
    }

    $sizeMb = [math]::Round((Get-Item $BackupFile).Length / 1MB, 2)
    Write-Host ""
    Write-Host "Backup completed successfully!" -ForegroundColor Green
    Write-Host "File: $BackupFile" -ForegroundColor Cyan
    Write-Host "Size: $sizeMb MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tip: copy this file to Google Drive / OneDrive / external disk." -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "Backup failed: $_" -ForegroundColor Red
    if (Test-Path $BackupFile) { Remove-Item $BackupFile -Force -ErrorAction SilentlyContinue }
    exit 1
} finally {
    $plainPass = $null
    $encodedPass = $null
    $DbUrl = $null
}
