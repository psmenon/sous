import type { Profile, Recipe } from "./types";
import { validateRecipe } from "./ai";

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanProfile(v: unknown): Profile | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const place = s(o.place, 120);
  const stove = s(o.stove, 60);
  if (!place || !stove) return null;
  const n = Number(o.servings);
  return {
    place,
    stove,
    servings: Number.isFinite(n) ? Math.min(20, Math.max(1, Math.round(n))) : 2,
    equipment: (Array.isArray(o.equipment) ? o.equipment : []).map((e) => s(e, 40)).filter(Boolean).slice(0, 12),
    vessels: s(o.vessels, 300),
  };
}

export function cleanRecipe(v: unknown): Recipe | null {
  return validateRecipe(v);
}
