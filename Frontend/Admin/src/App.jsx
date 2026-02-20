import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import LiveScores from "./pages/LiveScores";
import ManageMatches from "./pages/ManageMatches";
import ManagePlayers from "./pages/ManagePlayers";
import Teams from "./pages/Teams";
import ManageScore from "./pages/ManageScore";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LiveMatchView from "./pages/Livematchview";
import TournamentManagement from "./pages/Tournamentmanagement";
import BulkImport from "./pages/BulkImport";
import Rankings from "./pages/Rankings";
import PlayerProfile from "./pages/PlayerProfile";

export default function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/admin/login"
        element={token ? <Navigate to="/admin" replace /> : <AdminLogin />}
      />
      <Route
        path="/admin/register"
        element={token ? <Navigate to="/admin" replace /> : <AdminRegister />}
      />

      <Route path="/admin/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="live/:matchId" element={<LiveMatchView />} />
              <Route path="matches" element={<ManageMatches />} />
              <Route path="tournaments" element={<TournamentManagement />} />
              <Route path="players" element={<ManagePlayers />} />
              <Route path="players/:id" element={<PlayerProfile />} />
              <Route path="teams" element={<Teams />} />
              <Route path="bulk-import" element={<BulkImport />} />
              <Route path="score/:matchId?" element={<ManageScore />} />
              <Route path="rankings" element={<Rankings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}