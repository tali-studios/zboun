"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { ZBOUN_PRICING, formatPricingSummary, yearlySavings } from "@/lib/pricing";
import { ZBOUN_PRESENCE } from "@/lib/zboun-presence";
import {
  ZBOUN_STORE_PITCH_BENEFITS,
  ZBOUN_STORE_PITCH_FEATURES,
} from "@/lib/zboun-store-pitch";

function PitchSheet({
  siteQr,
  whatsappQr,
  logoSrc,
  iconSrc,
}: {
  siteQr: string;
  whatsappQr: string;
  logoSrc: string;
  iconSrc: string;
}) {
  const p = ZBOUN_PRESENCE;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#0f172a",
        padding: "14mm 16mm 12mm",
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ paddingBottom: 14, borderBottom: "2px solid #7c3aed" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1,
              fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
              fontWeight: 700,
              color: "#6d28d9",
              letterSpacing: "-0.04em",
            }}
          >
            Zboun
          </h1>
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconSrc}
              alt="Zboun"
              style={{
                display: "block",
                width: 64,
                height: 64,
                flexShrink: 0,
                objectFit: "contain",
              }}
            />
          ) : null}
        </div>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 15,
            lineHeight: 1.5,
            fontWeight: 500,
            color: "#475569",
            maxWidth: 400,
          }}
        >
          Your own website & online store, built for shops in Lebanon.
        </p>
      </div>

      <p
        style={{
          margin: "12px 0 6px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#7c3aed",
        }}
      >
        Why stores join
      </p>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px 14px",
        }}
      >
        {ZBOUN_STORE_PITCH_BENEFITS.map((line) => (
          <li key={line} style={{ fontSize: 11.5, lineHeight: 1.4, color: "#1e293b" }}>
            <span style={{ color: "#7c3aed", fontWeight: 800 }}>✓ </span>
            {line}
          </li>
        ))}
      </ul>

      <p
        style={{
          margin: "12px 0 6px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#7c3aed",
        }}
      >
        What you get
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 14px" }}>
        {ZBOUN_STORE_PITCH_FEATURES.map((item) => (
          <div key={item.title}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800 }}>{item.title}</p>
            <p style={{ margin: "1px 0 0", fontSize: 11, color: "#475569", lineHeight: 1.35 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 16,
          background: "#f5f3ff",
          border: "1px solid #ddd6fe",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#7c3aed",
            }}
          >
            Simple pricing
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 17, fontWeight: 800 }}>
            {formatPricingSummary()}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#475569" }}>
            Zero commission. Keep 100% of every order. Yearly saves ${yearlySavings()}. Optional
            catalog setup: ${ZBOUN_PRICING.oneTimeDataEntry} one-time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            {siteQr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siteQr} alt="" width={76} height={76} style={{ display: "block" }} />
            ) : null}
            <p style={{ margin: "4px 0 0", fontSize: 9, fontWeight: 700, color: "#64748b" }}>
              zboun.net
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            {whatsappQr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={whatsappQr} alt="" width={76} height={76} style={{ display: "block" }} />
            ) : null}
            <p style={{ margin: "4px 0 0", fontSize: 9, fontWeight: 700, color: "#64748b" }}>
              WhatsApp us
            </p>
          </div>
        </div>
      </div>

      {/* Logo fills remaining space between pricing box and footer */}
      {logoSrc ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Zboun"
            style={{
              display: "block",
              maxWidth: "62%",
              maxHeight: "28mm",
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      ) : null}

      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#7c3aed",
          }}
        >
          Talk to us
        </p>
        <div
          style={{
            marginTop: 5,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3px 14px",
            fontSize: 12,
            color: "#1e293b",
          }}
        >
          <p style={{ margin: 0 }}>🌍 Website: {p.siteHost}</p>
          <p style={{ margin: 0 }}>📱 Phone: {p.phoneDisplay}</p>
          <p style={{ margin: 0 }}>💬 WhatsApp: {p.whatsappQrHost}</p>
          <p style={{ margin: 0 }}>📷 Instagram: {p.instagramHost}</p>
          <p style={{ margin: 0 }}>🎵 TikTok: {p.tiktokHost}</p>
          <p style={{ margin: 0 }}>▶️ YouTube: {p.youtubeHost}</p>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#64748b" }}>
          Scan a QR, call, or message — we can have your store page live quickly.
        </p>
      </div>
    </div>
  );
}

export function ZbounStoreVisitKit() {
  const [siteQr, setSiteQr] = useState("");
  const [whatsappQr, setWhatsappQr] = useState("");
  const [logoSrc, setLogoSrc] = useState("");
  const [iconSrc, setIconSrc] = useState("");
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function make() {
      function fetchAsDataUrl(path: string) {
        return fetch(path)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
              }),
          )
          .catch(() => "");
      }
      const [site, wa, logo, icon] = await Promise.all([
        QRCode.toDataURL(ZBOUN_PRESENCE.siteUrl, {
          width: 360,
          margin: 1,
          color: { dark: "#4c1d95", light: "#ffffff" },
        }),
        QRCode.toDataURL(ZBOUN_PRESENCE.whatsappQrUrl, {
          width: 360,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        }),
        fetchAsDataUrl("/zbounbanner-transparent.png"),
        fetchAsDataUrl("/zbounlogo-transparent.png"),
      ]);
      if (!cancelled) {
        setSiteQr(site);
        setWhatsappQr(wa);
        setLogoSrc(logo);
        setIconSrc(icon);
      }
    }
    void make();
    return () => {
      cancelled = true;
    };
  }, []);

  async function downloadPdf() {
    if (!exportRef.current) return;
    try {
      setExporting(true);
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      pdf.save("zboun-store-visit-kit.pdf");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <header className="print:hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm sm:rounded-3xl">
        <div className="bg-gradient-to-r from-white via-white to-violet-50/70 px-4 py-3.5 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-600">
                Platform control
              </p>
              <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-2xl md:text-[1.75rem]">
                Store visit kit
              </h1>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                One-page pitch sheet for store visits — download and leave a copy.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={!siteQr || !logoSrc || exporting}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition hover:bg-violet-700 disabled:opacity-60 sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden />
              {exporting ? "Preparing…" : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      <div className="flyer-a4 mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:w-[210mm] print:rounded-none print:border-0 print:shadow-none">
        <PitchSheet siteQr={siteQr} whatsappQr={whatsappQr} logoSrc={logoSrc} iconSrc={iconSrc} />
      </div>

      <div className="flyer-export-canvas pointer-events-none fixed -left-[9999px] top-0 print:hidden">
        <div ref={exportRef} style={{ width: "210mm", height: "297mm", background: "#fff" }}>
          <PitchSheet siteQr={siteQr} whatsappQr={whatsappQr} logoSrc={logoSrc} iconSrc={iconSrc} />
        </div>
      </div>
    </>
  );
}
