"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Copy, Download, Printer } from "lucide-react";
import { ZBOUN_PRICING, formatPricingSummary, yearlySavings } from "@/lib/pricing";
import { ZBOUN_PRESENCE } from "@/lib/zboun-presence";
import {
  ZBOUN_STORE_PITCH_BENEFITS,
  ZBOUN_STORE_PITCH_FEATURES,
  buildStoreVisitWhatsAppHref,
  buildStoreVisitWhatsAppMessage,
} from "@/lib/zboun-store-pitch";

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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');`}</style>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: "2px solid #7c3aed",
          paddingBottom: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: "4px 0 0",
              fontSize: 38,
              lineHeight: 1.05,
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            Zboun
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#475569", maxWidth: 360 }}>
            Your own website & online store, built for shops in Lebanon.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconSrc}
              alt="Zboun"
              style={{ display: "block", width: 72, height: 72, objectFit: "contain" }}
            />
          ) : null}
        </div>
      </div>

      <p
        style={{
          margin: "10px 0 5px",
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
          gap: "3px 14px",
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
          margin: "10px 0 5px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#7c3aed",
        }}
      >
        What you get
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px" }}>
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
          marginTop: 20,
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

      {logoSrc ? (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Zboun"
            style={{
              display: "block",
              width: "90%",
              maxHeight: "64mm",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      ) : null}

      <div style={{ marginTop: "auto", paddingTop: 8 }}>
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
  const [copied, setCopied] = useState<"message" | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const message = buildStoreVisitWhatsAppMessage();
  const whatsappHref = buildStoreVisitWhatsAppHref();

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
        fetchAsDataUrl("/zbounbanner.png"),
        fetchAsDataUrl("/zbounlogo.png"),
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

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

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
      <div className="print:hidden mx-auto mb-4 w-full max-w-full lg:w-[210mm]">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print A4
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={!siteQr || !logoSrc || exporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden />
            {exporting ? "Preparing…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (await copyText(message)) setCopied("message");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-4 py-3 text-sm font-semibold text-white hover:brightness-95"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copied === "message" ? "Copied!" : "Copy WhatsApp"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-95"
          >
            Send on WhatsApp
          </a>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Print a copy to leave at the shop, or send the WhatsApp text after you walk out.
        </p>
      </div>

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
