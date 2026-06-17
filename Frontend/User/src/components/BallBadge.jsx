export default function BallBadge({ ball, small = false }) {
  const isWicket = ball.isWicket;
  const wc = ball.wicketCancelled;
  const notation = wc ? "Nb" : isWicket ? "W" : (ball.runs === 0 && !ball.isWide && !ball.isNoBall) ? "\u2022" : String(ball.runs || 0);
  const isFour = ball.runs === 4 && !ball.isWide && !ball.isNoBall && !ball.isWicket;
  const isSix = ball.runs === 6 && !ball.isWide && !ball.isNoBall && !ball.isWicket;
  const isWide = ball.isWide;
  const isNoBall = ball.isNoBall;
  const base = small ? "w-5 h-5 sm:w-6 sm:h-6 text-[8px] sm:text-[9px] rounded" : "w-8 h-8 sm:w-9 sm:h-9 text-[11px] sm:text-xs rounded-lg";
  const color = wc
    ? "bg-orange-600 text-white ring-2 ring-red-500"
    : isWicket
      ? "bg-red-600 text-white"
      : isSix ? "bg-purple-600 text-white"
        : isFour ? "bg-cric-accent text-white"
          : (isWide || isNoBall) ? "bg-amber-500 text-white"
            : "bg-cric-border text-cric-muted";
  return (
    <div className={`${base} ${color} flex items-center justify-center font-black shrink-0 shadow-sm`}>
      {notation}
    </div>
  );
}
