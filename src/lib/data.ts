export type Gate = {
  id: string;
  name: string;
  capacityPct: number;
  waitMin: number;
  stepFree: boolean;
};

export type Amenity = {
  id: string;
  name: string;
  type: "food" | "restroom" | "medical" | "merch";
  dietTag?: "veg" | "vegan" | "non-veg";
  nearestGate: string;
  waitMin: number;
  accessible: boolean;
};

export type Announcement = {
  id: string;
  textEn: string;
  priority: "info" | "warning" | "emergency";
  ageSec: number;
};

// --- seeded PRNG (mulberry32) so "live" data is reproducible per time bucket ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function timeBucket(windowSec = 6) {
  return Math.floor(Date.now() / (windowSec * 1000));
}

// A few sections shown as quick-pick suggestions in the UI — no longer a
// hard whitelist, just convenience defaults.
export const SUGGESTED_SECTIONS = ["101", "112", "205", "310", "B12", "A04"];

const GATE_DEFS = [
  { id: "A", name: "Gate A", base: 55, stepFree: true },
  { id: "B", name: "Gate B", base: 70, stepFree: false },
  { id: "C", name: "Gate C", base: 80, stepFree: true },
  { id: "D", name: "Gate D", base: 35, stepFree: true },
  { id: "E", name: "Gate E", base: 50, stepFree: false },
  { id: "F", name: "Gate F", base: 25, stepFree: true },
];

export function getLiveGates(): Gate[] {
  const bucket = timeBucket();
  return GATE_DEFS.map((g) => {
    const rnd = mulberry32(hashStr(g.id) ^ bucket);
    const drift = Math.floor(rnd() * 30) - 15; // ±15%
    const capacityPct = Math.min(98, Math.max(5, g.base + drift));
    const waitMin = Math.max(0, Math.round(capacityPct / 8 + rnd() * 3));
    return { id: g.id, name: g.name, capacityPct, waitMin, stepFree: g.stepFree };
  });
}

// Deterministic walk time for ANY section string, not just a fixed list.
// Same (gateId, section) pair always returns the same value within a session,
// so recommendations stay internally consistent without needing precomputed data.
export function getWalkMinutes(gateId: string, section: string): number {
  const normalized = section.trim().toUpperCase() || "UNKNOWN";
  const rnd = mulberry32(hashStr(`${gateId}|${normalized}`));
  return 2 + Math.floor(rnd() * 8); // 2–9 min
}

const AMENITY_DEFS: Omit<Amenity, "waitMin">[] = [
  { id: "am1", name: "Green Kitchen", type: "food", dietTag: "veg", nearestGate: "D", accessible: true },
  { id: "am2", name: "Grill House", type: "food", dietTag: "non-veg", nearestGate: "C", accessible: true },
  { id: "am3", name: "Plant Bowl", type: "food", dietTag: "vegan", nearestGate: "F", accessible: false },
  { id: "am4", name: "Restroom C2-04", type: "restroom", nearestGate: "D", accessible: true },
  { id: "am5", name: "Restroom A1-01", type: "restroom", nearestGate: "A", accessible: false },
  { id: "am6", name: "Medical Post 2", type: "medical", nearestGate: "B", accessible: true },
  { id: "am7", name: "Fan Merch Store", type: "merch", nearestGate: "E", accessible: true },
];

export function getLiveAmenities(): Amenity[] {
  const bucket = timeBucket();
  return AMENITY_DEFS.map((a) => {
    const rnd = mulberry32(hashStr(a.id) ^ bucket);
    return { ...a, waitMin: Math.floor(rnd() * 12) };
  });
}

const ANNOUNCEMENT_POOL: Omit<Announcement, "id" | "ageSec">[] = [
  { textEn: "Gates open for general entry.", priority: "info" },
  { textEn: "Heavy congestion reported near Gate C. Consider Gate D or F.", priority: "warning" },
  { textEn: "Lost child reported near Section 205. Please contact nearest steward.", priority: "warning" },
  { textEn: "Kickoff in 30 minutes. Please proceed to your seats.", priority: "info" },
];

export function getLiveAnnouncements(): Announcement[] {
  const bucket = timeBucket(20);
  const rnd = mulberry32(bucket);
  const count = 1 + Math.floor(rnd() * 2);
  return ANNOUNCEMENT_POOL.slice(0, count).map((a, i) => ({
    id: `an${i}`,
    ...a,
    ageSec: Math.floor(rnd() * 300),
  }));
}