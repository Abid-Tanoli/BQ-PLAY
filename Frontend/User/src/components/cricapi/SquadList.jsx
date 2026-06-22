import React from "react";

export default function SquadList({ squads = [] }) {
  if (!squads.length) {
    return <p className="rounded-2xl bg-cric-card p-8 text-center text-sm font-bold text-cric-muted ring-1 ring-cric-border">Squads are not available for this match.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {squads.map((squad) => (
        <div key={squad.teamName} className="overflow-hidden rounded-2xl bg-cric-card shadow-sm ring-1 ring-cric-border">
          <div className="bg-cric-accent px-4 py-3 text-white">
            <h3 className="text-sm font-black uppercase tracking-wide">{squad.teamName}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-cric-accent">{squad.players.length} players</p>
          </div>
          <div className="divide-y divide-cric-border">
            {squad.players.map((player, index) => (
              <div key={player.id || player.name || index} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cric-bg text-[11px] font-black text-cric-muted">{index + 1}</span>
                  <span className="text-sm font-black text-cric-text">{player.name}</span>
                </div>
                {player.role && <span className="text-[10px] font-bold uppercase text-cric-muted">{player.role}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
