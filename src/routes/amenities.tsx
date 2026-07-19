import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Leaf, Circle, ShieldCheck, ShoppingBag, HeartPulse, Droplet, Accessibility, Star, Clock, Users, Loader2, X } from "lucide-react";
import { amenitySearch, type AmenitySearchResult } from "@/lib/ai";
import { getSession } from "@/lib/session";
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

function queueLevelFor(min: number): "short" | "medium" | "none" {
  if (min <= 0) return "none";
  if (min <= 3) return "short";
  return "medium";
}

// Dynamic mock data that changes based on filters
const mockAmenityData: Record<string, AmenitySearchResult[]> = {
  veg: [
    { id: "1", name: "Green Kitchen", walkMin: 4, queueMin: 2, rating: 4.8, reason: "Nearest vegetarian outlet to Gate D with less than 5 min expected waiting." },
    { id: "2", name: "Field Cafe", walkMin: 7, queueMin: 1, rating: 4.6, reason: "Closest sit-down spot with vegetarian and gluten-free options." },
  ],
  halal: [
    { id: "3", name: "Halal House", walkMin: 5, queueMin: 3, rating: 4.9, reason: "Fully certified Halal menu with the highest fan rating on Concourse 2." },
    { id: "4", name: "Spice Corner", walkMin: 8, queueMin: 4, rating: 4.7, reason: "Premium halal dining with authentic Middle Eastern cuisine." },
  ],
  rest: [
    { id: "5", name: "Concourse 2 Restroom", walkMin: 2, queueMin: 0, rating: 4.5, reason: "Nearest accessible restroom with modern facilities." },
    { id: "6", name: "VIP Facilities", walkMin: 10, queueMin: 0, rating: 4.9, reason: "Premium restroom facilities near premium seating." },
  ],
  merch: [
    { id: "7", name: "Official Store", walkMin: 3, queueMin: 5, rating: 4.6, reason: "Complete official merchandise collection and apparel." },
    { id: "8", name: "Vintage Kiosk", walkMin: 6, queueMin: 2, rating: 4.4, reason: "Rare collectibles and vintage memorabilia." },
  ],
  med: [
    { id: "9", name: "Medical Station A", walkMin: 3, queueMin: 1, rating: 4.8, reason: "Full medical facility with trained staff available 24/7." },
    { id: "10", name: "First Aid Kiosk", walkMin: 5, queueMin: 0, rating: 4.6, reason: "Quick response first aid and emergency supplies." },
  ],
  water: [
    { id: "11", name: "Fresh Squeeze", walkMin: 4, queueMin: 0, rating: 4.9, reason: "Zero-queue juice bar near Section 112 — freshly pressed." },
    { id: "12", name: "Water Station", walkMin: 2, queueMin: 0, rating: 4.7, reason: "Cold filtered water available at multiple points." },
  ],
  a11y: [
    { id: "13", name: "Accessible Entrance", walkMin: 1, queueMin: 0, rating: 4.9, reason: "Step-free accessible gate with wheelchair accommodation." },
    { id: "14", name: "Companion Assistance", walkMin: 3, queueMin: 0, rating: 4.8, reason: "Staff trained in disability support and accessibility." },
  ],
};

function AmenitiesPage() {
  const { t } = useT();
  const session = getSession();
  const [active, setActive] = useState<string[]>(["veg"]);
  const [results, setResults] = useState<AmenitySearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [badgeCount, setBadgeCount] = useState(4);
  const [badgeConcourse, setBadgeConcourse] = useState("Concourse Level 2");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (!cancelled) {
          // Get mock data based on active filters
          let filteredResults: AmenitySearchResult[] = [];
          
          active.forEach(filter => {
            const filterData = mockAmenityData[filter] || [];
            filteredResults = [...filteredResults, ...filterData];
          });

          // Update badge dynamically
          setBadgeCount(filteredResults.length);
          
          setResults(filteredResults);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load live amenities.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [active]);

  function queueLabel(min: number) {
    const level = queueLevelFor(min);
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
        <Search className="h-4 w-4 text-muted-foreground shrink-0" style={{ marginInlineStart: '12px' }} />
        <input 
          placeholder={t("amenities.searchPlaceholder")} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" 
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="p-1 text-muted-foreground hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button className="rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white shrink-0">{t("amenities.search")}</button>
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
        {/* Stadium Map with Heat Distribution */}
        <div className="glass rounded-3xl p-4 h-[500px] relative overflow-hidden">
          <div className="absolute inset-0"><StadiumHeatMap amenityCount={badgeCount} filterType={active[0] || "veg"} /></div>
          <div className="absolute bottom-4 start-4 end-4 glass rounded-2xl p-3 flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand shrink-0">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs min-w-0">
              <div className="font-semibold">{badgeCount} {t("amenities.mapBadgeTitle").split(" ").slice(1).join(" ")}</div>
              <div className="text-muted-foreground truncate">{t("amenities.mapBadgeSubtitle")}</div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {error && (
            <div className="glass-strong rounded-2xl p-5 border border-red-500/30 text-sm text-red-300">{error}</div>
          )}

          {loading && !results.length && (
            <div className="glass-strong rounded-3xl p-10 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("gate.loading")}
            </div>
          )}

          {!loading && !error && !results.length && (
            <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
              No live amenities match the selected filters right now.
            </div>
          )}

          {results.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass hover-lift rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold">{r.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 shrink-0"><Clock className="h-3.5 w-3.5" /> {r.walkMin} {t("common.min")}</span>
                    <span className="inline-flex items-center gap-1 shrink-0"><Users className="h-3.5 w-3.5" /> {queueLabel(r.queueMin)}</span>
                    <span className="inline-flex items-center gap-1 shrink-0"><Star className="h-3.5 w-3.5 text-yellow-400" /> {r.rating}</span>
                  </div>
                </div>
                <button className="rounded-xl gradient-brand px-3 py-1.5 text-xs font-semibold text-white shrink-0">{t("amenities.route")}</button>
              </div>
              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs text-muted-foreground">
                <span className="text-[#00d4ff] font-semibold">{t("amenities.aiLabel")} </span>
                {r.reason}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Heat map visualization for amenities
function StadiumHeatMap({ amenityCount, filterType }: { amenityCount: number; filterType: string }) {
  // Generate dynamic dots based on amenity count
  const generateDots = () => {
    const positions = [
      { x: 130, y: 130 }, { x: 270, y: 140 }, { x: 300, y: 260 }, { x: 100, y: 270 },
      { x: 200, y: 200 }, { x: 150, y: 250 }, { x: 320, y: 180 }, { x: 80, y: 160 }
    ];
    return positions.slice(0, Math.min(amenityCount, positions.length));
  };

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <linearGradient id="mg" x1="0" x2="1"><stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
        <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Grid background */}
      <rect width="400" height="400" fill="rgba(255,255,255,0.02)" />
      {[...Array(10)].map((_, i) => (
        <line key={`h${i}`} x1="0" x2="400" y1={i * 40} y2={i * 40} stroke="rgba(255,255,255,0.04)" />
      ))}
      {[...Array(10)].map((_, i) => (
        <line key={`v${i}`} y1="0" y2="400" x1={i * 40} x2={i * 40} stroke="rgba(255,255,255,0.04)" />
      ))}
      
      {/* Stadium field ellipses */}
      <ellipse cx="200" cy="200" rx="150" ry="100" fill="none" stroke="url(#mg)" strokeWidth="2" opacity="0.5" />
      <ellipse cx="200" cy="200" rx="80" ry="50" fill="none" stroke="url(#mg)" strokeWidth="1.5" opacity="0.6" />
      
      {/* Heat zones for amenities */}
      {generateDots().map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="20" fill="url(#heatGradient)" />
          <circle cx={p.x} cy={p.y} r="12" fill="#00d4ff" opacity="0.2" className="pulse-dot" />
          <circle cx={p.x} cy={p.y} r="5" fill="#00d4ff" />
        </g>
      ))}
      
      {/* User position */}
      <circle cx="200" cy="320" r="8" fill="#7c3aed" />
      <text x="200" y="345" textAnchor="middle" className="fill-white/70" fontSize="10">{/* YOU */}</text>
    </svg>
  );
}