"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { Download, Share2, Smartphone } from "lucide-react";

type Props = {
  installUrl: string;
  siteName?: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function AppInstallPanel({ installUrl, siteName = "Zboun" }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [qrLoading, setQrLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installOutcome, setInstallOutcome] = useState<"accepted" | "dismissed" | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  const homeUrl = useMemo(() => {
    try {
      const url = new URL(installUrl);
      url.pathname = "/";
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return "/";
    }
  }, [installUrl]);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function generateQr() {
      try {
        setQrLoading(true);
        setQrError("");
        const value = await QRCode.toDataURL(installUrl, {
          width: 1024,
          margin: 2,
          color: { dark: "#1e1b4b", light: "#ffffff" },
        });
        if (!cancelled) setQrDataUrl(value);
      } catch {
        if (!cancelled) setQrError("Could not generate QR code.");
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    }

    generateQr();
    return () => {
      cancelled = true;
    };
  }, [installUrl]);

  useEffect(() => {
    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function triggerInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setInstallOutcome(choice.outcome);
    setDeferredPrompt(null);
  }

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "zboun-app-qr.png";
    link.click();
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-full max-w-[200px] items-center justify-center rounded-2xl bg-white px-4 shadow-md ring-1 ring-violet-100">
          <Image
            src="/Logo.svg"
            alt="Zboun"
            width={160}
            height={44}
            unoptimized
            className="h-9 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Add {siteName} to your phone</h1>
        <p className="mt-2 text-sm text-slate-600">
          Scan the QR code or follow the steps below to install the web app on your home screen.
        </p>
      </div>

      <section className="panel rounded-3xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">QR code</h2>
        <p className="mt-1 text-sm text-slate-600">
          Print this code for tables, flyers, or your storefront. Scanning opens this install page.
        </p>

        <div className="mt-4 flex justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {qrLoading ? (
              <div className="flex h-56 w-56 items-center justify-center text-sm text-slate-500 sm:h-64 sm:w-64">
                Generating QR…
              </div>
            ) : qrError ? (
              <div className="flex h-56 w-56 items-center justify-center text-sm text-red-600 sm:h-64 sm:w-64">
                {qrError}
              </div>
            ) : (
              <img
                src={qrDataUrl}
                alt={`QR code to install ${siteName}`}
                className="h-56 w-56 rounded-lg object-contain sm:h-64 sm:w-64"
              />
            )}
          </div>
        </div>

        <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-700">{installUrl}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadQr}
            disabled={!qrDataUrl || qrLoading}
            className="btn btn-success inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download QR
          </button>
          <a href={installUrl} className="btn btn-primary inline-flex items-center gap-2">
            <Smartphone className="h-4 w-4" aria-hidden />
            Open link
          </a>
        </div>
      </section>

      <section className="panel rounded-3xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">On this phone</h2>

        {deferredPrompt ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-600">
              Your browser supports one-tap install. Tap below to add {siteName} to your home screen.
            </p>
            <button type="button" onClick={triggerInstall} className="btn btn-success w-full rounded-xl">
              Install app
            </button>
          </div>
        ) : installOutcome === "accepted" ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            App installed. Open {siteName} from your home screen.
          </p>
        ) : platform === "ios" ? (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Open{" "}
              <a href={homeUrl} className="font-semibold text-violet-700 underline">
                {siteName}
              </a>{" "}
              in <strong>Safari</strong> (required on iPhone).
            </li>
            <li>
              Tap the <Share2 className="inline h-4 w-4 align-text-bottom" aria-hidden /> Share button.
            </li>
            <li>
              Choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
            </li>
          </ol>
        ) : platform === "android" ? (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Open{" "}
              <a href={homeUrl} className="font-semibold text-violet-700 underline">
                {siteName}
              </a>{" "}
              in <strong>Chrome</strong>.
            </li>
            <li>
              Tap the menu <strong>⋮</strong> (top right).
            </li>
            <li>
              Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </li>
          </ol>
        ) : (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Open this page on your phone&apos;s browser.</li>
            <li>Use your browser&apos;s menu to find <strong>Install</strong> or <strong>Add to Home Screen</strong>.</li>
          </ol>
        )}
      </section>

      <p className="text-center text-sm text-slate-500">
        <Link href="/" className="font-semibold text-violet-700 hover:underline">
          Continue to {siteName}
        </Link>
      </p>
    </div>
  );
}
