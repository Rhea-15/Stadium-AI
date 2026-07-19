import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Navigation, Sparkles, Loader2 } from "lucide-react";
import { recommendGate, type GateRecommendation } from "@/lib/ai";
import { getSession } from "@/lib/session";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/gate")({
  head: () => ({
    meta: [
      { title: "Smart Gate Recommendation — StadiumAI" },
      { name: "description", content: "AI-recommended stadium entry gate based on real-time crowd density." },
    ],
  }),
  component: GatePage,
});

function GatePage() {
  const { t } = useT();
  const [rec, setRec] = useState<GateRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = getSession();

  async function fetchRecommendation() {
    setLoading(true);
    setError(null);
    try {
      const result = await recommendGate({
        data: { section: session.section, accessibility: session.accessibility },
      });
      setRec(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get AI recommendation.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t("gate.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("gate.subtitle", { section: session.section })}</p>
      </div>

      {error && (
        <div className="glass-strong rounded-2xl p-5 border border-red-500/30 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !rec && (
        <div className="glass-strong rounded-3xl p-10 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("gate.loading")}
        </div>
      )}

      {rec && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8"
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#00d4ff]/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#7c3aed]/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[#00d4ff]" /> {t("gate.recommended")}
            </div>
            <h2 className="mt-2 text-6xl md:text-7xl font-black tracking-tight gradient-text">
              Gate {rec.recommendedGate}
            </h2>

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00d4ff] mb-2">
                <Sparkles className="h-3.5 w-3.5" /> {t("gate.reasoning")}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{rec.reasoning}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {rec.alternatives.map((alt) => (
                <div key={alt.gate} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="text-sm font-semibold mb-2">Gate {alt.gate}</div>
                  {alt.pros.map((p) => (
                    <div key={p} className="text-xs text-emerald-300">+ {p}</div>
                  ))}
                  {alt.cons.map((c) => (
                    <div key={c} className="text-xs text-red-300">− {c}</div>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={fetchRecommendation}
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {t("gate.recheck")}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}