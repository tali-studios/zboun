# Zboun QA playbook (short index)

**For the full step-by-step manual for QA testers, use:**

## → [`QA-TEAM-GUIDE.md`](./QA-TEAM-GUIDE.md)

That guide includes numbered test cases (TC-101 …), tables for every click, expected results, add-on modules, mobile/browser matrix, and bug report template.

---

## Quick start

```powershell
# 1. Automated (must pass first)
npm run test:smoke -- --base-url https://zboun.vercel.app

# 2. Manual — follow QA-TEAM-GUIDE.md in order (sections 1–11)

# 3. Optional: seed menu items after restaurant exists
npm run qa:seed-menu -- --slug your-qa-slug
```

---

## Test order (summary)

1. Smoke test (44 checks)
2. Public & contact (TC-101–105)
3. Auth (TC-201–203)
4. Super admin create + finance + renew + deactivate (TC-301–307)
5. Restaurant menu + settings (TC-401–407)
6. QR + flyer (TC-501–502)
7. Billing (TC-503)
8. Public guest order + in-store (TC-601–603)
9. Add-ons if enabled (TC-701–712)
10. Cron & emails (TC-801–802)
11. Sign-off (Section 11)

See also [`TESTING.md`](./TESTING.md) for environment checklist and SQL migrations.
