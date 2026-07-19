import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Users, Activity, Clock, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, AreaChart, Area } from "recharts";
import { useT } from "@/lib/i18n";
import { getLiveVenueSnapshot } from "@/lib/ai";
import type { Gate, Amenity, Announcement } from "@/lib/data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Live Stadium Dashboard — StadiumAI" }, { name: "description", content: "Real-time stadium analytics." }] }),
  component: DashboardPage,
});

// These two charts aren't part of the live gate/amenity model (data.ts has no
// concourse-density or per-minute food-queue time series) — left as
// demo/random series like before. Only the Gate Capacity chart and the KPIs
// that ARE backed by real fields (density, avg wait, alerts) below now come
// from the same getLiveVenueSnapshot() that gate.tsx's recommendation uses.
const concourseData = Array.from({ length: 12 }).map((_, i) => ({ t: `${i * 5}m`, v: 30 + Math.round(Math.sin(i / 2) * 20 + Math.random() * 15) }));
const foodQueue = Array.from({ length: 10 }).map((_, i) => ({ t: `${i}`, v: 2 + Math.round(Math.random() * 8) }));

type Snapshot = { gates: Gate[]; amenities: Amenity[]; announcements: Announcement[] };

function DashboardPage() {
  const { t } = useT();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getLiveVenueSnapshot();
        if (!cancelled) {
          setSnapshot(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load live venue data.");
      }
    }
    load();
    // Same 6s window the underlying data.ts time-bucket drifts on, so the
    // dashboard stays in step with whatever gate.tsx/chat.tsx just fetched.
    const id = setInterval(load, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const gateData = (snapshot?.gates ?? []).map((g) => ({ name: g.id, value: g.capacityPct }));
  const avgDensity = gateData.length ? Math.round(gateData.reduce((s, g) => s + g.value, 0) / gateData.length) : null;
  const avgWaitMin = snapshot?.gates.length
    ? Math.round((snapshot.gates.reduce((s, g) => s + g.waitMin, 0) / snapshot.gates.length) * 10) / 10
    : null;
  const activeAlerts = snapshot?.announcements.filter((a) => a.priority !== "info").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t("dashboard.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("dashboard.streaming")}
        </div>
      </div>

      {error && (
        <div className="glass-strong rounded-2xl p-5 border border-red-500/30 text-sm text-red-300">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* No attendance data source exists in data.ts yet — left as a
            static placeholder rather than fabricating a live headcount. */}
        <Kpi icon={Users} label={t("dashboard.kpi.attendance")} value="78,241" delta="+412" tone="cyan" />
        <Kpi
          icon={Activity}
          label={t("dashboard.kpi.density")}
          value={avgDensity === null ? "—" : `${avgDensity}%`}
          delta={t("dashboard.delta.moderate")}
          tone="violet"
        />
        <Kpi
          icon={Clock}
          label={t("dashboard.kpi.avgWait")}
          value={avgWaitMin === null ? "—" : `${avgWaitMin}m`}
          delta={t("dashboard.delta.moderate")}
          tone="cyan"
        />
        <Kpi
          icon={AlertTriangle}
          label={t("dashboard.kpi.alerts")}
          value={String(activeAlerts)}
          delta={activeAlerts === 0 ? t("dashboard.delta.allClear") : t("dashboard.delta.moderate")}
          tone={activeAlerts === 0 ? "emerald" : "violet"}
        />
        {/* No AI-confidence signal is emitted by the live server functions
            (recommendGate/amenitySearch return reasoning text, not a score
            for the whole venue) — left as a static placeholder too. */}
        <Kpi icon={Sparkles} label={t("dashboard.kpi.aiConfidence")} value="96%" delta={t("dashboard.delta.high")} tone="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={t("dashboard.chart.gateCapacity.title")} subtitle={t("dashboard.chart.gateCapacity.subtitle")}>
          {!snapshot ? (
            <div className="flex h-[220px] items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("gate.loading")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gateData}>
                <defs>
                  <linearGradient id="bg1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(20,24,36,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="url(#bg1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title={t("dashboard.chart.concourse.title")} subtitle={t("dashboard.chart.concourse.subtitle")}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={concourseData}>
              <defs>
                <linearGradient id="ag1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(20,24,36,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={2} fill="url(#ag1)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("dashboard.chart.foodQueue.title")} subtitle={t("dashboard.chart.foodQueue.subtitle")}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={foodQueue}>
              <XAxis dataKey="t" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(20,24,36,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: string; tone: "cyan" | "violet" | "emerald" }) {
  const toneMap = { cyan: "text-[#00d4ff]", violet: "text-[#a78bfa]", emerald: "text-emerald-400" };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass hover-lift rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${toneMap[tone]}`} />
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>
      <div className="mt-3 text-2xl font-black tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-2 text-[10px] ${toneMap[tone]}`}>{delta}</div>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#00d4ff]" />
      </div>
      {children}
    </div>
  );
}