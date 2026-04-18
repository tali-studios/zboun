import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Zboun — WhatsApp restaurant ordering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 45%, #f8fafc 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#047857",
          }}
        >
          Zboun
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#0f172a",
            maxWidth: 900,
          }}
        >
          Browse menus. Order on WhatsApp.
        </div>
        <div style={{ marginTop: 20, fontSize: 28, color: "#475569", maxWidth: 820 }}>
          Digital menus for restaurants — zero commission on orders.
        </div>
      </div>
    ),
    { ...size },
  );
}
