import { useEffect, useState } from "react";
import { API } from "../services/api";
import MatchCard from "../components/MatchCard";

const Home = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    API.get("/matches").then(res => setMatches(res.data));
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-2xl font-bold">Live Matches</h1>
      {matches.map(m => <MatchCard key={m._id} match={m} />)}
    </div>
  );
};

export default Home;
