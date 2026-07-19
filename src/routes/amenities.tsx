import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Search, Leaf, Circle, ShieldCheck, ShoppingBag, HeartPulse, Droplet, Accessibility, Star, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/amenities")({
  head: () => ({ meta: [{ title: "Amenities — StadiumAI" }, { name: "description", content: "Find food, restrooms, medical, and more with AI." }] }),
  component: AmenitiesPage,
});

const filters = [
  { key: "veg", label: "Vegetarian", icon: Leaf },
  { key: "halal", label: "Halal", icon: Circle },
  { key: "rest", label: "Restrooms", icon: ShieldCheck },
  { key: "merch", label: "Merchandise", icon: ShoppingBag },
  { key: "med", label: "Medical", icon: HeartPulse },
  { key: "water", label: "Water", icon: Droplet },
  { key: "a11y", label: "Accessibility", icon: Accessibility },
];

const results = [
  { name: "Green Kitchen", walk: "4 min", queue: "Short (2 min)", rating: 4.8, reason: "Nearest vegetarian outlet to Gate D with less than 5 min expected waiting." },
  { name: "Halal House", walk: "6 min", queue: "Medium (5 min)", rating: 4.7, reason: "Fully certified Halal menu with the highest fan rating on Concourse 2." },
  { name: "The Field Cafe", walk: "3 min", queue: "Short (3 min)", rating: 4.6, reason: "Closest sit-down spot with vegetarian and gluten-free options." },
  { name: "Fresh Squeeze", walk: "5 min", queue: "None", rating: 4.9, reason: "Zero-queue juice bar near Section 112 — freshly pressed." },
];

function AmenitiesPage() {
  const [active, setActive] = useState<string[]>(["veg"]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Amenity Finder</h1>
        <p className="mt-1 text-muted-foreground">Find food, restrooms, medical & more.</p>
      </div>

      <div className="glass rounded-2xl p-2 flex items-center gap-2">
        <Search className="ml-3 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search restaurants, restrooms, kiosks..." className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" />
        <button className="rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">Search</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const on = active.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => setActive((a) => a.includes(f.key) ? a.filter((x) => x !== f.key) : [...a, f.key])}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                on ? "border-[#00d4ff]/60 bg-[#00d4ff]/10 text-white glow-ring" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass rounded-3xl p-4 h-[500px] relative overflow-hidden">
          <div className="absolute inset-0"><StadiumMap /></div>
          <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-3 flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs">
              <div className="font-semibold">4 vegetarian options near you</div>
              <div className="text-muted-foreground">Filtered by AI · Concourse Level 2</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {results.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass hover-lift rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{r.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.walk}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.queue}</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400" /> {r.rating}</span>
                  </div>
                </div>
                <button className="rounded-xl gradient-brand px-3 py-1.5 text-xs font-semibold text-white">Route</button>
              </div>
              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                <span className="text-[#00d4ff] font-semibold">AI: </span>{r.reason}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StadiumMap() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <linearGradient id="mg" x1="0" x2="1"><stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
      </defs>
      <rect width="400" height="400" fill="rgba(255,255,255,0.02)" />
      {[...Array(10)].map((_, i) => (
        <line key={`h${i}`} x1="0" x2="400" y1={i * 40} y2={i * 40} stroke="rgba(255,255,255,0.04)" />
      ))}
      {[...Array(10)].map((_, i) => (
        <line key={`v${i}`} y1="0" y2="400" x1={i * 40} x2={i * 40} stroke="rgba(255,255,255,0.04)" />
      ))}
      <ellipse cx="200" cy="200" rx="150" ry="100" fill="none" stroke="url(#mg)" strokeWidth="2" opacity="0.5" />
      <ellipse cx="200" cy="200" rx="80" ry="50" fill="none" stroke="url(#mg)" strokeWidth="1.5" opacity="0.6" />
      {[{ x: 130, y: 130 }, { x: 270, y: 140 }, { x: 300, y: 260 }, { x: 100, y: 270 }].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="12" fill="#00d4ff" opacity="0.2" className="pulse-dot" />
          <circle cx={p.x} cy={p.y} r="5" fill="#00d4ff" />
        </g>
      ))}
      <circle cx="200" cy="320" r="8" fill="#7c3aed" />
      <text x="200" y="345" textAnchor="middle" className="fill-white/70" fontSize="10">YOU</text>
    </svg>
  );
}