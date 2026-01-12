import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PlayerList from "./components/PlayerList";
import RankingList from "./components/RankingList";

export default function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="flex space-x-4 mb-4">
          <Link to="/players" className="text-blue-500">Players</Link>
          <Link to="/ranking" className="text-blue-500">Ranking</Link>
        </nav>

        <Routes>
          <Route path="/players" element={<PlayerList />} />
          <Route path="/ranking" element={<RankingList />} />
          <Route path="/" element={<PlayerList />} />
        </Routes>
      </div>
    </Router>
  );
}
