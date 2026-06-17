const PDFReport = ({ match, label }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const team1 = match.teams?.[0];
    const team2 = match.teams?.[1];
    const inns = match.innings || [];

    const renderInnings = (inn, idx) => {
      if (!inn) return "";
      return `
        <div style="margin-bottom: 24px; page-break-inside: avoid;">
          <h2 style="background: #031d44; color: white; padding: 12px 16px; margin: 0; font-size: 16px; border-radius: 4px;">
            ${team1?._id === inn.team?._id || team1?._id === inn.team ? team1?.name : team2?.name || "Team"} - Innings ${idx + 1}
            (${inn.runs}/${inn.wickets}, ${inn.overs}.${inn.balls % 6} ov)
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 8px; border: 1px solid #ddd;">Batter</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">R</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">B</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">4s</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">6s</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">SR</th>
              </tr>
            </thead>
            <tbody>
              ${(inn.batting || []).map(b => `
                <tr>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: 600;">${b.player?.name || "Unknown"}</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.runs}</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.balls || "-"}</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.fours || 0}</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.sixes || 0}</td>
                  <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <h3 style="margin-top: 12px; font-size: 13px;">Bowling</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 8px; border: 1px solid #ddd;">Bowler</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">O</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">M</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">R</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">W</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Econ</th>
              </tr>
            </thead>
            <tbody>
              ${(inn.bowling || []).map(b => {
                const overs = `${Math.floor((b.balls || 0) / 6)}.${(b.balls || 0) % 6}`;
                return `
                  <tr>
                    <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: 600;">${b.player?.name || "Unknown"}</td>
                    <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${overs}</td>
                    <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.maidens || 0}</td>
                    <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.runs}</td>
                    <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${b.wickets}</td>
                    <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: center;">${((b.runs || 0) / ((b.balls || 0) / 6 || 1)).toFixed(2)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>Match Report - ${match.title || "Match"}</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.5; }
            h1 { font-size: 24px; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #031d44; padding-bottom: 16px; margin-bottom: 24px; }
            .result { background: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 4px; text-align: center; margin-bottom: 24px; }
            .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${match.title || "Match Report"}</h1>
            <p style="color: #64748b; margin-top: 4px;">${match.venue || ""} | ${match.matchType || ""} | ${match.startAt ? new Date(match.startAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }) : ""}</p>
          </div>
          ${match.result ? `<div class="result"><strong>Result:</strong> ${match.result.description}</div>` : ""}
          ${inns.map((inn, idx) => renderInnings(inn, idx)).join("<hr style='margin: 24px 0; border: none; border-top: 1px solid #ddd;'>")}
          ${match.manOfMatch ? `<div style="margin-top: 24px; text-align: center;"><strong>Player of the Match:</strong> ${match.manOfMatch.name || ""}</div>` : ""}
          <div class="footer">Generated by BQ-PLAY | ${new Date().toLocaleDateString("en-GB")}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <button
      onClick={handlePrint}
      className="text-xs font-bold text-cric-muted hover:text-cric-accent px-2 py-1 rounded-lg border border-cric-border hover:border-cric-accent/50 transition flex items-center gap-1.5"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      {label || "PDF Report"}
    </button>
  );
};

export default PDFReport;
