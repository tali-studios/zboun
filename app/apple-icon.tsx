import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7854FF 0%, #9F3BFE 100%)",
          borderRadius: 38,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 94,
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: "Inter, Arial, sans-serif",
            letterSpacing: -3,
          }}
        >
          Z
        </div>
      </div>
    ),
    { ...size },
  );
}
