import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import LiveScores from "./pages/LiveScores";
import LiveCricketScores from "./pages/LiveCricketScores";
import MatchScorecard from "./pages/MatchScorecard";
import ManageEvents from "./pages/ManageEvents";
import EventDetail from "./pages/EventDetail";
import EventSquadForm from "./pages/EventSquadForm";
import ManagePlayers from "./pages/ManagePlayers";
import Teams from "./pages/Teams";
import ManageScore from "./pages/ManageScore";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import Layout from "./components/Layout";
import LiveMatchView from "./pages/Livematchview";
import TournamentManagement from "./pages/Tournamentmanagement";
import BulkImport from "./pages/BulkImport";
import Rankings from "./pages/Rankings";
import PlayerProfile from "./pages/PlayerProfile";
import TeamProfile from "./pages/TeamProfile";
import Blogs from "./pages/Blogs";

// Wrapper component that wraps each page with Layout
function PageWithLayout({ children }) {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/admin/login"
        element={token ? <Navigate to="/admin" replace /> : <AdminLogin />}
      />
      <Route
        path="/admin/register"
        element={token ? <Navigate to="/admin" replace /> : <AdminRegister />}
      />

      {/* All admin routes wrapped with Layout */}
      <Route path="/admin" element={<PageWithLayout><Dashboard /></PageWithLayout>} />
      <Route path="/admin/live" element={<PageWithLayout><LiveScores /></PageWithLayout>} />
      <Route path="/admin/live-scores" element={<PageWithLayout><LiveCricketScores /></PageWithLayout>} />
      <Route path="/admin/live/:matchId" element={<PageWithLayout><LiveMatchView /></PageWithLayout>} />
      <Route path="/admin/scorecard/:matchId" element={<PageWithLayout><MatchScorecard /></PageWithLayout>} />

      {/* Events Routes */}
      <Route path="/admin/events" element={<PageWithLayout><ManageEvents /></PageWithLayout>} />
      <Route path="/admin/events/:eventId" element={<PageWithLayout><EventDetail /></PageWithLayout>} />
      {/* Squad route - MUST come before :eventId */}
      <Route path="/admin/events/:eventId/squad/:teamId" element={<PageWithLayout><EventSquadForm /></PageWithLayout>} />

      {/* Tournaments */}
      <Route path="/admin/tournaments" element={<PageWithLayout><TournamentManagement /></PageWithLayout>} />

      {/* Players */}
      <Route path="/admin/players" element={<PageWithLayout><ManagePlayers /></PageWithLayout>} />
      <Route path="/admin/players/:id" element={<PageWithLayout><PlayerProfile /></PageWithLayout>} />

      {/* Teams */}
      <Route path="/admin/teams" element={<PageWithLayout><Teams /></PageWithLayout>} />
      <Route path="/admin/teams/:id" element={<PageWithLayout><TeamProfile /></PageWithLayout>} />

      {/* Other */}
      <Route path="/admin/bulk-import" element={<PageWithLayout><BulkImport /></PageWithLayout>} />
      <Route path="/admin/score" element={<PageWithLayout><ManageScore /></PageWithLayout>} />
      <Route path="/admin/score/:matchId" element={<PageWithLayout><ManageScore /></PageWithLayout>} />
      <Route path="/admin/rankings" element={<PageWithLayout><Rankings /></PageWithLayout>} />
      <Route path="/admin/blogs" element={<PageWithLayout><Blogs /></PageWithLayout>} />

      {/* Catch all - redirect to admin */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
