"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

type Props = {
  menuUrl: string;
  restaurantName: string;
  logoUrl: string | null;
};

export function MenuFlyerCard({ menuUrl, restaurantName, logoUrl }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function makeQr() {
      try {
        const value = await QRCode.toDataURL(menuUrl, {
          width: 1400,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        setQrDataUrl(value);
      } finally {
        setIsLoading(false);
      }
    }
    makeQr();
  }, [menuUrl]);

  function printFlyer() {
    window.print();
  }

  async function downloadFlyerAsPng() {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
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
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = 210;
      const pageHeight = 297;
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
      const renderWidth = imgProps.width * ratio;
      const renderHeight = imgProps.height * ratio;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, renderWidth, renderHeight);
      pdf.save(`${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-flyer.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button type="button" className="btn btn-primary" onClick={printFlyer}>
          Print A4 flyer
        </button>
        <button
          type="button"
          className="btn btn-success disabled:opacity-60"
          onClick={downloadFlyerAsPng}
          disabled={isLoading || isExporting}
        >
          {isExporting ? "Preparing..." : "Download PNG"}
        </button>
        <button
          type="button"
          className="btn btn-secondary disabled:opacity-60"
          onClick={downloadFlyerAsPdf}
          disabled={isLoading || isExporting}
        >
          {isExporting ? "Preparing..." : "Download PDF"}
        </button>
        <a href={menuUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
          Open menu
        </a>
      </div>

      <div ref={flyerRef} className="flyer-a4 panel mx-auto bg-white p-10 text-slate-900">
        <div className="flex h-full flex-col items-center justify-between gap-8 text-center">
          <div className="space-y-4">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${restaurantName} logo`}
                width={160}
                height={160}
                className="mx-auto h-40 w-40 rounded-2xl border border-slate-200 object-contain p-2"
                unoptimized
              />
            ) : null}
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">ZBOUN</p>
            <h2 className="text-4xl font-extrabold">{restaurantName}</h2>
            <p className="text-lg text-slate-600">Scan to Order</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {isLoading ? (
              <div className="flex h-80 w-80 items-center justify-center text-slate-500">
                Generating QR...
              </div>
            ) : (
              <img src={qrDataUrl} alt="Menu QR" className="h-80 w-80 object-contain" />
            )}
          </div>

          <div className="space-y-3">
            <p className="text-lg font-semibold">Open your camera and scan the QR</p>
            <p className="mx-auto max-w-xl text-sm text-slate-500 break-all">{menuUrl}</p>
          </div>
        </div>
      </div>

      {/* Hidden clean export canvas for perfectly centered PNG/PDF output */}
      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={exportRef} className="h-[1123px] w-[794px] bg-white p-10 text-slate-900">
          <div className="flex h-full flex-col items-center justify-between gap-8 text-center">
            <div className="space-y-4">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${restaurantName} logo`}
                  width={160}
                  height={160}
                  className="mx-auto h-40 w-40 rounded-2xl border border-slate-200 object-contain p-2"
                  unoptimized
                />
              ) : null}
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">ZBOUN</p>
              <h2 className="text-4xl font-extrabold">{restaurantName}</h2>
              <p className="text-lg text-slate-600">Scan to Order</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {isLoading ? (
                <div className="flex h-80 w-80 items-center justify-center text-slate-500">
                  Generating QR...
                </div>
              ) : (
                <img src={qrDataUrl} alt="Menu QR" className="h-80 w-80 object-contain" />
              )}
            </div>

            <div className="space-y-3">
              <p className="text-lg font-semibold">Open your camera and scan the QR</p>
              <p className="mx-auto max-w-xl text-sm text-slate-500 break-all">{menuUrl}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
