import { Menu, ScanHeart } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export function TopNav({ items, activePath }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-4 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-3 text-sky-200 shadow-[0_0_24px_rgba(56,189,248,0.18)]">
            <ScanHeart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-wide text-white">CXR Intelligence Suite</p>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-100/55">Medical AI Dashboard</p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive || activePath === item.to
                    ? "bg-sky-400/15 text-sky-100 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.24)]"
                    : "text-slate-200/80 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-slate-950/90 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm transition ${
                    isActive ? "bg-sky-400/15 text-sky-100" : "text-slate-200/80 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

