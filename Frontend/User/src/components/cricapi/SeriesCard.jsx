import React from "react";
import { Link } from "react-router-dom";

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "TBC";

export default function SeriesCard({ series }) {
  return (
    <Link
      to={`/international/series/${series.id}`}
      className="group block overflow-hidden rounded-2xl bg-cric-card shadow-sm ring-1 ring-cric-border transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="bg-gradient-to-br from-cric-accent to-blue-700 p-5 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cric-accent">
          {series.category ? `${series.category} series` : "Live Series"}
        </p>
        <h3 className="mt-3 line-clamp-2 min-h-[3.5rem] text-xl font-black uppercase leading-tight group-hover:text-orange-300">
          {series.name}
        </h3>
        <p className="mt-3 text-xs font-bold text-blue-100">
          {formatDate(series.startDate)} - {formatDate(series.endDate)}
        </p>
      </div>
      <div className="grid grid-cols-4 divide-x divide-cric-border text-center">
        <Metric label="ODI" value={series.odi} />
        <Metric label="T20" value={series.t20} />
        <Metric label="Test" value={series.test} />
        <Metric label="Matches" value={series.matches || "-"} />
      </div>
    </Link>
  );
}

function Metric({ label, value }) {
  return (
    <div className="p-3">
      <p className="text-lg font-black text-cric-accent">{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-cric-muted">{label}</p>
    </div>
  );
}
