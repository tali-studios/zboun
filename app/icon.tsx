import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 108,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 270,
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: "Inter, Arial, sans-serif",
            letterSpacing: -8,
          }}
        >
          Z
        </div>
      </div>
    ),
    { ...size },
  );
}
