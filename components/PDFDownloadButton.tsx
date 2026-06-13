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

      // A4 dimensions in mm — full bleed (each page has its own 18mm
      // internal padding, so no extra outer margin is needed; this lets the
      // ivory paper fill the whole sheet edge-to-edge and keeps fonts crisp).
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN = 0;
      const contentW = PAGE_W - MARGIN * 2;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let i = 0; i < pageEls.length; i++) {
        const pageEl = pageEls[i];

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

        const imgData = canvasPage.toDataURL("image/png");

        // Compute image height in mm to preserve aspect ratio when drawing into PDF
        const imgHeightMm = (canvasPage.height / canvasPage.width) * contentW;

        if (i > 0) pdf.addPage();

        // Fit the captured page within the usable A4 area so nothing
        // (e.g. the bottom footer) ever overflows off the page and gets
        // clipped. If the content is taller than the usable height, scale
        // it down proportionally and centre it horizontally.
        const usableH = PAGE_H - MARGIN * 2;
        let drawW = contentW;
        let drawH = imgHeightMm;
        if (drawH > usableH) {
          const ratio = usableH / drawH;
          drawH = usableH;
          drawW = contentW * ratio;
        }
        const xPos = MARGIN + (contentW - drawW) / 2;
        const yPos = MARGIN;
        pdf.addImage(imgData, "PNG", xPos, yPos, drawW, drawH);
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
