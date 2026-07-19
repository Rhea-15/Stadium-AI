import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Navigation, Sparkles, Clock, Users, Check, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/gate")({
  head: () => ({
    meta: [
      { title: "Smart Gate Recommendation — StadiumAI" },
      { name: "description", content: "AI-recommended stadium entry gate based on real-time crowd density and walking time." },
    ],
  }),
  component: GatePage,
});

const gates = [
  { name: "Gate A", cap: 62, color: "#facc15" },
  { name: "Gate B", cap: 78, color: "#fb923c" },
  { name: "Gate C", cap: 85, color: "#ef4444" },
  { name: "Gate D", cap: 40, color: "#10b981", recommended: true },
  { name: "Gate E", cap: 55, color: "#facc15" },
  { name: "Gate F", cap: 30, color: "#10b981" },
];

const alternatives = [
  {
    name: "Gate C",
    pros: ["Closest walk (3 min)", "Direct to Section 112"],
    cons: ["High congestion (85%)", "Est. 12 min wait"],
    eta: "15 min",
  },
  {
    name: "Gate F",
    pros: ["Very low crowd (30%)", "Scenic route"],
    cons: ["Longer walk (9 min)"],
    eta: "11 min",
  },
];

function GatePage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Smart Gate Recommendation" subtitle="AI-optimized entry based on live crowd data" />

      {/* Hero recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8"
      >
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#00d4ff]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-3xl" />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] items-start">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[#00d4ff]" /> Recommended Gate
            </div>
            <div className="mt-2 flex items-end gap-4">
              <h2 className="text-6xl md:text-7xl font-black tracking-tight gradient-text">Gate D</h2>
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Optimal
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
              <Stat icon={Clock} label="Estimated Walk" value="5 min" />
              <Stat icon={Users} label="Crowd" value="40%" />
            </div>

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00d4ff] mb-2">
                <Sparkles className="h-3.5 w-3.5" /> AI Reasoning
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Gate D is currently operating at only <span className="font-bold text-white">40% capacity</span> while Gate C is already at <span className="font-bold text-white">85%</span>. Although Gate D requires a two-minute longer walk, you will likely save over <span className="font-bold text-white">6 minutes</span> by avoiding congestion.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition">
                <Navigation className="h-4 w-4" /> Navigate
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold hover:bg-white/[0.08] transition">
                Show Alternatives <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Circular gauge */}
          <div className="hidden md:block">
            <CrowdGauge value={40} />
          </div>
        </div>
      </motion.div>

      {/* Live crowd heatmap */}
      <section>
        <SectionTitle>Live Crowd Heatmap</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gates.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass hover-lift rounded-2xl p-4 ${g.recommended ? "glow-ring" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{g.name}</div>
                <span className="pulse-dot h-2 w-2 rounded-full" style={{ background: g.color }} />
              </div>
              <div className="mt-3 text-2xl font-black">{g.cap}%</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: `${g.cap}%`, background: g.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Alternatives */}
      <section>
        <SectionTitle>Alternative Routes</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {alternatives.map((a) => (
            <div key={a.name} className="glass hover-lift rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">{a.name}</div>
                <div className="text-xs text-muted-foreground">ETA <span className="text-white font-semibold">{a.eta}</span></div>
              </div>
              <div className="mt-4 grid gap-2">
                {a.pros.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-400" /> {p}
                  </div>
                ))}
                {a.cons.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-rose-400" /> {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function CrowdGauge({ value }: { value: number }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width="180" height="180" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="gg" x1="0" x2="1">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle cx="80" cy="80" r={r} fill="none" stroke="url(#gg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 80 80)" />
      <text x="80" y="82" textAnchor="middle" className="fill-white font-bold" fontSize="28">{value}%</text>
      <text x="80" y="102" textAnchor="middle" className="fill-white/60" fontSize="10">CAPACITY</text>
    </svg>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{children}</h3>;
}