import { useState, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { TopNav } from "./components/TopNav";
import { Home } from "./pages/Home";
import { Results } from "./pages/Results";
import { Taxonomy } from "./pages/Taxonomy";
import { Fairness } from "./pages/Fairness";
import { Report } from "./pages/Report";
import { AnalysisPage } from "./pages/AnalysisPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { HistoryPage } from "./pages/HistoryPage";
import { EditProfile } from "./pages/EditProfile";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamically set tab favicon to stethoscope SVG
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
    link.type = "image/svg+xml";
    link.rel = "icon";
    link.href =
      "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%232471a3%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M4.8 2.3A.3.3 0 1 0 5 2.5V3a7 7 0 0 0 14 0v-.5a.3.3 0 1 0 .2-.2%22/><path d=%22M12 10v12%22/><path d=%22M12 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z%22/><path d=%22M9 14h6%22/></svg>";
    document.getElementsByTagName("head")[0].appendChild(link);
  }, []);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cxr_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (authData) => {
    setUser(authData.user);
    localStorage.setItem("cxr_user", JSON.stringify(authData.user));
    localStorage.setItem("cxr_token", authData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cxr_user");
    localStorage.removeItem("cxr_token");
    navigate("/");
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("cxr_user", JSON.stringify(updatedUser));
  };

  const [activeAnalysis, setActiveAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem("cxr_active_analysis");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleAnalysisComplete = (data) => {
    setActiveAnalysis(data);
    if (data) {
      localStorage.setItem("cxr_active_analysis", JSON.stringify(data));
    } else {
      localStorage.removeItem("cxr_active_analysis");
    }
    navigate("/results");
  };

  const layoutNav = [
    { to: "/", label: "Home" },
    { to: "/history", label: "History" },
    { to: "/taxonomy", label: "Taxonomy" },
    { to: "/fairness", label: "Performance Audit" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] pt-[56px] flex flex-col font-sans">
      <TopNav items={layoutNav} activePath={location.pathname} user={user} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/results" element={<Results analysis={activeAnalysis} />} />
          <Route path="/taxonomy" element={<Taxonomy />} />
          <Route path="/fairness" element={<Fairness />} />
          <Route path="/report" element={<Report />} />
          <Route path="/history" element={<HistoryPage user={user} />} />
          <Route path="/profile" element={<EditProfile user={user} onProfileUpdate={handleProfileUpdate} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="py-6 border-t border-white/5 bg-[#0F172A] text-center text-[12px] text-slate-500 font-medium select-none">
        &copy; 2026 ImagePulse. For research and educational use only.
      </footer>
    </div>
  );
}
