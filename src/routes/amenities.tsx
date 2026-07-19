import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Search, Leaf, Circle, ShieldCheck, ShoppingBag, HeartPulse, Droplet, Accessibility, Star, Clock, Users } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/amenities")({
  head: () => ({ meta: [{ title: "Amenities — StadiumAI" }, { name: "description", content: "Find food, restrooms, medical, and more with AI." }] }),
  component: AmenitiesPage,
});

const filters = [
  { key: "veg", labelKey: "amenities.filter.veg" as const, icon: Leaf },
  { key: "halal", labelKey: "amenities.filter.halal" as const, icon: Circle },
  { key: "rest", labelKey: "amenities.filter.rest" as const, icon: ShieldCheck },
  { key: "merch", labelKey: "amenities.filter.merch" as const, icon: ShoppingBag },
  { key: "med", labelKey: "amenities.filter.med" as const, icon: HeartPulse },
  { key: "water", labelKey: "amenities.filter.water" as const, icon: Droplet },
  { key: "a11y", labelKey: "amenities.filter.a11y" as const, icon: Accessibility },
] as const;

const results = [
  { name: "Green Kitchen", walkMin: 4, queueLevel: "short" as const, queueMin: 2, rating: 4.8, reasonKey: "amenities.reason.greenKitchen" as const },
  { name: "Halal House", walkMin: 6, queueLevel: "medium" as const, queueMin: 5, rating: 4.7, reasonKey: "amenities.reason.halalHouse" as const },
  { name: "The Field Cafe", walkMin: 3, queueLevel: "short" as const, queueMin: 3, rating: 4.6, reasonKey: "amenities.reason.fieldCafe" as const },
  { name: "Fresh Squeeze", walkMin: 5, queueLevel: "none" as const, queueMin: 0, rating: 4.9, reasonKey: "amenities.reason.freshSqueeze" as const },
];

function AmenitiesPage() {
  const { t } = useT();
  const [active, setActive] = useState<string[]>(["veg"]);

  function queueLabel(level: "short" | "medium" | "none", min: number) {
    if (level === "none") return t("amenities.queueLevel.none");
    return `${t(`amenities.queueLevel.${level}` as const)} (${min} ${t("common.min")})`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t("amenities.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("amenities.subtitle")}</p>
      </div>

      <div className="glass rounded-2xl p-2 flex items-center gap-2">
        <Search className="ml-3 h-4 w-4 text-muted-foreground" />
        <input placeholder={t("amenities.searchPlaceholder")} className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" />
        <button className="rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">{t("amenities.search")}</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const on = active.includes(f.key);
          return (
            <button
              key={f.key}
              onClick={() => setActive((a) => (a.includes(f.key) ? a.filter((x) => x !== f.key) : [...a, f.key]))}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                on ? "border-[#00d4ff]/60 bg-[#00d4ff]/10 text-white glow-ring" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {t(f.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass rounded-3xl p-4 h-[500px] relative overflow-hidden">
          <div className="absolute inset-0"><StadiumMap you={t("amenities.you")} /></div>
          <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-3 flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs">
              <div className="font-semibold">{t("amenities.mapBadgeTitle")}</div>
              <div className="text-muted-foreground">{t("amenities.mapBadgeSubtitle")}</div>
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
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.walkMin} {t("common.min")}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {queueLabel(r.queueLevel, r.queueMin)}</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400" /> {r.rating}</span>
                  </div>
                </div>
                <button className="rounded-xl gradient-brand px-3 py-1.5 text-xs font-semibold text-white">{t("amenities.route")}</button>
              </div>
              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                <span className="text-[#00d4ff] font-semibold">{t("amenities.aiLabel")} </span>
                {t(r.reasonKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StadiumMap({ you }: { you: string }) {
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
      <text x="200" y="345" textAnchor="middle" className="fill-white/70" fontSize="10">{you}</text>
    </svg>
  );
}