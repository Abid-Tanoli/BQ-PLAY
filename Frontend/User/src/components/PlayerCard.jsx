const PlayerCard = ({ player }) => {
  return (
    <div className="border p-3 rounded shadow">
      <h3 className="font-semibold">{player.name}</h3>
      <p>Team: {player.team}</p>
      <p>Role: {player.role}</p>
    </div>
  );
};

export default PlayerCard;
