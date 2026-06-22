import React from "react";

/** Wraps wide charts: full width on mobile, horizontal scroll only inside this box. */
export default function ResponsiveGraphWrap({ children, className = "" }) {
  return (
    <div className={`match-graph-wrap w-full max-w-full overflow-x-auto overflow-y-hidden rounded-xl border border-cric-border bg-cric-card p-3 sm:p-4 ${className}`}>
      <div className="min-w-0 w-full">{children}</div>
    </div>
  );
}
