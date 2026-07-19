export type FanSession = {
  language: string;
  section: string;
  accessibility: boolean;
};

const KEY = "stadiumai_session";

const DEFAULT_SESSION: FanSession = { language: "English", section: "112", accessibility: false };

export function getSession(): FanSession {
  if (typeof window === "undefined") return DEFAULT_SESSION;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SESSION, ...JSON.parse(raw) } : DEFAULT_SESSION;
  } catch {
    return DEFAULT_SESSION;
  }
}

export function setSession(patch: Partial<FanSession>) {
  if (typeof window === "undefined") return;
  const next = { ...getSession(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}