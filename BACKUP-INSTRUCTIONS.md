# How to backup the Zboun database (Windows)

All SQL dump files are saved to:

```text
F:\zboun\backups\
```

Example: `F:\zboun\backups\zboun_backup_20260804_141500.sql`

Old dumps are deleted automatically after **30 days**.

## Daily automatic backup (10:00 PM)

1. Create a password file (one line = Supabase database password):

```powershell
Set-Content -Path F:\zboun\.backup-db-password -Value "YOUR_SUPABASE_DB_PASSWORD" -NoNewline
```

This file is gitignored — never commit it.

2. Register the Windows scheduled task:

```powershell
cd F:\zboun
.\register-daily-backup-task.ps1
```

3. Optional — run once immediately to verify:

```powershell
Start-ScheduledTask -TaskName "Zboun Daily DB Backup"
Get-Content F:\zboun\backups\backup.log -Tail 30
```

The task runs **every day at 10:00 PM**, writes to `F:\zboun\backups\`, and keeps only the last month of `zboun_backup_*.sql` files.

## Fast manual way

1. Open folder `F:\zboun`
2. Double-click **`backup-database.bat`**
3. Enter your Supabase database password (or use `.backup-db-password` if present)
4. Wait for **Backup completed successfully!**

## PowerShell way

```powershell
cd F:\zboun
.\backup-database.ps1
```

## Important notes

- Scripts live in `F:\zboun\` (`backup-database.bat` / `backup-database.ps1`)
- Dump files live in `F:\zboun\backups\`
- Use Session pooler URL (IPv4). Direct `db....supabase.co` may fail without IPv6.
- Keep dumps private — they contain store/customer data.
- Scheduled runs need `.backup-db-password` or `SUPABASE_DB_PASSWORD` (no interactive prompt).
