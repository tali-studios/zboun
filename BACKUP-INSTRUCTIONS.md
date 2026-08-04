# How to backup the Zboun database (Windows)

All SQL dump files are saved to:

```text
F:\zboun\backups\
```

Example: `F:\zboun\backups\zboun_backup_20260804_141500.sql`

## Fast way (recommended)

1. Open folder `F:\zboun` (project root — not the backups folder)
2. Double-click **`backup-database.bat`**
3. Enter your Supabase database password
4. Wait for **Backup completed successfully!**
5. Open `F:\zboun\backups\` and copy the new `.sql` file somewhere safe

## PowerShell way

```powershell
cd F:\zboun
.\backup-database.ps1
```

## Manual pg_dump (also saves under backups/)

```powershell
cd F:\zboun

& "F:\Program Files\PostgreSQL\18\bin\pg_dump.exe" "postgresql://postgres.tbnfrqftpocihuzvlttm:YOUR_PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require" -f "F:\zboun\backups\zboun_backup_$(Get-Date -Format 'yyyyMMdd').sql"
```

Note the path: **`F:\zboun\backups\...`** — not `F:\zboun\...`

## Important notes

- Scripts live in `F:\zboun\` (`backup-database.bat` / `backup-database.ps1`)
- Dump files live in `F:\zboun\backups\`
- Use Session pooler URL (IPv4). Direct `db....supabase.co` may fail without IPv6.
- Keep dumps private — they contain store/customer data.
