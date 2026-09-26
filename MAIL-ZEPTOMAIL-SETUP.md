# Urgent: Fix Zoho “Email Outgoing Blocked”

Your app was sending **transactional** mail (OTP, store invites, stock alerts, contracts, reminders) through **Zoho Mail** (`admin@zboun.net`). That mailbox has a low daily send limit. Exceeding it blocks all outgoing mail.

Zoho’s own advice: use **ZeptoMail** for app/notification email, not the personal mailbox.

## Do this now (today)

### 1) Unblock Zoho Mail (temporary)

Open the Zoho email → click **unblock**.  
This only restores the mailbox briefly. Keep using Zoho Mail for **human** inbox/replies; do **not** keep blasting app mail through it.

### 2) Create ZeptoMail (permanent fix)

1. Go to [https://www.zoho.com/zeptomail/](https://www.zoho.com/zeptomail/) and sign in with your Zoho org.
2. Create a **Mail Agent** for `zboun.net`.
3. Verify the domain (DNS: SPF / DKIM as ZeptoMail shows).
4. Add a verified **From** address, e.g. `notifications@zboun.net` or keep `admin@zboun.net` if Zepto allows it for that agent.
5. Open **SMTP/API** → under **API Setup** copy the **API key** (the value after `Zoho-enczapikey `).

### 3) Update environment (Vercel + `.env.local`)

Add / replace:

```env
# Prefer ZeptoMail API (app transactional mail)
# Paste only the token (or the full "Zoho-enczapikey …" string — both work)
ZEPTOMAIL_TOKEN=paste_api_key_here

# Verified sender in ZeptoMail — must include local part (not just @zboun.net)
SMTP_FROM=notifications@zboun.net
SMTP_FROM_NAME=Zboun

# Human replies still go to your inbox
SMTP_REPLY_TO=admin@zboun.net
ZBOUN_OPS_EMAIL=admin@zboun.net
```

Do **not** paste Zoho’s sample `nodemailer` snippet into the app — `src/lib/mail.ts` already sends via the API. Their sample `from: '"…" <@zboun.net>'` is invalid (missing `notifications@` / `admin@`).

You can **remove or leave unused** the old Zoho Mail SMTP password for app sends once Zepto works:

```env
# Optional fallback only — do NOT use for high volume:
# SMTP_HOST=smtp.zoho.com
# SMTP_USER=admin@zboun.net
# SMTP_PASS=...
```

Redeploy / restart the app after changing env.

### 4) Smoke test

```bash
node scripts/test-smtp.mjs your-personal-email@gmail.com
```

(After Zepto is configured, the app’s `sendMail` uses the ZeptoMail API automatically when `ZEPTOMAIL_TOKEN` is set.)

## What the code does now

- If `ZEPTOMAIL_TOKEN` (or `ZEPTOMAIL_SEND_MAIL_TOKEN`) is set → send via **ZeptoMail HTTP API**.
- Otherwise → fall back to SMTP (`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`).

That keeps invites, OTPs, stock alerts, and contract PDFs off the blocked Zoho Mail quota.

## Optional ZeptoMail SMTP (instead of API)

If you prefer SMTP relay instead of the API token:

```env
SMTP_HOST=smtp.zeptomail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=emailapikey
SMTP_PASS=your_send_mail_token
SMTP_FROM=notifications@zboun.net
SMTP_REPLY_TO=admin@zboun.net
```

(Leave `ZEPTOMAIL_TOKEN` unset if you only want SMTP.)

## After you’re stable

- Keep `admin@zboun.net` for reading mail and replies.
- All **automated** Zboun mail should go through ZeptoMail only.
