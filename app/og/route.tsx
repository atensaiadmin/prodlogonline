import { ImageResponse } from "next/og";

export const runtime = "edge";

// ImageResponse options (do not export route-unsupported fields like `size` or `contentType`)
const OG_SIZE = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "prodlog — the progress log for solo founders";
  const description = searchParams.get("description") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)",
          position: "relative",
          color: "#fff",
          fontFamily: "Inter, ui-sans-serif, system-ui, Arial, Helvetica, sans-serif",
        }}
      >
        {/* subtle pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            opacity: 0.25,
          }}
        />

        {/* badge */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            p
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>prodlog</div>
        </div>

        {/* title + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            maxWidth: 960,
            padding: "0 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: -1,
              textShadow: "0 2px 16px rgba(0,0,0,0.2)",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.4,
                fontWeight: 500,
                opacity: 0.95,
                maxWidth: 760,
                textShadow: "0 1px 8px rgba(0,0,0,0.15)",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            fontSize: 24,
            opacity: 0.95,
          }}
        >
          Track it. Build it. Share it.
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
