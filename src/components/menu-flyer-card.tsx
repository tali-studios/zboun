"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download, FileDown, Printer } from "lucide-react";
import QRCode from "qrcode";

type Props = {
  menuUrl: string;
  restaurantName: string;
  logoUrl: string | null;
  themeColor?: string | null;
};

const FLYER_ACCENT_FALLBACK = "#C4A882";

function resolveFlyerAccent(themeColor?: string | null) {
  const value = themeColor?.trim() ?? "";
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : FLYER_ACCENT_FALLBACK;
}

interface DesignProps {
  restaurantName: string;
  logoUrl: string | null;
  menuUrl: string;
  qrDataUrl: string;
  isLoading: boolean;
  accent: string;
  px?: boolean;
}

function FlyerSparkle({
  size = 28,
  flip = false,
  accent,
}: {
  size?: number;
  flip?: boolean;
  accent: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M4 14h8" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 10l6 4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 18l6-4" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FlyerDesign({ restaurantName, logoUrl, menuUrl, qrDataUrl, isLoading, accent, px }: DesignProps) {
  const S = {
    outerPad: px ? 72 : undefined,
    logoH: px ? 120 : undefined,
    title: px ? 44 : undefined,
    scan: px ? 13 : undefined,
    qr: px ? 340 : undefined,
    qrPad: px ? 18 : undefined,
    thanks: px ? 42 : undefined,
    brand: px ? 10 : undefined,
    gap: px ? 24 : undefined,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        color: "#111827",
        padding: S.outerPad,
        boxSizing: "border-box",
        gap: S.gap,
      }}
      className={px ? "" : "flyer-outer"}
    >
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        className={px ? "" : "flyer-top"}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            style={{
              height: S.logoH,
              width: "auto",
              maxWidth: px ? 360 : undefined,
              objectFit: "contain",
              marginBottom: px ? 8 : undefined,
            }}
            className={px ? "" : "flyer-logo-small"}
          />
        ) : null}

        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            letterSpacing: "0.08em",
            lineHeight: 1.05,
            fontSize: S.title,
            textTransform: "uppercase",
          }}
          className={px ? "" : "flyer-title"}
        >
          {restaurantName}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: px ? 12 : undefined,
            marginTop: px ? 8 : undefined,
          }}
          className={px ? "" : "flyer-scan-row"}
        >
          <FlyerSparkle size={px ? 28 : 24} accent={accent} />
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              letterSpacing: "0.18em",
              fontSize: S.scan,
              textTransform: "uppercase",
              color: "#374151",
            }}
            className={px ? "" : "flyer-scan-text"}
          >
            Scan to view our menu
          </p>
          <FlyerSparkle size={px ? 28 : 24} flip accent={accent} />
        </div>
      </div>

      <div
        style={{
          border: `2px solid ${accent}`,
          borderRadius: px ? 16 : undefined,
          padding: S.qrPad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
        className={px ? "" : "flyer-qr-frame"}
      >
        {isLoading ? (
          <div
            style={{
              width: S.qr,
              height: S.qr,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
            className={px ? "" : "flyer-qr-placeholder"}
          >
            Generating…
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR Code"
            style={{ width: S.qr, height: S.qr, display: "block", objectFit: "contain" }}
            className={px ? "" : "flyer-qr-img"}
          />
        )}
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: px ? 16 : undefined }}
        className={px ? "" : "flyer-bottom"}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Brush Script MT', 'Segoe Script', 'Palatino Linotype', cursive",
            fontSize: S.thanks,
            color: "#111827",
            lineHeight: 1.1,
          }}
          className={px ? "" : "flyer-thanks"}
        >
          Thank You!
        </p>

        <div
          style={{ display: "flex", alignItems: "center", gap: px ? 14 : undefined, width: px ? 220 : undefined }}
          className={px ? "" : "flyer-heart-row"}
        >
          <div style={{ flex: 1, height: 1, background: accent, opacity: 0.85 }} />
          <svg
            width={px ? 20 : 18}
            height={px ? 20 : 18}
            viewBox="0 0 24 24"
            fill={accent}
            aria-hidden
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <div style={{ flex: 1, height: 1, background: accent, opacity: 0.85 }} />
        </div>

        <p
          style={{
            margin: 0,
            marginTop: px ? 8 : undefined,
            fontSize: S.brand,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9ca3af",
            fontWeight: 600,
          }}
          className={px ? "" : "flyer-brand-minimal"}
        >
          Powered by Zboun
        </p>
        <p
          style={{
            margin: 0,
            fontSize: px ? 9 : undefined,
            color: "#d1d5db",
            wordBreak: "break-all",
            maxWidth: px ? 420 : undefined,
            textAlign: "center",
          }}
          className={px ? "" : "flyer-url-minimal"}
        >
          {menuUrl}
        </p>
      </div>
    </div>
  );
}

// ─── Main exported card ───────────────────────────────────────────────────────

export function MenuFlyerCard({ menuUrl, restaurantName, logoUrl, themeColor }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const accent = resolveFlyerAccent(themeColor);

  useEffect(() => {
    async function makeQr() {
      try {
        const value = await QRCode.toDataURL(menuUrl, {
          width: 1400,
          margin: 2,
          color: { dark: "#111827", light: "#ffffff" },
        });
        setQrDataUrl(value);
      } finally {
        setIsLoading(false);
      }
    }
    makeQr();
  }, [menuUrl]);

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

  const designProps = { restaurantName, logoUrl, menuUrl, qrDataUrl, isLoading, accent };

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
      <div className="flyer-a4 mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:w-[210mm] print:rounded-none print:border-0 print:shadow-none">
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
