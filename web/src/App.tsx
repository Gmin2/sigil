import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AccessGate from "./components/AccessGate";
import { hasAccess } from "./lib/access";

function GatedApp() {
  const [unlocked, setUnlocked] = useState(hasAccess);
  return unlocked ? <Dashboard /> : <AccessGate onUnlock={() => setUnlocked(true)} />;
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<GatedApp />} />
      </Routes>
    </div>
  );
}

export default App;
