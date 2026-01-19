import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Scorecard from "./Scoreboard";
import Commentary from "./Commentary";
import LiveStats from "./LiveStats";
import Overs from "./Overs";
import PlayingXI from "./PlayingXI";
import PointsTable from "../pages/PointsTable";
import Scoreboard from "./Scoreboard";

/**
 * Tabs now sync with URL hash. Clicking a tab sets the hash (e.g. #scorecard)
 * and the component reads the hash to set active tab. Using anchors also
 * allows direct linking / copy-paste of a specific tab.
 */

const TABS = [
  { key: "live", label: "Live" },
  { key: "scorecard", label: "Scorecard" },
  { key: "commentary", label: "Commentary" },
  { key: "livestats", label: "Live Stats" },
  { key: "overs", label: "Overs" },
  { key: "playingxi", label: "Playing XI" },
  { key: "table", label: "Table" },
];

export default function MatchTabs({ matchId, match }) {
  const location = useLocation();
  const navigate = useNavigate();

  // derive initial tab from hash (without the leading #)
  const initialFromHash = (location.hash && location.hash.slice(1)) || "live";
  const [tab, setTab] = useState(
    TABS.find((t) => t.key === initialFromHash) ? initialFromHash : "live"
  );

  // keep tab state in sync when hash changes externally (back/forward or direct link)
  useEffect(() => {
    const h = (location.hash && location.hash.slice(1)) || "live";
    if (h && h !== tab && TABS.find((t) => t.key === h)) {
      setTab(h);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  // when user clicks a tab, update the hash (so URL reflects current tab)
  const onSelect = (key) => {
    setTab(key);
    // preserve pathname/search, only change hash
    const base = location.pathname + (location.search || "");
    navigate(`${base}#${key}`, { replace: false });
    // Also set focus for accessibility (optional)
    const el = document.getElementById(`tab-${key}`);
    if (el) el.focus();
  };

  return (
    <div>
      {/* Tabs */}
      <nav className="px-4 py-3 border-b border-gray-700">
        <ul className="flex gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <li key={t.key}>
                {/* anchor so right-click / copy link is natural */}
                <a
                  id={`tab-${t.key}`}
                  href={`#${t.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(t.key);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-md text-sm font-semibold transition-all focus:outline-none ${
                    isActive
                      ? "bg-white text-black shadow-sm border-t border-l border-r border-gray-300"
                      : "text-gray-300 hover:bg-gray-800/60"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* simple icon placeholders (small circles) */}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-red-500" : "bg-gray-500"
                    }`}
                    aria-hidden
                  />
                  <span className="uppercase tracking-wide">{t.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Content area */}
      <div className="px-4 pb-4">
        {tab === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/5 p-4 rounded-md border border-gray-700">
                <Scoreboard matchId={matchId} />
              </div>

              <div>
                <Commentary matchId={matchId} />
              </div>
            </div>

            <aside className="space-y-4">
              <div className="bg-white/5 p-4 rounded-md border border-gray-700">
                <h3 className="font-semibold text-lg mb-2">Match Info</h3>
                <p className="text-sm text-gray-300">{match?.status || "Status unknown"}</p>
                <p className="text-sm text-gray-300 mt-2">Venue: {match?.venue || "TBA"}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-md border border-gray-700">
                <h3 className="font-semibold text-lg mb-2">Playing XI</h3>
                <PlayingXI matchId={matchId} compact />
              </div>
            </aside>
          </div>
        )}

        {tab === "scorecard" && <div className="mt-4"><Scorecard matchId={matchId} /></div>}

        {tab === "commentary" && <div className="mt-4"><Commentary matchId={matchId} /></div>}

        {tab === "livestats" && <div className="mt-4"><LiveStats matchId={matchId} /></div>}

        {tab === "overs" && <div className="mt-4"><Overs matchId={matchId} /></div>}

        {tab === "playingxi" && <div className="mt-4"><PlayingXI matchId={matchId} /></div>}

        {tab === "table" && (
          <div className="bg-white/5 p-4 rounded-md border border-gray-700 mt-4">
            {match?.table ? (
              <PointsTable table={match.table} />
            ) : (
              <p className="text-gray-300">Points table / standings not available for this match.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}