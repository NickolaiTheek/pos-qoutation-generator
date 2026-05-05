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

      // Collect all CSS from the document stylesheets
      let css = "";
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          css += Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
        } catch {
          // cross-origin sheets — skip
        }
      }

      const html = element.outerHTML;

      const win = window.open("", "_blank", "width=900,height=700");
      if (!win) {
        alert("Please allow popups for this site to download the PDF.");
        return;
      }

      win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    ${css}
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { size: A4; margin: 0; }
    body { margin: 0; background: white; }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
        setTimeout(function () { window.close(); }, 1000);
      }, 600);
    };
  </script>
</body>
</html>`);
      win.document.close();
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please use the Print button instead.");
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
