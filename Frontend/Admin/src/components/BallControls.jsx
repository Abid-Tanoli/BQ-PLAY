const runs = [0,1,2,3,4,6];

export default function BallControls({ onBall }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {runs.map(r => (
        <button
          key={r}
          onClick={() => onBall(r)}
          className="bg-green-600 text-white p-2 rounded"
        >
          {r}
        </button>
      ))}
      <button
        onClick={() => onBall("W")}
        className="bg-red-600 text-white p-2 rounded"
      >
        Wicket
      </button>
    </div>
  );
}
