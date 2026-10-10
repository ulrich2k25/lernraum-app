"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

type Props = {
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  raumToken: string;
};

const BLUE = [7, 89, 133] as const;
const DARK = [15, 23, 42] as const;
const LIGHT_BLUE = [239, 246, 255] as const;

export default function AdminRoomQrCode({
  raumBezeichnung,
  gebaeude,
  etage,
  raumToken,
}: Props) {
  const t = useTranslations("adminQr");

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkInUrl = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/check-in?roomToken=${encodeURIComponent(
            raumToken,
          )}`,
    [raumToken],
  );

  useEffect(() => {
    if (!checkInUrl) return;

    async function generateQrCode() {
      try {
        setError(null);

        const dataUrl = await QRCode.toDataURL(checkInUrl, {
          width: 600,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        setQrDataUrl(dataUrl);
      } catch {
        setError(t("createError"));
      }
    }

    void generateQrCode();
  }, [checkInUrl, t]);

  async function downloadPdf() {
    if (!qrDataUrl) return;

    try {
      setError(null);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const centerX = pageWidth / 2;

      // =====================================================
      // 1. Logo Hochschule Kaiserslautern
      // =====================================================

      const logoResponse = await fetch("/images/hs-kl-logo.png");

      if (!logoResponse.ok) {
        throw new Error("Logo konnte nicht geladen werden");
      }

      const logoBlob = await logoResponse.blob();

      const logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;

        reader.readAsDataURL(logoBlob);
      });

      // Logo mit ursprünglichem Seitenverhältnis
      pdf.addImage(logoDataUrl, "PNG", 18, 12, 63, 33);

      // =====================================================
      // 2. Raumbezeichnung
      // =====================================================

      pdf.setTextColor(...DARK);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(27);

      pdf.text(`Lernraum ${raumBezeichnung}`, centerX, 65, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99);

      pdf.text(`${gebaeude}  -  ${etage}`, centerX, 76, {
        align: "center",
      });

      // =====================================================
      // 3. QR-Code
      // =====================================================

      const qrSize = 91;

      pdf.addImage(
        qrDataUrl,
        "PNG",
        (pageWidth - qrSize) / 2,
        88,
        qrSize,
        qrSize,
      );

      pdf.setTextColor(...DARK);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);

      pdf.text("Zum Einchecken scannen", centerX, 188, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);

      pdf.text("Mit Smartphone-Kamera oder Lernraum-App", centerX, 196, {
        align: "center",
      });

      // =====================================================
      // 4. NFC-Bereich
      // =====================================================

      pdf.setFillColor(...LIGHT_BLUE);
      pdf.setDrawColor(147, 197, 253);
      pdf.setLineWidth(0.5);

      pdf.roundedRect(20, 207, 170, 48, 5, 5, "FD");

      // Smartphone-Symbol
      pdf.setDrawColor(...BLUE);
      pdf.setLineWidth(1.3);

      pdf.roundedRect(30, 218, 15, 25, 2, 2, "S");

      pdf.setLineWidth(0.5);
      pdf.line(35, 240, 40, 240);

      // NFC-Funkwellen
      pdf.setDrawColor(...BLUE);
      pdf.setLineWidth(1.2);

      pdf.line(48, 226, 51, 230);
      pdf.line(51, 230, 48, 234);

      pdf.line(51, 223, 56, 230);
      pdf.line(56, 230, 51, 237);

      pdf.line(54, 220, 61, 230);
      pdf.line(61, 230, 54, 240);

      // NFC-Texte
      pdf.setTextColor(...DARK);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);

      pdf.text("NFC nutzen", 70, 225);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      pdf.text("Smartphone hier halten", 70, 234);

      // Platz für echten NFC-Sticker
      pdf.setDrawColor(...BLUE);
      pdf.setLineWidth(0.6);

      pdf.circle(168, 231, 15, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...BLUE);

      pdf.text("NFC", 168, 233, {
        align: "center",
      });

      // =====================================================
      // 5. Footer
      // =====================================================

      pdf.setDrawColor(...BLUE);
      pdf.setLineWidth(1);
      pdf.line(88, 278, 122, 278);

      pdf.setTextColor(...DARK);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);

      pdf.text("Einchecken - einfach und schnell", centerX, 270, {
        align: "center",
      });

      // =====================================================
      // 6. PDF herunterladen
      // =====================================================

      pdf.save(`lernraum-${raumBezeichnung}-qr-nfc.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Das PDF konnte nicht erstellt werden.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          {t("title", { room: raumBezeichnung })}
        </h3>

        <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!error && !qrDataUrl && (
        <div className="py-8 text-center text-sm text-slate-500">
          {t("creating")}
        </div>
      )}

      {qrDataUrl && (
        <div className="flex flex-col items-center">
          <img
            src={qrDataUrl}
            alt={t("alt", { room: raumBezeichnung })}
            className="h-64 w-64 rounded-xl bg-white p-3 shadow-sm"
          />

          <button
            type="button"
            onClick={downloadPdf}
            className="mt-5 rounded-xl bg-[#075985] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064e73]"
          >
            {t("download")}
          </button>
        </div>
      )}
    </div>
  );
}
