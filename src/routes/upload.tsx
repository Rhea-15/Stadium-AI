import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Sparkles, Loader2, FileText } from "lucide-react";
import { analyzeUploadedData, type CsvAnalysis } from "@/lib/ai";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Judge Data Upload — StadiumAI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const { t } = useT();
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<CsvAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setCsvText(await file.text());
    setResult(null);
  }

  async function analyze() {
    if (!csvText || !question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeUploadedData({ data: { csvText, question } });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          {t("upload.titleLead")} <span className="gradient-text">{t("upload.titleHighlight")}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">{t("upload.subtitle")}</p>
      </div>

      <div className="glass-strong rounded-3xl p-6 space-y-4">
        <label className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-6 cursor-pointer hover:border-[#00d4ff]/40 transition">
          <Upload className="h-5 w-5 text-[#00d4ff]" />
          <div className="text-sm">
            {fileName ? (
              <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> {fileName}</span>
            ) : (
              t("upload.clickSelect")
            )}
          </div>
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
        </label>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("upload.questionPlaceholder")}
          rows={2}
          className="w-full rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#00d4ff]/50 transition"
        />

        <button
          onClick={analyze}
          disabled={!csvText || !question.trim() || loading}
          className="inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {t("upload.analyze")}
        </button>

        {error && <div className="text-sm text-red-300">{error}</div>}

        {result && (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-xs text-muted-foreground">
              {t("upload.parsedRows", { rows: result.rowCount, cols: result.columnsDetected.join(", ") })}
            </div>
            <div className="text-sm leading-relaxed">{result.answer}</div>
            <div className="text-xs text-muted-foreground border-t border-white/5 pt-3">
              <span className="text-[#00d4ff] font-semibold">{t("upload.reasoningLabel")} </span>
              {result.reasoning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}