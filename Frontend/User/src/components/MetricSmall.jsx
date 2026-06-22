export default function MetricSmall({ label, value }) {
  return (
    <div>
      <div className="text-[9px] sm:text-[10px] font-black uppercase text-cric-muted">{label}</div>
      <div className="text-sm sm:text-base font-black tabular-nums text-cric-text">{value}</div>
    </div>
  );
}
