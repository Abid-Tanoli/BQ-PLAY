import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Match from "./pages/Match";
import Summary from "./pages/Summary";
import Players from "./pages/Players";
import PlayerProfile from "./pages/PlayerProfile";
import Teams from "./pages/Teams";
import Rankings from "./pages/Rankings";
import PointsTable from "./pages/PointsTable";
import Live from "./pages/Live";
import News from "./pages/News";
import Videos from "./pages/Videos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<Live />} />
        <Route path="/match/:matchId" element={<Match />} />
        <Route path="/summary/:matchId" element={<Summary />} />
        <Route path="/players" element={<Players />} />
        <Route path="/players/:playerId" element={<PlayerProfile />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/points-table" element={<PointsTable />} />
        <Route path="/news" element={<News />} />
        <Route path="/videos" element={<Videos />} />
      </Routes>
    </Router>
  );
}

export default App;