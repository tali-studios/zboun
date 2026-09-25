# Zboun Database Backup Script (Windows / PowerShell)
# Saves dumps to: F:\zboun\backups\
# Uses pg_dump + Supabase Session pooler (IPv4) — no Docker required.
#
# Interactive: prompts for password.
# Scheduled / non-interactive: set SUPABASE_DB_PASSWORD env var, OR put the
# password on one line in F:\zboun\.backup-db-password (gitignored).

$ErrorActionPreference = "Stop"

# Always save SQL dumps here (project root / backups)
$ProjectRoot = if ($PSScriptRoot) { $PSScriptRoot } else { "F:\zboun" }
$BackupDir = Join-Path $ProjectRoot "backups"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "zboun_backup_$Date.sql"
$RetainDays = 30
$PasswordFile = Join-Path $ProjectRoot ".backup-db-password"

# Your project settings
$ProjectRef = "tbnfrqftpocihuzvlttm"
$PoolerHost = "aws-1-ap-northeast-2.pooler.supabase.com"
$DbUser = "postgres.$ProjectRef"
$PgDump = "F:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

$LogFile = Join-Path $BackupDir "backup.log"

function Write-BackupLog([string]$Message, [string]$Color = "White") {
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    Write-Host $line -ForegroundColor $Color
    try {
        if (!(Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        }
        Add-Content -Path $LogFile -Value $line -Encoding UTF8
    } catch {
        # ignore log write failures
    }
}

Write-BackupLog "========== Zboun database backup started ==========" "Cyan"
Write-BackupLog "Target folder: $BackupDir" "Cyan"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

if (!(Test-Path $PgDump)) {
    Write-BackupLog "pg_dump not found at: $PgDump" "Red"
    Write-BackupLog "Update `$PgDump in this script if PostgreSQL is installed elsewhere." "Yellow"
    exit 1
}

# Resolve password: env → password file → interactive prompt
$plainPass = $null
if ($env:SUPABASE_DB_PASSWORD -and $env:SUPABASE_DB_PASSWORD.Trim().Length -gt 0) {
    $plainPass = $env:SUPABASE_DB_PASSWORD.Trim()
    Write-BackupLog "Using password from SUPABASE_DB_PASSWORD env var." "DarkGray"
} elseif (Test-Path $PasswordFile) {
    $plainPass = (Get-Content -Path $PasswordFile -Raw -ErrorAction Stop).Trim()
    if (-not $plainPass) {
        Write-BackupLog "Password file is empty: $PasswordFile" "Red"
        exit 1
    }
    Write-BackupLog "Using password from .backup-db-password file." "DarkGray"
} elseif ([Environment]::UserInteractive) {
    $securePass = Read-Host "Enter Supabase database password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    try {
        $plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    }
} else {
    Write-BackupLog "No password available for non-interactive run." "Red"
    Write-BackupLog "Create F:\zboun\.backup-db-password (one line) or set SUPABASE_DB_PASSWORD." "Yellow"
    exit 1
}

$encodedPass = [System.Uri]::EscapeDataString($plainPass)
$DbUrl = "postgresql://${DbUser}:${encodedPass}@${PoolerHost}:5432/postgres?sslmode=require"

Write-BackupLog "Creating backup: $BackupFile" "Cyan"

try {
    & $PgDump $DbUrl -f $BackupFile
    if ($LASTEXITCODE -ne 0 -or !(Test-Path $BackupFile)) {
        throw "pg_dump failed (exit code $LASTEXITCODE)"
    }

    $sizeMb = [math]::Round((Get-Item $BackupFile).Length / 1MB, 2)
    Write-BackupLog "Backup completed successfully ($sizeMb MB)." "Green"
    Write-BackupLog "File: $BackupFile" "Cyan"
} catch {
    Write-BackupLog "Backup failed: $_" "Red"
    if (Test-Path $BackupFile) { Remove-Item $BackupFile -Force -ErrorAction SilentlyContinue }
    $plainPass = $null
    $encodedPass = $null
    $DbUrl = $null
    exit 1
} finally {
    $plainPass = $null
    $encodedPass = $null
    $DbUrl = $null
}

# Keep only the last ~1 month of dumps
try {
    $cutoff = (Get-Date).AddDays(-$RetainDays)
    $old = Get-ChildItem -Path $BackupDir -Filter "zboun_backup_*.sql" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -lt $cutoff }

    $removed = 0
    foreach ($file in $old) {
        Remove-Item -LiteralPath $file.FullName -Force -ErrorAction Stop
        $removed++
        Write-BackupLog "Removed old backup (>${RetainDays}d): $($file.Name)" "DarkGray"
    }
    if ($removed -eq 0) {
        Write-BackupLog "Retention: no backups older than $RetainDays days." "DarkGray"
    } else {
        Write-BackupLog "Retention: removed $removed old backup(s)." "Yellow"
    }
} catch {
    Write-BackupLog "Retention cleanup warning: $_" "Yellow"
}

Write-BackupLog "========== Backup finished ==========" "Cyan"
exit 0
