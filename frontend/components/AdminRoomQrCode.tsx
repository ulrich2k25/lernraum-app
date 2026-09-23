"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

type AdminRoomQrCodeProps = {
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  raumToken: string;
};

export default function AdminRoomQrCode({
  raumBezeichnung,
  gebaeude,
  etage,
  raumToken,
}: AdminRoomQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkInUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/check-in?roomToken=${encodeURIComponent(
      raumToken,
    )}`;
  }, [raumToken]);

  useEffect(() => {
    if (!checkInUrl) {
      return;
    }

    async function generateQrCode() {
      try {
        setError(null);

        const dataUrl = await QRCode.toDataURL(checkInUrl, {
          width: 360,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        setQrDataUrl(dataUrl);
      } catch {
        setError("Der QR-Code konnte nicht erstellt werden.");
      }
    }

    void generateQrCode();
  }, [checkInUrl]);

  function downloadPdf() {
    if (!qrDataUrl) {
      return;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.text(`Lernraum ${raumBezeichnung}`, 105, 40, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.text(`${gebaeude} · ${etage}`, 105, 52, {
      align: "center",
    });

    pdf.addImage(qrDataUrl, "PNG", 50, 72, 110, 110);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text("Zum Einchecken scannen", 105, 202, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text("Mit Smartphone-Kamera oder Lernraum-App", 105, 213, {
      align: "center",
    });

    pdf.save(`lernraum-${raumBezeichnung}-qr-code.pdf`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          QR-Code für {raumBezeichnung}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Direkt zum Check-in für diesen Lernraum.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!error && !qrDataUrl && (
        <div className="py-8 text-center text-sm text-slate-500">
          QR-Code wird erstellt ...
        </div>
      )}

      {qrDataUrl && (
        <div className="flex flex-col items-center">
          <img
            src={qrDataUrl}
            alt={`QR-Code für Lernraum ${raumBezeichnung}`}
            className="h-64 w-64 rounded-xl bg-white p-3 shadow-sm"
          />

          <button
            type="button"
            onClick={downloadPdf}
            className="mt-5 rounded-xl bg-[#075985] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064e73]"
          >
            PDF herunterladen
          </button>
        </div>
      )}
    </div>
  );
}
