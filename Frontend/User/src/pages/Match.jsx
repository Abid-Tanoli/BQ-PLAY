import { useParams } from "react-router-dom";
import Scoreboard from "../components/Scoreboard";
import Commentary from "../components/Commentary";

const Match = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800/90 rounded-xl shadow-lg p-6 space-y-4">
        <Scoreboard matchId={id} />
        <Commentary matchId={id} />
      </div>
    </div>
  );
};

export default Match;
