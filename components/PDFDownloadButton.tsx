"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface PDFDownloadButtonProps {
  elementId: string;
  filename: string;
  label?: string;
}

export default function PDFDownloadButton({ elementId, filename, label = "Download PDF" }: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        alert("Could not find the document element.");
        return;
      }

      // html2canvas exports itself directly (CJS default), not as .default
      const h2cMod = await import("html2canvas");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas: (el: HTMLElement, opts?: any) => Promise<HTMLCanvasElement> =
        (h2cMod as any).default ?? (h2cMod as any);

      // jsPDF v4 uses named export
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 dimensions in mm with 10mm margins
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN = 10;
      const contentW = PAGE_W - MARGIN * 2;

      // Scale image to fit content width
      const imgHeightMm = (canvas.height / canvas.width) * contentW;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const usableH = PAGE_H - MARGIN * 2;

      if (imgHeightMm <= usableH) {
        // Single page
        pdf.addImage(imgData, "PNG", MARGIN, MARGIN, contentW, imgHeightMm);
      } else {
        // Multi-page: slice the canvas image across pages
        const pageCount = Math.ceil(imgHeightMm / usableH);
        for (let page = 0; page < pageCount; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = MARGIN - page * usableH;
          pdf.addImage(imgData, "PNG", MARGIN, yOffset, contentW, imgHeightMm);
        }
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("PDF generation failed. Please try the Print button instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={loading} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      {loading ? "Generating..." : label}
    </Button>
  );
}
