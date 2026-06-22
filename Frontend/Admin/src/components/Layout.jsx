import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { LayoutContext } from "../context/LayoutContext";
import SocketStatusIndicator from "../../../Shared/components/SocketStatusIndicator";
import { getSocket } from "../store/socket";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLiveScoring = /^\/admin\/score\/[^/]+/.test(location.pathname);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <LayoutContext.Provider value={{ toggleSidebar, sidebarOpen, isLiveScoring }}>
      <SocketStatusIndicator getSocket={getSocket} />
      <div className="min-h-screen bg-cric-bg text-cric-text transition-colors duration-300 max-w-full overflow-x-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:ml-64 flex flex-col min-h-screen min-w-0">
          <div className={isLiveScoring ? "hidden xl:block" : ""}>
            <Navbar onMenuClick={toggleSidebar} compact={isLiveScoring} />
          </div>
          <main className={`flex-1 overflow-y-auto overflow-x-hidden min-w-0 ${isLiveScoring ? "p-2 sm:p-3 xl:p-8" : "p-4 md:p-6 lg:p-8"}`}>
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
