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

      // Prefer explicit `.print-page` elements; fall back to direct child divs.
      let pageEls = Array.from(element.querySelectorAll('.print-page')) as HTMLElement[];
      if (pageEls.length === 0) {
        pageEls = Array.from(element.querySelectorAll(':scope > div')) as HTMLElement[];
      }

      // A4, full bleed. The invoice already has its own inner padding.
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN = 0;
      const contentW = PAGE_W - MARGIN * 2;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      let placedAPage = false;

      for (const pageEl of pageEls) {
        // Capture each page element separately so the PDF contains distinct A4 pages
        const canvasPage = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: pageEl.scrollWidth,
          height: pageEl.scrollHeight,
          windowWidth: pageEl.scrollWidth,
          windowHeight: pageEl.scrollHeight,
        });

        // Keep the sheet full width. A taller invoice (advance rows, long
        // item lists) continues on the next page instead of shrinking, which
        // used to leave a large blank margin on both sides.
        const pxPerMm = canvasPage.width / contentW;
        const slicePx = Math.max(1, Math.floor((PAGE_H - MARGIN * 2) * pxPerMm));
        let offsetY = 0;

        while (offsetY < canvasPage.height - 1) {
          const heightPx = Math.min(slicePx, canvasPage.height - offsetY);
          const slice = document.createElement("canvas");
          slice.width = canvasPage.width;
          slice.height = heightPx;
          const ctx = slice.getContext("2d");
          if (!ctx) throw new Error("Could not prepare the PDF page.");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(
            canvasPage,
            0, offsetY, canvasPage.width, heightPx,
            0, 0, canvasPage.width, heightPx,
          );

          if (placedAPage) pdf.addPage();
          const drawH = (heightPx / canvasPage.width) * contentW;
          pdf.addImage(slice.toDataURL("image/png"), "PNG", MARGIN, MARGIN, contentW, drawH);
          placedAPage = true;
          offsetY += heightPx;
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
