import React from "react";

export default function MatchList({ matches, selected, onSelect }) {
  if (!matches || !Array.isArray(matches)) return null; 

  return (
    <ul className="space-y-2">
      {matches.map((match) => (
        <li
          key={match._id}
          onClick={() => onSelect(match)}
          className={`p-2 rounded cursor-pointer ${
            selected?._id === match._id ? "bg-blue-600" : "bg-slate-800"
          }`}
        >
          {match.name || `Match ${match._id}`}
        </li>
      ))}
    </ul>
  );
}
