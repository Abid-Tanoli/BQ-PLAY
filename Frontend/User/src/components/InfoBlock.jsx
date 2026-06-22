export default function InfoBlock({ title, children }) {
  return (
    <div className="rounded-xl bg-cric-card p-3 sm:p-4 shadow-sm ring-1 ring-cric-border">
      <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-cric-muted">{title}</h3>
      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-cric-text">{children}</p>
    </div>
  );
}
