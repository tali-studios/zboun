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
    <>
      <div className="mx-auto w-full max-w-full space-y-4 lg:w-[210mm] print:w-full print:max-w-none">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 print:hidden lg:w-full lg:justify-between lg:overflow-visible lg:pb-0">
        <button type="button" className="btn btn-primary shrink-0" onClick={printFlyer}>
          Print A4 flyer
        </button>
        <button
          type="button"
          className="btn btn-primary shrink-0 disabled:opacity-60"
          onClick={downloadFlyerAsPng}
          disabled={isLoading || isExporting}
        >
          {isExporting ? "Preparing..." : "Download PNG"}
        </button>
        <button
          type="button"
          className="btn btn-primary shrink-0 disabled:opacity-60"
          onClick={downloadFlyerAsPdf}
          disabled={isLoading || isExporting}
        >
          {isExporting ? "Preparing..." : "Download PDF"}
        </button>
        <a href={menuUrl} target="_blank" rel="noreferrer" className="btn btn-primary shrink-0">
          Open menu
        </a>
      </div>

      <div ref={flyerRef} className="flyer-a4 panel mx-auto w-full max-w-full bg-white p-5 text-slate-900 sm:p-10 lg:mx-0">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-8 lg:h-full lg:min-h-0 lg:justify-between">
          <div className="w-full space-y-3 sm:space-y-4">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${restaurantName} logo`}
                width={160}
                height={160}
                className="mx-auto h-28 w-28 rounded-2xl border border-slate-200 object-contain p-2 sm:h-40 sm:w-40"
                unoptimized
              />
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-700 sm:text-sm sm:tracking-[0.3em]">
              ZBOUN
            </p>
            <h2 className="break-words px-1 text-2xl font-extrabold leading-tight sm:text-4xl">{restaurantName}</h2>
            <p className="text-base text-slate-600 sm:text-lg">Scan to Order</p>
          </div>

          <div className="w-full max-w-[min(100%,20rem)] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:max-w-none sm:p-6">
            {isLoading ? (
              <div className="mx-auto flex aspect-square w-full max-w-[min(72vw,18rem)] items-center justify-center text-sm text-slate-500 sm:h-80 sm:max-w-none sm:text-base">
                Generating QR...
              </div>
            ) : (
              <img
                src={qrDataUrl}
                alt="Menu QR"
                className="mx-auto aspect-square h-auto w-full max-w-[min(72vw,18rem)] object-contain sm:h-80 sm:max-w-none"
              />
            )}
          </div>

          <div className="w-full space-y-2 px-1 sm:space-y-3">
            <p className="text-sm font-semibold sm:text-lg">Open your camera and scan the QR</p>
            <p className="mx-auto max-w-xl break-all text-xs text-slate-500 sm:text-sm">{menuUrl}</p>
          </div>
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
    </>
  );
}
