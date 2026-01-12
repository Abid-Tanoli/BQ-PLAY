import { useParams } from "react-router-dom";
import Scoreboard from "../components/Scoreboard";
import Commentary from "../components/Commentary";

const Match = () => {
  const { id } = useParams();

  return (
    <div className="p-4">
      <Scoreboard matchId={id} />
      <Commentary matchId={id} />
    </div>
  );
};

export default Match;
