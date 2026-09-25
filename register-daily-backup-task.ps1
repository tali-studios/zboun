# Register (or refresh) a Windows scheduled task:
#   Name: Zboun Daily DB Backup
#   When: every day at 22:00 (10 PM)
#   Action: F:\zboun\backup-database.ps1
#
# Run once in an elevated or normal PowerShell:
#   cd F:\zboun
#   .\register-daily-backup-task.ps1
#
# Prerequisite for unattended runs: create F:\zboun\.backup-db-password
# with your Supabase DB password on a single line (gitignored).

$ErrorActionPreference = "Stop"

$TaskName = "Zboun Daily DB Backup"
$ProjectRoot = if ($PSScriptRoot) { $PSScriptRoot } else { "F:\zboun" }
$ScriptPath = Join-Path $ProjectRoot "backup-database.ps1"
$PasswordFile = Join-Path $ProjectRoot ".backup-db-password"

if (!(Test-Path $ScriptPath)) {
    Write-Host "Missing script: $ScriptPath" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $PasswordFile)) {
    Write-Host ""
    Write-Host "Create this file first (one line = Supabase DB password):" -ForegroundColor Yellow
    Write-Host "  $PasswordFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Without it, the 10 PM task cannot log in non-interactively." -ForegroundColor Yellow
    Write-Host "Create the file, then re-run this script." -ForegroundColor Yellow
    exit 1
}

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`"" `
    -WorkingDirectory $ProjectRoot

# 10:00 PM local time, every day
$trigger = New-ScheduledTaskTrigger -Daily -At 22:00

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

# Prefer S4U / passwordless if possible; Interactive runs when user is logged on.
# For run whether logged on or not, Windows needs the account password once:
try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Daily Zboun Postgres dump to F:\zboun\backups (keeps 30 days)." `
        -Force | Out-Null
} catch {
    Write-Host "Register-ScheduledTask failed: $_" -ForegroundColor Red
    Write-Host "Try running PowerShell as your user (not SYSTEM)." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Scheduled task registered." -ForegroundColor Green
Write-Host "  Name:  $TaskName" -ForegroundColor Cyan
Write-Host "  When:  Daily at 10:00 PM" -ForegroundColor Cyan
Write-Host "  Runs:  $ScriptPath" -ForegroundColor Cyan
Write-Host "  Saves: F:\zboun\backups\" -ForegroundColor Cyan
Write-Host "  Keep:  last 30 days of zboun_backup_*.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test now:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName `"$TaskName`"" -ForegroundColor White
Write-Host "  Get-Content F:\zboun\backups\backup.log -Tail 20" -ForegroundColor White
Write-Host ""
