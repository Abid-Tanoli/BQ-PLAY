import { Link } from "react-router-dom";

const MatchCard = ({ match }) => {
  return (
    <Link to={`/match/${match._id}`}>
      <div className="border p-4 rounded shadow hover:bg-gray-50">
        <h3 className="font-bold">{match.title || `${match.teams?.[0]?.name || 'Team A'} vs ${match.teams?.[1]?.name || 'Team B'}`}</h3>
        <p>Status: {match.status}</p>
        <p>Overs: {match.totalOvers || 20}</p>
      </div>
    </Link>
  );
};

export default MatchCard;
