import { ImageResponse } from "next/og";

export const alt = "Lernraum – Finde deinen freien Lernplatz!";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F4F8FA",
        padding: "65px 75px",
        fontFamily: "Arial, sans-serif",
        color: "#123047",
      }}
    >
      {/* Logo et nom */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 25,
        }}
      >
        <div
          style={{
            width: 105,
            height: 105,
            backgroundColor: "#075985",
            borderRadius: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 55,
            fontWeight: 700,
          }}
        >
          LR
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            LERNRAUM
          </div>

          <div
            style={{
              fontSize: 21,
              color: "#64748B",
              marginTop: 5,
            }}
          >
            Deine digitale Lernplatzsuche
          </div>
        </div>
      </div>

      {/* Message principal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 67,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -2,
          }}
        >
          Finde deinen freien
        </div>

        <div
          style={{
            fontSize: 67,
            fontWeight: 700,
            color: "#075985",
            lineHeight: 1.2,
          }}
        >
          Lernplatz!
        </div>

        <div
          style={{
            fontSize: 27,
            color: "#475569",
            marginTop: 25,
          }}
        >
          Lernräume entdecken. Einfach einchecken.
        </div>
      </div>

      {/* Bas de l'image */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "2px solid #D6E4EB",
          paddingTop: 25,
        }}
      >
        <div
          style={{
            fontSize: 21,
            color: "#075985",
            fontWeight: 700,
          }}
        >
          QR-Code · NFC · Gruppen-Check-in
        </div>

        <div
          style={{
            fontSize: 19,
            color: "#64748B",
          }}
        >
          lernraum-app-dun.vercel.app
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
