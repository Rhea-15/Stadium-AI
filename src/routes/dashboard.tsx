import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Users, Activity, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, AreaChart, Area } from "recharts";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Live Stadium Dashboard — StadiumAI" }, { name: "description", content: "Real-time stadium analytics." }] }),
  component: DashboardPage,
});

const gateData = [
  { name: "A", value: 62 }, { name: "B", value: 78 }, { name: "C", value: 85 },
  { name: "D", value: 40 }, { name: "E", value: 55 }, { name: "F", value: 30 },
];
const concourseData = Array.from({ length: 12 }).map((_, i) => ({ t: `${i * 5}m`, v: 30 + Math.round(Math.sin(i / 2) * 20 + Math.random() * 15) }));
const foodQueue = Array.from({ length: 10 }).map((_, i) => ({ t: `${i}`, v: 2 + Math.round(Math.random() * 8) }));

function DashboardPage() {
  const { t } = useT();

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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi icon={Users} label={t("dashboard.kpi.attendance")} value="78,241" delta="+412" tone="cyan" />
        <Kpi icon={Activity} label={t("dashboard.kpi.density")} value="62%" delta={t("dashboard.delta.moderate")} tone="violet" />
        <Kpi icon={Clock} label={t("dashboard.kpi.avgWait")} value="4.2m" delta="-0.8m" tone="cyan" />
        <Kpi icon={AlertTriangle} label={t("dashboard.kpi.alerts")} value="0" delta={t("dashboard.delta.allClear")} tone="emerald" />
        <Kpi icon={Sparkles} label={t("dashboard.kpi.aiConfidence")} value="96%" delta={t("dashboard.delta.high")} tone="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={t("dashboard.chart.gateCapacity.title")} subtitle={t("dashboard.chart.gateCapacity.subtitle")}>
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