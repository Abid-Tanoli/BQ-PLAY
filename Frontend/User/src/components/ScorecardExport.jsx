import { useRef, useState } from "react";
import { toPng } from "html-to-image";

const ScorecardExport = ({ targetRef, filename }) => {
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (!targetRef?.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(targetRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = filename || "scorecard.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export scorecard:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={exporting}
      className="text-xs font-bold text-cric-muted hover:text-cric-accent px-2 py-1 rounded-lg border border-cric-border hover:border-cric-accent/50 transition disabled:opacity-50"
    >
      {exporting ? "Exporting..." : "Download Image"}
    </button>
  );
};

export default ScorecardExport;
