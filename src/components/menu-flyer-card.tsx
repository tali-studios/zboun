"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download, FileDown, Printer } from "lucide-react";
import QRCode from "qrcode";
import { resolveMenuTheme, type MenuTheme } from "@/lib/menu-theme";

type Props = {
  menuUrl: string;
  restaurantName: string;
  logoUrl: string | null;
  themeColor?: string | null;
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── The actual flyer design ──────────────────────────────────────────────────
// All colours via inline styles so they survive @media print + html-to-image.
// px=false  → Tailwind classes drive responsive sizing  (screen preview)
// px=true   → everything in hard pixels                 (export canvas 794×1123)

interface DesignProps {
  restaurantName: string;
  logoUrl: string | null;
  menuUrl: string;
  qrDataUrl: string;
  isLoading: boolean;
  theme: MenuTheme;
  px?: boolean;
}

function FlyerDesign({ restaurantName, logoUrl, menuUrl, qrDataUrl, isLoading, theme, px }: DesignProps) {
  const gradient = `radial-gradient(ellipse 140% 70% at 80% -10%, ${rgba(theme.accent, 1)} 0%, ${theme.primary} 42%, ${theme.deep} 100%)`;

  // Initials fallback when no logo
  const initials = restaurantName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Sizes ─ px mode uses absolute pixels, screen mode uses Tailwind on the elements
  const S = {
    logoBox:     px ? 108  : undefined,
    logoFont:    px ? 40   : undefined,
    h1:          px ? 38   : undefined,
    tagFont:     px ? 14   : undefined,
    cardRadius:  px ? 28   : undefined,
    cardPad:     px ? 36   : undefined,
    qrSize:      px ? 330  : undefined,
    dividerMt:   px ? 22   : undefined,
    instFont:    px ? 15   : undefined,
    urlFont:     px ? 11   : undefined,
    brandH:      px ? 30   : undefined,
    brandFont:   px ? 11   : undefined,
    outerPad:    px ? 52   : undefined,
    innerGap:    px ? 28   : undefined,
    footerMt:    px ? 28   : undefined,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: gradient,
        fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: S.outerPad,
        boxSizing: "border-box",
        gap: S.innerGap,
      }}
      className={px ? "" : "flyer-outer"}
    >
      {/* ── Decorative background rings ─────────────────────────────────────── */}
      <svg
        viewBox="0 0 420 420"
        style={{ position: "absolute", top: -80, right: -80, width: px ? 340 : undefined, height: px ? 340 : undefined, pointerEvents: "none", opacity: 0.13 }}
        className={px ? "" : "flyer-deco-ring"}
        aria-hidden
      >
        <circle cx="210" cy="210" r="170" fill="none" stroke="white" strokeWidth="60" />
      </svg>
      <svg
        viewBox="0 0 260 260"
        style={{ position: "absolute", bottom: px ? 110 : undefined, left: -50, width: px ? 200 : undefined, height: px ? 200 : undefined, pointerEvents: "none", opacity: 0.08 }}
        className={px ? "" : "flyer-deco-blob"}
        aria-hidden
      >
        <circle cx="130" cy="130" r="130" fill="white" />
      </svg>
      {/* Tiny dot cluster top-left */}
      <svg
        viewBox="0 0 80 80"
        style={{ position: "absolute", top: px ? 60 : undefined, left: px ? 60 : undefined, width: px ? 70 : undefined, height: px ? 70 : undefined, pointerEvents: "none", opacity: 0.18 }}
        className={px ? "" : "flyer-deco-dots"}
        aria-hidden
      >
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
          <circle key={`${row}-${col}`} cx={col * 22 + 5} cy={row * 22 + 5} r="3.5" fill="white" />
        )))}
      </svg>

      {/* ── Store identity (above the card) ─────────────────────────────────── */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: px ? 14 : undefined, position: "relative", zIndex: 1, textAlign: "center" }}
        className={px ? "" : "flyer-identity"}
      >
        {/* Logo */}
        <div
          style={{
            width: S.logoBox,
            height: S.logoBox,
            borderRadius: px ? 22 : undefined,
            background: "#fff",
            boxShadow: `0 8px 40px rgba(0,0,0,0.28), 0 0 0 3px ${rgba("#fff", 0.25)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
          className={px ? "" : "flyer-logo-box"}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={restaurantName}
              style={{ width: "80%", height: "80%", objectFit: "contain" }}
            />
          ) : (
            <span
              style={{
                color: theme.primary,
                fontWeight: 800,
                fontSize: S.logoFont,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
              className={px ? "" : "flyer-logo-initials"}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Store name */}
        <h1
          style={{
            margin: 0,
            color: "#fff",
            fontWeight: 800,
            lineHeight: 1.12,
            fontSize: S.h1,
            textShadow: "0 2px 12px rgba(0,0,0,0.22)",
            wordBreak: "break-word",
            maxWidth: px ? 560 : undefined,
          }}
          className={px ? "" : "flyer-store-name"}
        >
          {restaurantName}
        </h1>

        {/* Scan pill tag */}
        <div
          style={{
            background: rgba("#fff", 0.18),
            border: `1px solid ${rgba("#fff", 0.35)}`,
            borderRadius: 999,
            padding: px ? "6px 18px" : undefined,
            display: "inline-flex",
            alignItems: "center",
            gap: px ? 7 : undefined,
          }}
          className={px ? "" : "flyer-tag"}
        >
          {/* Camera icon */}
          <svg width={px ? 15 : 14} height={px ? 15 : 14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span
            style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600, fontSize: S.tagFont, letterSpacing: "0.02em" }}
            className={px ? "" : "flyer-tag-text"}
          >
            Scan to Order
          </span>
        </div>
      </div>

      {/* ── White QR card ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: S.cardRadius,
          boxShadow: `0 24px 80px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.08)`,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: px ? 520 : undefined,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        className={px ? "" : "flyer-card"}
      >
        {/* QR area */}
        <div
          style={{
            padding: S.cardPad,
            paddingTop: px ? 28 : undefined,
            paddingBottom: px ? 24 : undefined,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
          }}
          className={px ? "" : "flyer-card-body"}
        >
          {isLoading ? (
            <div
              style={{ width: S.qrSize, height: S.qrSize, display: "flex", alignItems: "center", justifyContent: "center", color: theme.softText, fontSize: 14 }}
              className={px ? "" : "flyer-qr-placeholder"}
            >
              Generating…
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code"
              style={{ width: S.qrSize, height: S.qrSize, display: "block", objectFit: "contain" }}
              className={px ? "" : "flyer-qr-img"}
            />
          )}

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              background: theme.softBorder,
              marginTop: S.dividerMt,
              marginBottom: S.dividerMt,
              opacity: 0.7,
            }}
            className={px ? "" : "flyer-card-divider"}
          />

          {/* Instruction */}
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: S.instFont,
              color: "#374151",
              textAlign: "center",
            }}
            className={px ? "" : "flyer-inst"}
          >
            Point your camera at the QR code
          </p>

          {/* URL */}
          <p
            style={{
              margin: px ? "8px 0 0" : "0",
              fontSize: S.urlFont,
              color: "#9ca3af",
              textAlign: "center",
              wordBreak: "break-all",
            }}
            className={px ? "" : "flyer-url"}
          >
            {menuUrl}
          </p>
        </div>
      </div>

      {/* ── Zboun brand footer ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: px ? 5 : undefined,
          position: "relative",
          zIndex: 1,
          marginTop: S.footerMt,
        }}
        className={px ? "" : "flyer-brand"}
      >
        {/* Frosted pill keeps the logo on white so it renders correctly */}
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: 999,
            padding: px ? "6px 18px" : undefined,
            display: "inline-flex",
            alignItems: "center",
            gap: px ? 8 : undefined,
            boxShadow: "0 2px 12px rgba(0,0,0,0.14)",
          }}
          className={px ? "" : "flyer-brand-pill"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.svg?v=3"
            alt="Zboun"
            style={{ height: S.brandH, width: "auto", objectFit: "contain" }}
            className={px ? "" : "flyer-brand-logo"}
          />
          <p
            style={{
              margin: 0,
              color: theme.primary,
              fontWeight: 700,
              fontSize: S.brandFont,
              letterSpacing: "0.04em",
            }}
            className={px ? "" : "flyer-brand-text"}
          >
            Powered by Zboun
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main exported card ───────────────────────────────────────────────────────

export function MenuFlyerCard({ menuUrl, restaurantName, logoUrl, themeColor }: Props) {
  const theme = resolveMenuTheme(themeColor);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function makeQr() {
      try {
        const value = await QRCode.toDataURL(menuUrl, {
          width: 1400,
          margin: 2,
          color: { dark: theme.deep, light: "#ffffff" },
        });
        setQrDataUrl(value);
      } finally {
        setIsLoading(false);
      }
    }
    makeQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuUrl, theme.deep]);

  async function downloadFlyerAsPng() {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-flyer.png`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  }

  async function downloadFlyerAsPdf() {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      pdf.save(`${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-flyer.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  const designProps = { restaurantName, logoUrl, menuUrl, qrDataUrl, isLoading, theme };

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto mb-4 w-full max-w-full print:hidden lg:w-[210mm]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-400/25 transition hover:bg-violet-700"
          >
            <Printer className="h-4 w-4 shrink-0" aria-hidden />
            Print A4 flyer
          </button>
          <button
            type="button"
            onClick={downloadFlyerAsPng}
            disabled={isLoading || isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-400/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            {isExporting ? "Preparing…" : "Download PNG"}
          </button>
          <button
            type="button"
            onClick={downloadFlyerAsPdf}
            disabled={isLoading || isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-amber-400/25 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileDown className="h-4 w-4 shrink-0" aria-hidden />
            {isExporting ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* ── Screen + print flyer ────────────────────────────────────────────── */}
      <div className="flyer-a4 mx-auto w-full overflow-hidden rounded-2xl shadow-2xl lg:w-[210mm] print:rounded-none print:shadow-none">
        <FlyerDesign {...designProps} />
      </div>

      {/* ── Hidden export canvas (PNG / PDF) — never printed ────────────────── */}
      <div className="flyer-export-canvas pointer-events-none fixed -left-[9999px] top-0 print:hidden">
        <div ref={exportRef} style={{ width: 794, height: 1123 }}>
          <FlyerDesign {...designProps} px />
        </div>
      </div>
    </>
  );
}
