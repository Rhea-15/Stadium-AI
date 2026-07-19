import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, User, Database, MapPin, Star } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Assistant — StadiumAI" }, { name: "description", content: "Multilingual AI stadium assistant." }] }),
  component: ChatPage,
});

const chips = [
  "Where is vegetarian food?",
  "Nearest restroom",
  "How crowded is Gate B?",
  "Fastest route",
  "Wheelchair entrance",
];

type Msg = { role: "user" | "ai"; text: string; meta?: { reasoning: string; sources: string[]; nearby: string[]; confidence: number } };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hola! I'm your AI Stadium Assistant. Ask me anything — food, gates, routes, restrooms. I speak 7 languages." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "The nearest vegetarian outlet from your seat is Green Kitchen on Concourse Level 2, ~4 min walk with a very short queue.",
          meta: {
            reasoning: "Cross-referenced your seat (Sec 112, Row F) with live queue data and dietary filters. Green Kitchen scored highest on proximity + wait time.",
            sources: ["Live Vendor Feed", "Stadium Map v2.6", "Queue Sensors"],
            nearby: ["Restroom C2-04 (1 min)", "Water Station 2A", "Merch Kiosk"],
            confidence: 94,
          },
        },
      ]);
    }, 1400);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          AI <span className="gradient-text">Stadium Assistant</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Real-time, multilingual, context-aware.</p>
      </div>

      <div className="glass-strong rounded-3xl overflow-hidden flex flex-col h-[75vh]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">AI Stadium Assistant</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · 7 languages
              </div>
            </div>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">GPT-Stadium · v4</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="glass rounded-2xl px-4 py-3 max-w-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#00d4ff]" />
                    Thinking through venue data...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 pb-3 flex gap-2 overflow-x-auto">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs hover:bg-white/[0.08] hover:border-[#00d4ff]/40 transition"
            >
              {c}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-white/5 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the stadium..."
            className="flex-1 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#00d4ff]/50 transition"
          />
          <button type="submit" className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-lg shadow-cyan-500/30">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "order-1" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "gradient-brand text-white" : "glass"}`}>
          {msg.text}
        </div>
        {msg.meta && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <MetaCard icon={Sparkles} label="Reasoning" text={msg.meta.reasoning} />
            <MetaCard icon={Database} label="Sources Used" text={msg.meta.sources.join(" · ")} />
            <MetaCard icon={MapPin} label="Nearby Facilities" text={msg.meta.nearby.join(" · ")} />
            <MetaCard icon={Star} label="Confidence" text={`${msg.meta.confidence}%`} confidence={msg.meta.confidence} />
          </div>
        )}
      </div>
      {isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] order-2">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </motion.div>
  );
}

function MetaCard({ icon: Icon, label, text, confidence }: { icon: React.ComponentType<{ className?: string }>; label: string; text: string; confidence?: number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#00d4ff] font-semibold">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{text}</div>
      {confidence !== undefined && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full gradient-brand" style={{ width: `${confidence}%` }} />
        </div>
      )}
    </div>
  );
}