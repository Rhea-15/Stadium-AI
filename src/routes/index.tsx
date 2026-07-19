import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Accessibility, Type, Captions, ArrowRight, Ticket, Languages } from "lucide-react";
import { useT, LANGUAGES } from "@/lib/i18n";
import { setSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  component: Index,
});

const a11yOptions = [
  { key: "wheel", labelKey: "onboarding.a11y.wheel" as const, icon: Accessibility },
  { key: "text", labelKey: "onboarding.a11y.text" as const, icon: Type },
  { key: "caps", labelKey: "onboarding.a11y.caps" as const, icon: Captions },
] as const;

function Index() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useT();
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [seat, setSeat] = useState({ section: "", row: "", num: "" });

  function handleContinue() {
    setSession({ section: seat.section || "112", accessibility: !!toggles.wheel });
    navigate({ to: "/gate" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#00d4ff]" />
          {t("onboarding.badge")}
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
          {t("onboarding.titleLead")} <span className="gradient-text">StadiumAI</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">{t("onboarding.subtitle")}</p>

        <div className="relative mt-10 aspect-[16/9] w-full max-w-xl">
          <StadiumWireframe />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="glass-strong rounded-3xl p-6 md:p-8 space-y-7"
      >
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Languages className="h-4 w-4 text-[#00d4ff]" /> {t("onboarding.selectLanguage")}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.name}
                onClick={() => setLanguage(l.name)}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm text-left transition-all ${
                  language === l.name ? "border-[#00d4ff]/60 bg-[#00d4ff]/10 glow-ring" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="min-w-0 truncate">{l.native}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Accessibility className="h-4 w-4 text-[#00d4ff]" /> {t("onboarding.accessibility")}
          </div>
          <div className="space-y-2">
            {a11yOptions.map((o) => {
              const Icon = o.icon;
              const on = toggles[o.key];
              return (
                <button
                  key={o.key}
                  onClick={() => setToggles((tg) => ({ ...tg, [o.key]: !tg[o.key] }))}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm hover:bg-white/[0.05] transition"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {t(o.labelKey)}
                  </span>
                  <span className={`relative h-6 w-11 rounded-full transition ${on ? "gradient-brand" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-0.5"}`} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Ticket className="h-4 w-4 text-[#00d4ff]" /> {t("onboarding.yourSeat")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: "section" as const, ph: t("onboarding.section"), v: seat.section },
              { k: "row" as const, ph: t("onboarding.row"), v: seat.row },
              { k: "num" as const, ph: t("onboarding.seat"), v: seat.num },
            ].map((f) => (
              <input
                key={f.k}
                value={f.v}
                onChange={(e) => setSeat((s) => ({ ...s, [f.k]: e.target.value }))}
                placeholder={f.ph}
                className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#00d4ff]/50 focus:bg-white/[0.05] transition"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
        >
          {t("onboarding.cta")}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </motion.section>
    </div>
  );
}

function StadiumWireframe() {
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full">
      <defs>
        <linearGradient id="sg" x1="0" x2="1">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
        </linearGradient>
        <filter id="sglow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      {[...Array(6)].map((_, i) => (
        <ellipse key={i} cx="200" cy="120" rx={190 - i * 22} ry={100 - i * 12} fill="none" stroke="url(#sg)" strokeWidth="1" opacity={0.15 + i * 0.1} />
      ))}
      <ellipse cx="200" cy="120" rx="60" ry="30" fill="none" stroke="url(#sg)" strokeWidth="1.5" filter="url(#sglow)" />
      <ellipse cx="200" cy="120" rx="60" ry="30" fill="none" stroke="url(#sg)" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = 200 + Math.cos(rad) * 180;
        const y = 120 + Math.sin(rad) * 95;
        return <circle key={i} cx={x} cy={y} r="4" fill="#00d4ff" className="pulse-dot" style={{ animationDelay: `${i * 0.3}s` }} />;
      })}
    </svg>
  );
}