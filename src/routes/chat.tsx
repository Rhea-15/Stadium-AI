import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, User, Database, Star } from "lucide-react";
import { chatWithAssistant, type ChatReply } from "@/lib/ai";
import { getSession } from "@/lib/session";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Assistant — StadiumAI" }, { name: "description", content: "Multilingual AI stadium assistant." }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "ai"; text: string; meta?: Omit<ChatReply, "text">; error?: boolean };

function ChatPage() {
  const { t, language } = useT();
  const session = getSession();
  const chips = [
    t("chat.chip.food"),
    t("chat.chip.restroom"),
    t("chat.chip.crowd"),
    t("chat.chip.route"),
    t("chat.chip.wheelchair"),
  ];

  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: t("chat.greeting") }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  async function send(text: string) {
    if (!text.trim() || typing) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    try {
      const reply = await chatWithAssistant({
        data: { message: text, language, section: session.section },
      });
      setMessages((m) => [
        ...m,
        { role: "ai", text: reply.text, meta: { reasoning: reply.reasoning, sources: reply.sources, confidence: reply.confidence } },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: e instanceof Error ? e.message : "Something went wrong reaching the AI.", error: true },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          {t("chat.titleLead")} <span className="gradient-text">{t("chat.titleHighlight")}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">{t("chat.subtitle")}</p>
      </div>

      <div className="glass-strong rounded-3xl overflow-hidden flex flex-col h-[75vh]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {t("chat.titleLead")} {t("chat.titleHighlight")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("chat.online")} · {language}
              </div>
            </div>
          </div>
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
                    {t("chat.thinking")}
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
            placeholder={t("chat.placeholder")}
            className="flex-1 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#00d4ff]/50 transition"
          />
          <button type="submit" disabled={typing} className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-lg shadow-cyan-500/30 disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const { t } = useT();
  const isUser = msg.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-brand">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      {/* order-* is a logical property (flex order), not physical left/right, so it
          already stays correct under dir="rtl" — no rtl: variant needed here. */}
      <div className={`max-w-[80%] ${isUser ? "order-1" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "gradient-brand text-white" : msg.error ? "glass border border-red-500/30" : "glass"}`}>
          {msg.text}
        </div>
        {msg.meta && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#00d4ff] font-semibold">
                <Sparkles className="h-3 w-3" /> {t("chat.reasoningLabel")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{msg.meta.reasoning}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#00d4ff] font-semibold">
                <Database className="h-3 w-3" /> {t("chat.sourcesLabel")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{msg.meta.sources.join(" · ")}</div>
            </div>
            <div className="glass rounded-xl p-3 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#00d4ff] font-semibold">
                <Star className="h-3 w-3" /> {t("chat.confidenceLabel")} — {msg.meta.confidence}%
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full gradient-brand" style={{ width: `${msg.meta.confidence}%` }} />
              </div>
            </div>
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