import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link } from "react-router-dom";

export default function Live() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/matches?status=live");
        if (mounted) setMatches(res.data);
      } catch (err) {
        console.error("Failed to load live matches", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 10000); // refresh every 10s
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (loading) return <div>Loading live matches...</div>;
  if (!matches.length) return <div>No live matches currently</div>;

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <Link to={`/match/${m._id}`} key={m._id} className="block p-4 bg-white/5 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{m.title || m.name}</div>
              <div className="text-sm text-gray-400">{m.venue}</div>
            </div>
            <div className="text-right">
              <div className="text-green-400">{m.status}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}