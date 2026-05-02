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
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = document.getElementById(elementId);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let position = 0;
        let remainingHeight = imgHeight;
        let first = true;
        while (remainingHeight > 0) {
          if (!first) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
          position += pageHeight;
          remainingHeight -= pageHeight;
          first = false;
        }
      }

      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
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
