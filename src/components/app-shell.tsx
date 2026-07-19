import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, MapPin, MessageSquareText, Utensils, LayoutDashboard, Accessibility,
  Bell, Globe, ChevronLeft, ChevronRight, Sparkles, User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const nav = [
  { to: "/", label: "Onboarding", icon: Home },
  { to: "/gate", label: "Smart Gate", icon: MapPin },
  { to: "/chat", label: "AI Assistant", icon: MessageSquareText },
  { to: "/amenities", label: "Amenities", icon: Utensils },
  { to: "/dashboard", label: "Live Dashboard", icon: LayoutDashboard },
  { to: "/accessibility", label: "Accessibility", icon: Accessibility },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex min-h-screen w-full text-foreground">
      {/* Floating blurred background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="float-blob absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#00d4ff]/20 blur-[120px]" />
        <div className="float-blob absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#7c3aed]/25 blur-[140px]" style={{ animationDelay: "3s" }} />
        <div className="float-blob absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#00d4ff]/15 blur-[130px]" style={{ animationDelay: "6s" }} />
      </div>

      {/* Sidebar */}
      <aside
        className={`glass sticky top-0 z-30 hidden h-screen shrink-0 flex-col justify-between border-r border-white/5 p-4 transition-all duration-300 md:flex ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div>
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-bold tracking-tight">StadiumAI</div>
                <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">FIFA WC 2026</div>
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-white/[0.06] text-white glow-ring"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r gradient-brand" />
                  )}
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#00d4ff]" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground hover:text-white transition"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </aside>

      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Top nav */}
        <header className="glass sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden grid h-9 w-9 place-items-center rounded-xl gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-muted-foreground">Live · Estadio Azteca</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs hover:bg-white/[0.06] transition">
              <Globe className="h-3.5 w-3.5" /> <span>EN</span>
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#00d4ff] pulse-dot" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-white">
              <User className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="glass sticky bottom-0 z-20 flex md:hidden justify-around border-t border-white/5 py-2">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${active ? "text-[#00d4ff]" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Floating AI button */}
      <motion.button
        onClick={() => setAiOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-5 md:bottom-8 md:right-8 z-40 grid h-14 w-14 place-items-center rounded-full gradient-brand shadow-2xl shadow-cyan-500/40"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6 text-white" />
        <span className="absolute inset-0 rounded-full pulse-dot border border-white/40" />
      </motion.button>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass-strong fixed bottom-40 right-5 md:bottom-28 md:right-8 z-40 w-[320px] rounded-3xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[#00d4ff]" />
              <span className="text-sm font-semibold">AI Quick Assist</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Ask anything about the stadium — gates, food, seats, accessibility.</p>
            <Link to="/chat" onClick={() => setAiOpen(false)} className="block w-full rounded-xl gradient-brand py-2.5 text-center text-sm font-semibold text-white">
              Open Full Chat
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}