"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Share2 } from "lucide-react";
import {
  buildInstagramStoreShareCaption,
  buildWhatsAppStoreShareHref,
  buildWhatsAppStoreShareText,
} from "@/lib/store-share";

type Props = {
  storeName: string;
  displayUrl: string;
  absoluteUrl: string;
  isFoodMenu?: boolean;
  showTools?: boolean;
  compact?: boolean;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM17.5 6a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export function ShareStorePanel({
  storeName,
  displayUrl,
  absoluteUrl,
  isFoodMenu = false,
  showTools = true,
  compact = false,
}: Props) {
  const [copied, setCopied] = useState<"link" | "caption" | "whatsapp" | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const whatsappText = buildWhatsAppStoreShareText(storeName, absoluteUrl);
  const instagramCaption = buildInstagramStoreShareCaption(storeName, absoluteUrl);
  const whatsappHref = buildWhatsAppStoreShareHref(storeName, absoluteUrl);
  const noun = isFoodMenu ? "menu" : "store";

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function onCopy(kind: "link" | "caption" | "whatsapp", value: string) {
    const ok = await copyText(value);
    if (ok) setCopied(kind);
  }

  async function onNativeShare() {
    try {
      await navigator.share({
        title: storeName,
        text: `Order from ${storeName} on Zboun`,
        url: absoluteUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await onCopy("link", absoluteUrl);
    }
  }

  return (
    <section id="share-store" className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="panel-title">Share my {noun}</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            {compact
              ? `Send this ${noun} link on WhatsApp or Instagram. That's how new customers find you.`
              : `Customers find you from WhatsApp status, Instagram bio, and a QR on the counter — not by searching Zboun. Tap once, paste, done.`}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-800">
          {absoluteUrl}
        </p>
        <button
          type="button"
          onClick={() => onCopy("link", absoluteUrl)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Copy className="h-4 w-4" aria-hidden />
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <WhatsAppGlyph className="h-4 w-4" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => onCopy("caption", instagramCaption)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <InstagramGlyph className="h-4 w-4" />
          {copied === "caption" ? "Caption copied!" : "Instagram caption"}
        </button>
        <button
          type="button"
          onClick={() => onCopy("whatsapp", whatsappText)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <Copy className="h-4 w-4" aria-hidden />
          {copied === "whatsapp" ? "Copied!" : "Copy WhatsApp text"}
        </button>
        {canNativeShare ? (
          <button
            type="button"
            onClick={onNativeShare}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            More…
          </button>
        ) : (
          <span className="hidden lg:block" />
        )}
      </div>

      {!compact ? (
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">WhatsApp preview</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{whatsappText}</pre>
          <p className="mt-2 text-xs text-slate-500">Opens WhatsApp — pick Status or a chat.</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Instagram caption</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{instagramCaption}</pre>
          <p className="mt-2 text-xs text-slate-500">Paste on a post or story. Put the link in your bio.</p>
        </div>
      </div>
      ) : null}

      {showTools ? (
        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          {compact ? (
            <Link
              href="/dashboard/business/share"
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-center text-xs font-semibold text-violet-700 hover:bg-violet-100"
            >
              Share pack
            </Link>
          ) : null}
          <Link
            href="/dashboard/business/qr"
            className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            QR codes
          </Link>
          <Link
            href="/dashboard/business/flyer"
            className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Print flyer
          </Link>
        </div>
      ) : null}
    </section>
  );
}
