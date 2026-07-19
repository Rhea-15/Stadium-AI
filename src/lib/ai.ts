import { createServerFn } from "@tanstack/react-start";
import { parseCsv } from "./csv";
import {
  getLiveGates,
  getLiveAmenities,
  getLiveAnnouncements,
  getWalkMinutes,
  getAmenityRating,
  type Amenity,
} from "./data";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages: { role: string; content: string }[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to your environment — see .env.example.");
  }
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string;
}

function safeJson<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${label}: AI returned malformed JSON — ${raw.slice(0, 200)}`);
  }
}

// ---------- 1. Gate recommendation (Navigation & Crowd Management) ----------

export type GateRecommendation = {
  recommendedGate: string;
  reasoning: string;
  alternatives: { gate: string; pros: string[]; cons: string[] }[];
};

export const recommendGate = createServerFn({ method: "POST" })
  .validator((d: { section: string; accessibility: boolean }) => d)
  .handler(async ({ data }): Promise<GateRecommendation> => {
    const gates = getLiveGates();
    const eligible = data.accessibility ? gates.filter((g) => g.stepFree) : gates;
    const section = data.section?.trim() || "112";

    const system = `You are a stadium navigation reasoning engine for an 80,000-seat venue.
Given LIVE gate data (JSON) and a fan's section, recommend the single best gate right now.
Always justify the choice using the SPECIFIC numbers provided (capacity %, wait min, walk min) —
never give a generic answer, and never pick a gate purely by shortest walk if congestion makes it slower overall.
If accessibilityRequired is true, only ever recommend a stepFree gate.
Respond with ONLY this JSON shape, no markdown fencing, no extra prose:
{"recommendedGate": string, "reasoning": string (2-3 sentences, cite the numbers), "alternatives": [{"gate": string, "pros": [string], "cons": [string]}]} — exactly 2 alternatives.`;

    const user = JSON.stringify({
      fanSection: section,
      accessibilityRequired: data.accessibility,
      gates: eligible.map((g) => ({
        id: g.id,
        capacityPct: g.capacityPct,
        waitMin: g.waitMin,
        stepFree: g.stepFree,
        walkMin: getWalkMinutes(g.id, section),
      })),
    });

    const raw = await callGroq([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    return safeJson<GateRecommendation>(raw, "recommendGate");
  });

// ---------- 2. Amenity search (Amenity Finder) ----------

// Maps each filter chip in the UI to a real, checkable field on Amenity.
// "halal" and "water" have no dedicated field in the data model yet, so they
// fall back to a name match rather than fabricating a certification/utility
// flag that doesn't exist — with the current AMENITY_DEFS that means those
// two filters correctly return nothing until such an amenity is added.
const FILTER_TAG_MATCHERS: Record<string, (a: Amenity) => boolean> = {
  veg: (a) => a.dietTag === "veg" || a.dietTag === "vegan",
  halal: (a) => a.name.toLowerCase().includes("halal"),
  rest: (a) => a.type === "restroom",
  merch: (a) => a.type === "merch",
  med: (a) => a.type === "medical",
  water: (a) => a.name.toLowerCase().includes("water"),
  a11y: (a) => a.accessible,
};

export type AmenitySearchResult = {
  id: string;
  name: string;
  walkMin: number;
  queueMin: number;
  rating: number;
  reason: string;
};

export const amenitySearch = createServerFn({ method: "POST" })
  .validator((d: { activeFilters: string[]; section: string }) => d)
  .handler(async ({ data }): Promise<{ results: AmenitySearchResult[] }> => {
    const amenities = getLiveAmenities();
    const matchers = data.activeFilters.map((f) => FILTER_TAG_MATCHERS[f]).filter(Boolean);
    const filtered = matchers.length ? amenities.filter((a) => matchers.some((m) => m(a))) : amenities;

    if (!filtered.length) return { results: [] };

    // Precompute the real, authoritative numbers ourselves — the AI only
    // ranks and explains, it never gets a chance to restate (and drift) a
    // wait/walk/rating number.
    const candidates = filtered.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      dietTag: a.dietTag ?? null,
      queueMin: a.waitMin,
      walkMin: getWalkMinutes(a.nearestGate, data.section),
      accessible: a.accessible,
      rating: getAmenityRating(a.id),
    }));

    const system = `You are a stadium amenity ranking engine for an 80,000-seat venue.
Given LIVE amenity candidates (JSON), already filtered to the fan's active filter chips, choose and
order the best up to 4 by balancing shortest queue, shortest walk, and highest rating — never rank by
rating alone. Every id you return MUST come from CANDIDATES; never invent an amenity.
Respond with ONLY this JSON shape, no markdown fencing, no extra prose:
{"picks": [{"id": string, "reason": string (1-2 sentences, cite the specific numbers)}]} — ordered
best first, at most 4 items.`;

    const user = JSON.stringify({
      activeFilters: data.activeFilters,
      section: data.section,
      candidates,
    });

    const raw = await callGroq([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const parsed = safeJson<{ picks: { id: string; reason: string }[] }>(raw, "amenitySearch");

    const byId = new Map(candidates.map((c) => [c.id, c]));
    const results: AmenitySearchResult[] = parsed.picks
      .filter((p) => byId.has(p.id))
      .map((p) => {
        const c = byId.get(p.id)!;
        return {
          id: c.id,
          name: c.name,
          walkMin: c.walkMin,
          queueMin: c.queueMin,
          rating: c.rating,
          reason: p.reason,
        };
      });

    return { results };
  });

// ---------- 3. Multilingual grounded chat (Multilingual Assistance) ----------

export type ChatReply = {
  text: string;
  reasoning: string;
  sources: string[];
  confidence: number;
};

export const chatWithAssistant = createServerFn({ method: "POST" })
  .validator((d: { message: string; language: string; section: string }) => d)
  .handler(async ({ data }): Promise<ChatReply> => {
    const gates = getLiveGates();
    const amenities = getLiveAmenities();
    const announcements = getLiveAnnouncements();

    // Lightweight retrieval: only hand the model the rows relevant to the
    // question, so it's grounded in real (simulated-live) venue data instead
    // of free-associating an answer.
    const q = data.message.toLowerCase();
    const relevantAmenities = amenities.filter(
      (a) => q.includes(a.type) || (a.dietTag && q.includes(a.dietTag)) || q.includes(a.name.toLowerCase())
    );
    const context = JSON.stringify({
      gates,
      amenities: relevantAmenities.length ? relevantAmenities : amenities,
      announcements,
    });

    const system = `You are a multilingual stadium assistant at an 80,000-seat FIFA World Cup venue.
Respond NATIVELY in this language: "${data.language}" — do not translate a canned English sentence,
compose the answer directly in that language using natural, locally idiomatic phrasing.
Ground every factual claim ONLY in VENUE_DATA — never invent gate numbers, wait times, or facility
names not present in it. If VENUE_DATA doesn't cover the question, say so honestly, in that language.
Respond with ONLY this JSON shape, no markdown:
{"text": string (answer, written in ${data.language}), "reasoning": string (English, how you used the data), "sources": [string], "confidence": number 0-100}`;

    const user = `VENUE_DATA: ${context}\n\nFan's section: ${data.section}\nFan's question: ${data.message}`;

    const raw = await callGroq([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    return safeJson<ChatReply>(raw, "chatWithAssistant");
  });

// ---------- 4. Judge-supplied data upload (functional evaluation requirement) ----------

export type CsvAnalysis = {
  answer: string;
  reasoning: string;
  columnsDetected: string[];
  rowCount: number;
};

export const analyzeUploadedData = createServerFn({ method: "POST" })
  .validator((d: { csvText: string; question: string }) => d)
  .handler(async ({ data }): Promise<CsvAnalysis> => {
    const rows = parseCsv(data.csvText);
    if (!rows.length) throw new Error("Could not parse any rows from the uploaded CSV.");
    const sample = rows.slice(0, 200); // keep prompt small; still proves real reasoning over new data

    const system = `You are a stadium operations reasoning engine. You've been given a CSV dataset
uploaded by an evaluator — columns are unknown in advance (could be gates, amenities, crowd sensors,
transport, anything stadium-related). Infer what the columns represent, then answer the evaluator's
question using ONLY this data, showing your reasoning explicitly.
Respond with ONLY JSON: {"answer": string, "reasoning": string, "columnsDetected": [string]}`;

    const user = `CSV_ROWS (JSON, first ${sample.length} of ${rows.length}): ${JSON.stringify(sample)}\n\nQuestion: ${data.question}`;

    const raw = await callGroq([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const parsed = safeJson<Omit<CsvAnalysis, "rowCount">>(raw, "analyzeUploadedData");
    return { ...parsed, rowCount: rows.length };
  });

// ---------- 5. Live venue snapshot (for dashboard) ----------

export const getLiveVenueSnapshot = createServerFn({ method: "GET" }).handler(async () => ({
  gates: getLiveGates(),
  amenities: getLiveAmenities(),
  announcements: getLiveAnnouncements(),
}));