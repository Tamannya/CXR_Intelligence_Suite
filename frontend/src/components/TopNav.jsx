import { Menu, Activity, Shield, ChevronDown, User, LogOut, Settings, Image, Lock } from "lucide-react";
import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

// Premium original ImagePulse Logo SVG
const ImagePulseLogo = () => (
  <svg
    className="h-7 w-7 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse"
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

export function TopNav({ items, activePath, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[58px] glass-navbar">
      <div className="mx-auto flex h-full max-w-[1550px] items-center justify-between px-8">
        {/* Left Side Logo & Brand */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <ImagePulseLogo />
          <span className="font-display text-[17px] font-bold text-white tracking-wider flex items-center gap-1 select-none">
            Image<span className="text-emerald-500 font-extrabold group-hover:text-emerald-400 transition duration-200">Pulse</span>
          </span>
        </NavLink>

        {/* Center Navigation Links */}
        <nav className="hidden items-center gap-8 lg:flex h-full">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-[13px] font-medium tracking-wide font-display transition duration-200 h-full flex items-center px-2 border-b-2 relative ${
                  isActive || activePath === item.to
                    ? "text-emerald-400 border-emerald-400 font-semibold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Side User State / CTAs */}
        <div className="hidden items-center gap-4 lg:flex relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 pl-2.5 pr-3 py-1.5 rounded-full text-xs font-semibold text-slate-200 transition duration-150"
              >
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span>{user.name}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {profileOpen && (
                <>
                  {/* Backdrop overlay for closing */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  
                  {/* Dropdown panel */}
                  <div className="absolute right-0 mt-2.5 w-[290px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-3.5 select-none animate-fade-in">
                    {/* User info header */}
                    <div className="flex items-start gap-3">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-extrabold text-[16px] border border-white/10">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-white truncate">{user.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                        <p className="text-[10px] text-emerald-400 font-medium font-mono uppercase tracking-wider mt-1">{user.institution || "ImagePulse Hospital"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px]">
                      <span className="text-slate-400 font-medium">Role: <strong className="text-slate-200">{user.role || "Radiologist"}</strong></span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                        Active Node
                      </span>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Navigation Actions */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-2.5 text-[12px] text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-2.5 text-[12px] text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" />
                        Edit Profile
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-2.5 text-[12px] text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <Image className="h-3.5 w-3.5 text-slate-400" />
                        Upload Profile Photo
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/profile");
                        }}
                        className="flex items-center gap-2.5 text-[12px] text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        Change Password
                      </button>

                      <button
                        onClick={() => {
                          alert("Notification Settings will be configured in node registry.");
                        }}
                        className="flex items-center gap-2.5 text-[12px] text-slate-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-400" />
                        Notification Settings
                      </button>
                    </div>

                    <div className="h-px bg-white/5" />

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      className="flex items-center gap-2.5 text-[12px] text-red-400 hover:text-red-300 px-2 py-2 rounded-lg hover:bg-red-500/5 transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-400" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="border border-white/10 bg-white/5 px-4.5 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 transition duration-200">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="relative bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4.5 py-1.5 rounded-lg text-sm transition duration-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden hover:bg-white/5 transition duration-200"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Dropdown Navigation */}
      {open && (
        <nav className="border-b border-white/10 bg-slate-900/95 backdrop-blur-2xl px-6 py-6 lg:hidden absolute top-[58px] left-0 right-0 shadow-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-[14px] font-medium py-3 px-3 rounded-lg transition duration-200 ${
                    isActive 
                      ? "text-emerald-400 bg-white/5 font-semibold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="h-px bg-white/5 my-2"></div>
          {user ? (
            <div className="flex flex-col gap-3">
              <div 
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10 px-4 py-3 rounded-lg text-xs font-semibold text-slate-200 transition"
              >
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-[12px]">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-white text-[13px] truncate">{user.name}</span>
                  <span className="block text-[11px] text-slate-400 truncate mt-0.5">{user.email}</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-center border border-white/10 text-slate-300 py-2.5 rounded-lg text-sm hover:bg-white/5 transition duration-200"
              >
                View / Edit Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="w-full text-center border border-red-500/30 text-red-400 py-2.5 rounded-lg text-sm hover:bg-red-500/10 transition duration-200"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                <button className="w-full border border-white/10 bg-white/5 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition duration-200">
                  Log in
                </button>
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="flex-1">
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-2.5 rounded-lg text-sm font-semibold transition duration-200 shadow-md">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
