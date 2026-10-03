export type Profile = {
  place: string;
  stove: string;
  servings: number;
  equipment: string[];
  vessels: string;
};

export type Step = { text: string; changed: boolean; reason: string; cue: string };

export type Recipe = {
  title: string;
  servings: number;
  checks: { ingredient: string; tip: string }[];
  steps: Step[];
  caveat: string;
};

export type Verdict = "normal" | "adjust" | "rescue" | "unclear";

export type Answer = {
  verdict: Verdict;
  answer: string;
  next_cue: string;
  ask: string;
};

export type StuckEvent = {
  step: number;
  message: string;
  had_photo: boolean;
  verdict: Verdict;
  answer: string;
  secs: number;
  created_at: string;
};

export type SessionData = {
  place?: string;
  stove?: string;
  equipment?: string[];
  vessels?: string;
  servings?: number;
  dish?: string;
  recipe_source?: "picked" | "pasted" | "blank";
  adapt_secs?: number;
  adapted_json?: Recipe;
  stuck_events?: StuckEvent[];
  reached_step_max?: number;
  outcome?: "better" | "same" | "worse" | "notyet";
  would_pay?: "yes" | "maybe" | "no";
  currency?: string;
  amount?: number | null;
  pays_today_for?: string;
  comment?: string;
  finished?: boolean;
};

export type SessionRow = {
  session_id: string;
  created_at: string;
  updated_at: string;
  data: SessionData;
};
