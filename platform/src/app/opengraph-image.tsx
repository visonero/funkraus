import { ImageResponse } from "next/og";

export const alt = "funkraus — BZF I & II Online-Kurs für dein Sprechfunkzeugnis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c7fd0 0%, #2f9bea 55%, #22d3ee 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: "10px solid rgba(255,255,255,0.18)",
            top: -140,
            right: -140,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: "8px solid rgba(255,255,255,0.14)",
            bottom: -120,
            left: -100,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            📻
          </div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "white", letterSpacing: -1.5 }}>
            funkraus
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(255,255,255,0.94)",
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          BZF I &amp; II Online-Kurs für dein Sprechfunkzeugnis
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.78)",
          }}
        >
          Offizieller Fragenkatalog · Audio-Training · Prüfungssimulation
        </div>
      </div>
    ),
    { ...size },
  );
}
