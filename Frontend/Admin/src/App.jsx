import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import LiveScores from "./pages/LiveScores";
import ManageMatches from "./pages/ManageMatches";
import ManagePlayers from "./pages/ManagePlayers";
import Teams from "./pages/Teams";
import ManageScore from "./pages/ManageScore";
import TournamentTable from "./pages/TournamentTable";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

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

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="" element={<Dashboard />} />
                <Route path="live" element={<LiveScores />} />
                <Route path="matches" element={<ManageMatches />} />
                <Route path="players" element={<ManagePlayers />} />
                <Route path="teams" element={<Teams />} />
                <Route path="score" element={<ManageScore />} />
                <Route path="tournament" element={<TournamentTable />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}