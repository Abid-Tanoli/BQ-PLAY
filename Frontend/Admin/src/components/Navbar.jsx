import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="lg:hidden text-slate-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user?.name || "Admin"}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
