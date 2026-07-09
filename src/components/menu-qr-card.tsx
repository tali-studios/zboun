"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toAbsoluteStoreUrl } from "@/lib/restaurant-menu-urls";

type Props = {
  menuUrl: string;
  restaurantName: string;
  title: string;
  description: string;
  /** Filename suffix, e.g. "menu-qr" or "in-store-menu-qr" */
  downloadSuffix?: string;
  variant?: "order" | "in-store";
  badgeLabel?: string;
  openLinkLabel?: string;
};

export function MenuQrCard({
  menuUrl,
  restaurantName,
  title,
  description,
  downloadSuffix = "menu-qr",
  variant = "order",
  badgeLabel,
  openLinkLabel = "Open store",
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isInStore = variant === "in-store";
  const badge = badgeLabel ?? (isInStore ? "In-store" : "Online order");
  const displayUrl = menuUrl.replace(/^https?:\/\//i, "");
  const openHref = toAbsoluteStoreUrl(menuUrl);

  async function generateQr() {
    try {
      setIsLoading(true);
      setError("");
      // Encode the same host-only link shown under the QR (no https://).
      const value = await QRCode.toDataURL(displayUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
      setQrDataUrl(value);
    } catch {
      setError("Failed to generate QR code.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    generateQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayUrl]);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${downloadSuffix}.png`;
    link.click();
  }

  return (
    <section
      className={`panel rounded-3xl p-6 ${
        isInStore ? "ring-2 ring-violet-100" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isInStore
              ? "bg-violet-100 text-violet-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {badge}
        </span>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {isLoading ? (
            <div className="flex h-64 w-64 items-center justify-center text-sm text-slate-500">
              Generating QR...
            </div>
          ) : error ? (
            <div className="flex h-64 w-64 items-center justify-center text-sm text-red-600">
              {error}
            </div>
          ) : (
            <img src={qrDataUrl} alt={title} className="h-64 w-64 rounded-lg object-contain" />
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 break-all">{displayUrl}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadQr}
            disabled={!qrDataUrl || isLoading}
            className="btn btn-success disabled:opacity-60"
          >
            Download QR
          </button>
          <a href={openHref} target="_blank" rel="noreferrer" className="btn btn-primary">
            {openLinkLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
