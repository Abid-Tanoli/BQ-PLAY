export default function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2 text-xs sm:text-sm">
      <dt className="font-bold text-cric-muted uppercase tracking-widest text-[9px] sm:text-[10px] shrink-0">{label}</dt>
      <dd className="font-semibold text-cric-text text-right min-w-0 break-words">{value}</dd>
    </div>
  );
}
