import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../services/api";
import { initAuthFromStorage, getStoredUser, logout as doLogout } from "../pages/auth/auth";

const CATEGORIES = [
  {
    key: "international",
    label: "International Teams",
    icon: "🌍",
    description: "Country-based national cricket teams",
    color: "from-blue-600 to-blue-800",
    hoverColor: "hover:border-blue-400",
    path: "/teams/international"
  },
  {
    key: "leagues",
    label: "International Leagues",
    icon: "🏆",
    description: "Professional franchise leagues worldwide (PSL, IPL, BBL, etc.)",
    color: "from-green-600 to-green-800",
    hoverColor: "hover:border-green-400",
    path: "/teams/leagues"
  },
  {
    key: "incubation",
    label: "Incubation Teams",
    icon: "🚀",
    description: "Internal training and development teams",
    color: "from-purple-600 to-purple-800",
    hoverColor: "hover:border-purple-400",
    path: "/teams/incubation"
  }
];

export default function Teams() {
  const [authUser, setAuthUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    setAuthUser(user);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || CATEGORIES);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories(CATEGORIES);
      setLoading(false);
    }
  };

  const handleLogout = () => { doLogout(); setAuthUser(null); };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
      <Header
        user={authUser}
        onShowLogin={() => { }}
        onShowRegister={() => { }}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="bg-[#031d44] dark:bg-slate-800 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Teams & Leagues</h1>
          <p className="text-blue-200/60 font-black uppercase tracking-widest text-sm">Select a category to explore teams, leagues, and incubation groups</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div
                key={cat.key}
                onClick={() => navigate(cat.path)}
                className={`group relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl border-2 border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-500 cursor-pointer transform hover:-translate-y-2 ${cat.hoverColor}`}
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${cat.color} p-8 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative">
                    <div className="text-6xl mb-4">{cat.icon}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                      {cat.label}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                    {cat.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-white">{cat.count || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        {cat.count === 1 ? 'ITEM' : 'ITEMS'}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className={`block w-full py-4 bg-gradient-to-r ${cat.color} text-white text-center rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm group-hover:shadow-lg`}>
                    Explore {cat.label} →
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">🌍 International Teams</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              National teams from cricket-playing nations including Pakistan, India, Australia, England, and more.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">🏆 International Leagues</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Franchise-based leagues like PSL, IPL, BBL, CPL featuring top players from around the world.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">🚀 Incubation Teams</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Internal training and development teams for grassroots cricket programs and academies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
