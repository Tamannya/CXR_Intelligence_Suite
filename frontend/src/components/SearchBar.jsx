import { Search } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Search tools..." }) {
  return (
    <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/35 px-4 py-3 backdrop-blur-xl">
      <Search className="h-4 w-4 text-sky-100/60" />
      <input
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400/65"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

