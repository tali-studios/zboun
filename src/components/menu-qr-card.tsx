"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  menuUrl: string;
  restaurantName: string;
};

export function MenuQrCard({ menuUrl, restaurantName }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function generateQr() {
    try {
      setIsLoading(true);
      setError("");
      const value = await QRCode.toDataURL(menuUrl, {
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
  }, [menuUrl]);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-menu-qr.png`;
    link.click();
  }

  return (
    <section className="panel mx-auto max-w-xl rounded-3xl p-6">
      <h2 className="text-xl font-bold text-slate-900">Menu QR code</h2>
      <p className="mt-1 text-sm text-slate-600">
        Customers can scan this QR code to open your menu instantly.
      </p>

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
            <img src={qrDataUrl} alt="Menu QR code" className="h-64 w-64 rounded-lg object-contain" />
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 break-all">{menuUrl}</p>
        <div className="flex flex-wrap gap-2">
          {/* <button type="button" onClick={generateQr} className="btn btn-secondary">
            Regenerate
          </button> */}
          <button
            type="button"
            onClick={downloadQr}
            disabled={!qrDataUrl || isLoading}
            className="btn btn-success disabled:opacity-60"
          >
            Download QR
          </button>
          <a href={menuUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
            Open menu
          </a>
        </div>
      </div>
    </section>
  );
}
