import { BrainCircuit, FolderClock, Gauge, Home, Settings2, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tools", label: "Main Tools", icon: Wrench },
  { to: "/advanced", label: "Advanced Tools", icon: BrainCircuit },
  { to: "/history", label: "History", icon: FolderClock },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

export function Sidebar() {
  return (
    <aside className="rounded-[2rem] bg-ink px-4 py-6 text-white shadow-panel">
      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
        <div className="rounded-2xl bg-accent/20 p-3">
          <Gauge className="h-6 w-6 text-emerald-300" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold">Chest X - ray</p>
          <p className="text-sm text-white/70">A Smart prediction system</p>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

