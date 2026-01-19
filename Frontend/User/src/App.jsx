import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Match from "./pages/Match";
import Players from "./pages/Players";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/match/:id" element={<Match />} />
        <Route path="/players" element={<Players />} />
      </Routes>
    </Router>
  );
}

export default App;
