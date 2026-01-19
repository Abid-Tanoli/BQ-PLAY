import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { setAuthToken } from "./services/api";

import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import Dashboard from "./pages/Dashboard";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("bq_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("bq_token");
    if (token) setAuthToken(token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <AdminLogin
              onLogin={(token, user) => {
                localStorage.setItem("bq_token", token);
                localStorage.setItem("bq_user", JSON.stringify(user));
                setAuthToken(token);
                window.location.href = "/";
              }}
            />
          }
        />

        <Route path="/register" element={<AdminRegister />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
