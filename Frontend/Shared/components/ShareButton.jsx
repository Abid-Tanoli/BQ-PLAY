import { useState } from "react";

const ShareButton = ({ url, title, text, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    if (onShare) {
      onShare();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: title || document.title, text: text || "", url: shareUrl });
      } catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      className={`text-xs font-bold px-2 py-1 rounded-lg border transition ${
        copied
          ? "bg-green-500 text-white border-green-500"
          : "text-cric-muted hover:text-cric-accent border-cric-border hover:border-cric-accent/50"
      }`}
      title="Share"
    >
      {copied ? "Copied!" : "Share"}
    </button>
  );
};

export default ShareButton;
