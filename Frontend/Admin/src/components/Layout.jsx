import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="app-shell flex">
      <aside className="hidden md:block bg-white border-r">
        <Sidebar />
      </aside>

      <div className="w-full flex flex-col min-h-screen">
        <header className="bg-white border-b">
          <Navbar />
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}