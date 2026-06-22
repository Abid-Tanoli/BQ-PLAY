import { number } from "../utils/matchHelpers";

export default function MiniWagonWheel({ shots = [] }) {
  const size = 118;
  const origin = { x: size / 2, y: size * 0.62 };
  const scoringShots = shots.filter((shot) => number(shot.runs) > 0).slice(-12);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mt-2 h-28 w-full rounded-lg bg-emerald-950/90">
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 5} fill="#123524" stroke="#ffffff22" />
      <rect x={origin.x - 4} y={size * 0.32} width="8" height="44" rx="2" fill="#f2c07855" />
      {scoringShots.map((shot, index) => {
        const angle = number(shot.angle);
        const distance = Math.min(number(shot.distance, 50), 100);
        const radius = (size / 2 - 8) * (distance / 100);
        const rad = angle * (Math.PI / 180);
        const x = origin.x + radius * Math.sin(rad);
        const y = origin.y - radius * Math.cos(rad);
        const color = number(shot.runs) >= 6 ? "#c084fc" : number(shot.runs) >= 4 ? "#60a5fa" : "#cbd5e1";
        return <line key={index} x1={origin.x} y1={origin.y} x2={x} y2={y} stroke={color} strokeWidth={number(shot.runs) >= 4 ? 2.4 : 1.2} strokeLinecap="round" />;
      })}
      <circle cx={origin.x} cy={origin.y} r="3.5" fill="#ff6b35" />
    </svg>
  );
}
