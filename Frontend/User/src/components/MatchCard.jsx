import { Link } from "react-router-dom";

const MatchCard = ({ match }) => {
  return (
    <Link to={`/match/${match._id}`}>
      <div className="border p-4 rounded shadow hover:bg-gray-50">
        <h3 className="font-bold">{match.teamA} vs {match.teamB}</h3>
        <p>Status: {match.status}</p>
        <p>Overs: {match.overs}</p>
      </div>
    </Link>
  );
};

export default MatchCard;
