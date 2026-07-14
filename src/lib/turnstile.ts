/** Cloudflare Turnstile server-side verification. */

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; error: "captcha_failed" | "captcha_unavailable" | "captcha_missing" };

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

function turnstileConfigured() {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
}

/**
 * Verify a Turnstile token from form data (`cf-turnstile-response` or `turnstile_token`).
 * When keys are not configured, allows requests outside production so local/dev still works.
 */
export async function requireTurnstile(formData: FormData): Promise<TurnstileVerifyResult> {
  if (!turnstileConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "captcha_unavailable" };
    }
    return { ok: true };
  }

  const token = String(
    formData.get("cf-turnstile-response") ?? formData.get("turnstile_token") ?? "",
  ).trim();

  if (!token) {
    return { ok: false, error: "captcha_missing" };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY!.trim();

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    const data = (await res.json()) as SiteverifyResponse;
    if (!data.success) {
      return { ok: false, error: "captcha_failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "captcha_failed" };
  }
}

export function turnstileSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
}
