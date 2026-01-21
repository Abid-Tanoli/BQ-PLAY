import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LiveScores from "./pages/LiveScores";
import ManageMatches from "./pages/ManageMatches";
import ManagePlayers from "./pages/ManagePlayers";
import Teams from "./pages/Teams";
import ManageScore from "./pages/ManageScore";
import TournamentTable from "./pages/TournamentTable";
import Login from "./pages/auth/AdminLogin";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />

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
                <Route path="team" element={< Teams/>}></Route>
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