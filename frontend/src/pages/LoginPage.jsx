import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Loader2, Mail, Lock, ShieldAlert } from "lucide-react";
import { api } from "../services/api";

// Premium original ImagePulse Logo SVG
const ImagePulseLogo = () => (
  <svg
    className="h-10 w-10 text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Scanner Reticle Ring */}
    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.3" />
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" opacity="0.15" />
    
    {/* Crosshair Scanner Lines */}
    <line x1="50" y1="2" x2="50" y2="12" stroke="currentColor" strokeWidth="2" opacity="0.7" />
    <line x1="50" y1="88" x2="50" y2="98" stroke="currentColor" strokeWidth="2" opacity="0.7" />
    <line x1="2" y1="50" x2="12" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.7" />
    <line x1="88" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.7" />

    {/* Stylized Anatomy (Ribs/Lung Contours) */}
    <path
      d="M26 32C34 32 42 38 44 48C45 55 42 70 28 78C20 74 18 56 20 46C21 38 23 34 26 32Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M74 32C66 32 58 38 56 48C55 55 58 70 72 78C80 74 82 56 80 46C79 38 77 34 74 32Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.85"
    />

    {/* Left Rib Structures */}
    <path d="M22 44H34" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    <path d="M20 54H38" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    <path d="M22 64H38" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />

    {/* Right Rib Structures */}
    <path d="M78 44H66" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    <path d="M80 54H62" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
    <path d="M78 64H62" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />

    {/* Central AI Brain Node & Network Pathways */}
    <circle cx="50" cy="50" r="7" fill="currentColor" className="text-emerald-500" />
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
    <circle cx="50" cy="30" r="3.5" fill="#34d399" />
    <circle cx="50" cy="70" r="3.5" fill="#34d399" />
    <circle cx="34" cy="50" r="3" fill="#a7f3d0" />
    <circle cx="66" cy="50" r="3" fill="#a7f3d0" />

    {/* Intersecting Network Lines */}
    <line x1="50" y1="50" x2="50" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="50" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="50" y1="50" x2="34" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="50" y1="50" x2="66" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

export function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password flow states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const data = await api.login({ email, password });
      if (onLogin) {
        onLogin(data);
      }
      if (rememberMe) {
        localStorage.setItem("cxr_remember", "true");
        localStorage.setItem("cxr_remember_email", email);
      } else {
        localStorage.removeItem("cxr_remember");
        localStorage.removeItem("cxr_remember_email");
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to validate node credentials.");
    } finally {
      setLoading(false);
    }
  };

  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const [customEmailMode, setCustomEmailMode] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  const handleGoogleLogin = () => {
    setGoogleChooserOpen(true);
    setCustomEmailMode(false);
    setCustomGoogleEmail("");
    setCustomGoogleName("");
  };

  const handleAccountSelect = async (selectedEmail, selectedName) => {
    setGoogleChooserOpen(false);
    setGoogleLoading(true);
    setError("");
    try {
      const data = await api.googleAuth({
        email: selectedEmail,
        name: selectedName
      });
      if (onLogin) {
        onLogin(data);
      }
      navigate("/");
    } catch (err) {
      setError("Google OAuth authentication failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoveryLoading(true);
    setTimeout(() => {
      setRecoveryLoading(false);
      setRecoverySent(true);
    }, 1200);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0F172A] px-4 py-20 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full filter blur-[70px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full filter blur-[75px] pointer-events-none" />
      <div className="absolute inset-0 bg-mesh-grid pointer-events-none opacity-20" />

      {/* Form Container Card */}
      <div className="w-full max-w-[420px] bg-white/[0.04] backdrop-blur-xl p-8 rounded-2xl border border-white/[0.12] shadow-2xl flex flex-col gap-6 relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-3">
          <ImagePulseLogo />
          <span className="font-display text-[22px] font-bold text-white tracking-widest flex items-center gap-1 select-none">
            Image<span className="text-emerald-500 font-extrabold">Pulse</span>
          </span>
          <h2 className="text-[#CBD5E1] text-[13.5px] mt-1 font-medium font-display tracking-wide text-center">
            {forgotPasswordOpen ? "Reset clinical node credentials" : "Sign in to access advanced thoracic metrics"}
          </h2>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2 animate-pulse">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {forgotPasswordOpen ? (
          // Forgot Password / Recovery Panel
          recoverySent ? (
            <div className="flex flex-col gap-5 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-medium">
                Recovery instructions and security keys have been dispatched to your institutional inbox ({recoveryEmail}).
              </div>
              <button
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setRecoverySent(false);
                  setRecoveryEmail("");
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition duration-150 text-sm"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider font-mono">
                  Registered Institutional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="name@institution.org"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-[14px] text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
              >
                {recoveryLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Send Recovery Key"}
              </button>

              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition mt-1"
              >
                Cancel and return
              </button>
            </form>
          )
        ) : (
          // Main Login Form
          <>
            {/* Google OAuth Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-slate-200 py-3 rounded-xl transition duration-150 flex items-center justify-center gap-3 font-semibold text-[13.5px]"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Or Sign In with Email</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider font-mono">
                  Clinical Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.org"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-[14px] text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider font-mono">
                    Auditor Security Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-white/[0.12] hover:border-white/20 rounded-xl text-[14px] text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <label htmlFor="remember-me" className="text-xs text-slate-400 cursor-pointer">
                  Remember node on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(52,211,153,0.45)] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Validating credentials...
                  </>
                ) : (
                  "Access System Gate"
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer Link */}
        <div className="text-center text-[13px] text-[#CBD5E1] border-t border-white/5 pt-5">
          New clinical site?{" "}
          <Link to="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 transition duration-150">
            Request credentials
          </Link>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      {googleChooserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          {/* Chrome Window Simulator Card */}
          <div className="w-full max-w-[480px] h-[640px] bg-[#000000] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Chrome window title bar */}
            <div className="bg-[#202124] px-4 py-2.5 flex items-center justify-between text-slate-300 text-xs border-b border-white/5 select-none shrink-0">
              <div className="flex items-center gap-2">
                {/* Small Google icon */}
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="truncate max-w-[280px] text-slate-200">Sign in – Google accounts - Google Chrome</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setGoogleChooserOpen(false)} className="hover:text-white transition-colors">—</button>
                <button onClick={() => setGoogleChooserOpen(false)} className="hover:text-white transition-colors">▢</button>
                <button onClick={() => setGoogleChooserOpen(false)} className="hover:text-red-500 font-bold transition-colors">✕</button>
              </div>
            </div>

            {/* Chrome address bar area */}
            <div className="bg-[#2b2c2f] px-3 py-1.5 flex items-center gap-2 border-b border-white/5 shrink-0 select-none">
              {/* Navigation arrows */}
              <div className="flex items-center gap-3 text-slate-550 text-sm">
                <span>←</span>
                <span>→</span>
                <span className="text-[12px]">⟳</span>
              </div>
              {/* Address field container */}
              <div className="flex-1 bg-[#202124] rounded-full px-4 py-1 flex items-center gap-2 text-slate-400 text-[11px] truncate border border-white/5">
                <span className="text-emerald-500">🔒</span>
                <span className="text-slate-300">accounts.google.com</span>
                <span className="text-slate-550">/v3/signin/accountchooser?as=8hAs3skg-PQYhHRUfy...</span>
              </div>
            </div>

            {/* Google accounts chooser page body */}
            <div className="flex-1 bg-[#000000] p-10 flex flex-col justify-between overflow-y-auto text-slate-200">
              <div className="flex flex-col gap-6">
                {/* G logo + Sign in with Google */}
                <div className="flex items-center gap-2 select-none">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-[14px] font-medium text-slate-350 font-sans">Sign in with Google</span>
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-1.5 mt-2 font-sans select-none">
                  <h1 className="text-[28px] font-normal tracking-tight text-[#e3e3e3] leading-tight">
                    {customEmailMode ? "Sign in" : "Choose an account"}
                  </h1>
                  <p className="text-[14px] text-slate-300 leading-normal">
                    to continue to <span className="text-[#8ab4f8] hover:underline cursor-pointer">imagepulse.org</span>
                  </p>
                </div>

                {customEmailMode ? (
                  // Custom Input form matching Google's actual custom input style
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customGoogleEmail) {
                        const fallbackName = customGoogleName || customGoogleEmail.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
                        handleAccountSelect(customGoogleEmail, fallbackName);
                      }
                    }}
                    className="flex flex-col gap-5 mt-4"
                  >
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="Email or phone"
                        className="w-full px-3.5 py-4 bg-transparent border border-slate-650 rounded-lg text-[15px] text-white focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition placeholder-slate-550"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="Full name (optional)"
                        className="w-full px-3.5 py-4 bg-transparent border border-slate-650 rounded-lg text-[15px] text-white focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition placeholder-slate-550"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => setCustomEmailMode(false)}
                        className="text-[#8ab4f8] hover:text-[#aecbfa] text-[13.5px] font-bold py-2 rounded transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#8ab4f8] hover:bg-[#aecbfa] text-black text-[13.5px] font-bold rounded-full transition shadow-md"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                ) : (
                  // Accounts List matching screenshot exactly
                  <div className="flex flex-col border-b border-slate-800/80 mt-2 font-sans select-none animate-fade-in">
                    {(() => {
                      const list = [];
                      const defaultName = "Tamannya Mukherjee";
                      const defaultEmail = "tamannya2004@gmail.com";
                      
                      if (email && email.includes("@") && email !== defaultEmail) {
                        const namePart = email.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
                        list.push({ email, name: namePart, initial: namePart.substring(0, 2).toUpperCase() });
                      }
                      
                      list.push({ email: defaultEmail, name: defaultName, initial: "TM", isTamannya: true });
                      
                      const remembered = localStorage.getItem("cxr_remember_email");
                      if (remembered && remembered !== email && remembered !== defaultEmail) {
                        const namePart = remembered.split("@")[0].split(".").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
                        list.push({ email: remembered, name: namePart, initial: namePart.substring(0, 2).toUpperCase() });
                      }
                      
                      return list;
                    })().map((acc) => (
                      <button
                        key={acc.email}
                        onClick={() => handleAccountSelect(acc.email, acc.name)}
                        className="flex items-center gap-3.5 w-full py-4 border-t border-slate-800/80 hover:bg-white/[0.03] transition text-left px-2"
                      >
                        <div className="h-[28px] w-[28px] rounded-full bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden select-none">
                          <span className="text-[10px]">{acc.initial}</span>
                        </div>
                        <div className="flex-1 min-w-0 leading-tight">
                          <span className="block font-medium text-[13.5px] text-[#e3e3e3]">{acc.name}</span>
                          <span className="block text-[11.5px] text-slate-400 mt-0.5">{acc.email}</span>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setCustomEmailMode(true)}
                      className="flex items-center gap-3.5 w-full py-4 border-t border-slate-800/80 hover:bg-white/[0.03] text-slate-200 hover:text-white transition px-2"
                    >
                      <div className="h-[28px] w-[28px] rounded-full border border-slate-700 flex items-center justify-center text-slate-350 shrink-0 text-sm">
                        👤
                      </div>
                      <span className="text-[13.5px] font-medium">Use another account</span>
                    </button>
                  </div>
                )}

                {/* Privacy Disclaimer */}
                {!customEmailMode && (
                  <p className="text-[12.5px] text-slate-400 leading-relaxed mt-6 font-sans">
                    Before using this app, you can review imagepulse.org's{" "}
                    <span className="text-[#8ab4f8] hover:underline cursor-pointer">Privacy Policy</span> and{" "}
                    <span className="text-[#8ab4f8] hover:underline cursor-pointer">Terms of Service</span>.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-8 border-t border-slate-800/40 pt-4 font-sans select-none shrink-0">
                <div className="flex items-center gap-1 hover:text-white cursor-pointer transition">
                  <span>English (United Kingdom)</span>
                  <span className="text-[9px]">▼</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hover:text-white cursor-pointer transition">Help</span>
                  <span className="hover:text-white cursor-pointer transition">Privacy</span>
                  <span className="hover:text-white cursor-pointer transition">Terms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
