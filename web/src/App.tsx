import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AccessGate from "./components/AccessGate";
import { hasAccess } from "./lib/access";

// on the app.* subdomain the root route is the app itself; on the main domain
// "/" is the landing and "/app" is the app.
const isAppHost =
  typeof window !== "undefined" && window.location.hostname.startsWith("app.");

function GatedApp() {
  const [unlocked, setUnlocked] = useState(hasAccess);
  return unlocked ? <Dashboard /> : <AccessGate onUnlock={() => setUnlocked(true)} />;
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/" element={isAppHost ? <GatedApp /> : <Landing />} />
        <Route path="/app" element={<GatedApp />} />
      </Routes>
    </div>
  );
}

export default App;
