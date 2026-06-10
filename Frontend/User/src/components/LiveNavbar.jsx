import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const navItems = [
  { key: 'live', label: 'Live Scores', path: '/live', accent: 'bg-red-500' },
  { key: 'international', label: 'International', path: '/international', accent: 'bg-blue-500' },
  { key: 'series', label: 'Series', path: '/series', accent: 'bg-amber-500' },
  { key: 'teams', label: 'Teams', path: '/teams', accent: 'bg-emerald-500' },
  { key: 'news', label: 'News', path: '/news', accent: 'bg-sky-500' },
  { key: 'videos', label: 'Videos', path: '/videos', accent: 'bg-purple-500' },
  { key: 'stats', label: 'Stats', path: '/rankings', accent: 'bg-slate-500' },
];

const LiveNavbar = () => {
  const location = useLocation();
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [runningSeries, setRunningSeries] = useState([]);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);

  useEffect(() => {
    loadNavigationData();
  }, []);

  const loadNavigationData = async () => {
    try {
      const eventsRes = await api.get('/events', {
        params: { limit: 20 },
        timeout: 6000,
      });
      const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

      setTrendingSeries(events.filter((event) => event.status === 'live' || event.eventType === 'league').slice(0, 5));
      setRunningSeries(events.filter((event) => event.status === 'live'));
    } catch (err) {
      setTrendingSeries([]);
      setRunningSeries([]);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md">
      <div className="bg-[#031d44] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-2xl font-black tracking-tight">BQ PLAY</Link>
          <input
            type="text"
            placeholder="Search matches, teams, players..."
            className="hidden w-64 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-blue-200 outline-none focus:bg-white/20 md:block"
          />
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                isActive(item.path) ? 'text-[#031d44]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${item.accent}`} />
              <span>{item.label}</span>
              {isActive(item.path) && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t bg-[#031d44]" />}
            </Link>
          ))}

          {trendingSeries.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => setShowSeriesDropdown(true)}
              onMouseLeave={() => setShowSeriesDropdown(false)}
            >
              <button className="flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span>{trendingSeries[0]?.name || 'Trending'}</span>
                <span className="text-[10px]">v</span>
              </button>

              {showSeriesDropdown && (
                <div className="absolute left-0 top-full z-50 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                  {trendingSeries.map((series) => (
                    <Link
                      key={series._id}
                      to={`/series/${series._id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      {series.logo ? (
                        <img src={series.logo} alt={series.name} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-xs font-bold">
                          {series.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-800">{series.name}</p>
                        <p className="text-[10px] capitalize text-slate-500">{series.eventType} - {series.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {runningSeries.length > 0 && (
        <div className="border-b border-blue-100 bg-blue-50">
          <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2">
            <span className="whitespace-nowrap text-xs font-bold uppercase text-blue-700">Live Series:</span>
            {runningSeries.map((series) => (
              <Link
                key={series._id}
                to={`/series/${series._id}`}
                className="whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 transition-colors hover:bg-blue-200"
              >
                {series.shortName || series.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveNavbar;
