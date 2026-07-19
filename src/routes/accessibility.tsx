import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Accessibility, Volume2, AlertOctagon, Type, Contrast, Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/accessibility")({
  head: () => ({ meta: [{ title: "Accessibility Mode — StadiumAI" }, { name: "description", content: "Step-free routes, live captions, and emergency assistance." }] }),
  component: A11yPage,
});

const captions = [
  "Welcome to Estadio Azteca. Kickoff in 12 minutes.",
  "Wheelchair-accessible entrance is Gate D, ramp 3.",
  "Section 112 elevator is currently operational.",
  "Medical station is located near Concourse 2, west wing.",
];

const announcements = [
  { time: "14:02", text: "Gate D ramp reopened for wheelchair access." },
  { time: "13:55", text: "Live captions now available in 7 languages." },
  { time: "13:40", text: "Companion assistance available at Info Desk B." },
];

function A11yPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-3 py-1 text-xs font-semibold text-[#00d4ff]">
          <Accessibility className="h-3.5 w-3.5" /> Accessibility Mode Active
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">Designed for Everyone.</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">Larger text, higher contrast, step-free routes, live captions and instant emergency assistance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Toggle icon={Type} label="Larger Text" on />
        <Toggle icon={Contrast} label="High Contrast" on />
        <Toggle icon={Volume2} label="Live Captions" on />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <RouteIcon className="h-4 w-4 text-[#00d4ff]" /> Step-Free Path Visualization
          </div>
          <div className="aspect-[16/10] rounded-2xl border border-white/8 bg-white/[0.02] p-3">
            <StepFreePath />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[{ k: "Entrance", v: "Gate D" }, { k: "Elevator", v: "E-2 (Op)" }, { k: "Seat", v: "Sec 112" }].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</div>
                <div className="mt-1 text-lg font-bold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Volume2 className="h-4 w-4 text-[#00d4ff]" /> Live Captions
              <span className="ml-auto pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {captions.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-base">
                  {c}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-semibold mb-3">Announcements Feed</div>
            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.time} className="flex gap-3 text-sm">
                  <span className="text-[#00d4ff] font-mono text-xs shrink-0 mt-0.5">{a.time}</span>
                  <span className="text-muted-foreground">{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 py-5 text-lg font-bold text-white shadow-lg shadow-rose-500/40 flex items-center justify-center gap-2 hover:shadow-rose-500/60 transition">
            <AlertOctagon className="h-5 w-5" /> Emergency Assistance
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ icon: Icon, label, on }: { icon: React.ComponentType<{ className?: string }>; label: string; on?: boolean }) {
  return (
    <div className={`glass rounded-2xl p-4 flex items-center justify-between ${on ? "glow-ring" : ""}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#00d4ff]" />
        <span className="font-semibold">{label}</span>
      </div>
      <span className={`relative h-6 w-11 rounded-full ${on ? "gradient-brand" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-5" : "left-0.5"}`} />
      </span>
    </div>
  );
}

function StepFreePath() {
  return (
    <svg viewBox="0 0 400 250" className="h-full w-full">
      <defs>
        <linearGradient id="pg" x1="0" x2="1"><stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
      </defs>
      <path d="M 40 200 Q 100 200 140 160 Q 180 120 240 120 Q 300 120 360 60" stroke="url(#pg)" strokeWidth="4" strokeLinecap="round" fill="none" strokeDasharray="8 6" />
      <circle cx="40" cy="200" r="10" fill="#00d4ff" />
      <text x="40" y="230" textAnchor="middle" className="fill-white/70" fontSize="10">START</text>
      <circle cx="360" cy="60" r="10" fill="#7c3aed" className="pulse-dot" />
      <text x="360" y="40" textAnchor="middle" className="fill-white/70" fontSize="10">SEAT</text>
      <circle cx="200" cy="140" r="6" fill="#facc15" />
      <text x="200" y="165" textAnchor="middle" className="fill-white/70" fontSize="9">ELEVATOR</text>
    </svg>
  );
}