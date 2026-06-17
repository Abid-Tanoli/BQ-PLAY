export default function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl bg-cric-card p-3 sm:p-4 shadow-sm ring-1 ring-cric-border">
      <h2 className="mb-2 sm:mb-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-cric-muted">{title}</h2>
      <dl className="space-y-1.5 sm:space-y-2">{children}</dl>
    </div>
  );
}
