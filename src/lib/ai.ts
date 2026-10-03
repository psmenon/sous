import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Answer, Recipe, Verdict } from "./types";
// Resolves to an empty stub in normal builds. See next.config.mjs.
import { fakeAI } from "@fake-ai";

export const MODEL_ADAPT = process.env.MODEL_ADAPT || "claude-sonnet-5-5";
export const MODEL_ASK = process.env.MODEL_ASK || "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // Pinned so a stray ANTHROPIC_BASE_URL on the host cannot redirect traffic.
      baseURL: "https://api.anthropic.com",
      timeout: 90_000,
      maxRetries: 1,
    });
  }
  return client;
}

export class AiError extends Error {
  constructor(public kind: "failed" | "rate") {
    super(kind);
  }
}

type Image = { media_type: "image/jpeg"; data: string };

// Server-side refusal fallback is supported on these model families.
function supportsFallback(model: string) {
  return /^claude-(sonnet-5-5|opus-5|fable-5)/.test(model);
}

async function callText(
  model: string,
  prompt: string,
  maxTokens: number,
  effort: "low" | "medium",
  image?: Image,
): Promise<string> {
  const content: Anthropic.ContentBlockParam[] = [];
  if (image) {
    content.push({ type: "image", source: { type: "base64", media_type: image.media_type, data: image.data } });
  }
  content.push({ type: "text", text: prompt });

  const params: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content }],
  };
  if (supportsFallback(model)) {
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
    params.output_config = { effort };
  }
  try {
    // Beta endpoint so the fallbacks parameter is forwarded. Typings lag the parameter.
    const msg = (await getClient().beta.messages.create(
      params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming,
    )) as Anthropic.Beta.BetaMessage;
    if (msg.stop_reason === "refusal") return "";
    return msg.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new AiError("rate");
    throw new AiError("failed");
  }
}

export function parseJson(raw: string): unknown {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function validateRecipe(v: unknown): Recipe | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!Array.isArray(o.steps) || o.steps.length < 1) return null;
  const steps = o.steps
    .map((s) => {
      const x = (s ?? {}) as Record<string, unknown>;
      const changed = x.changed === true;
      return { text: str(x.text), changed, reason: changed ? str(x.reason, 300) : "", cue: str(x.cue, 300) };
    })
    .filter((s) => s.text)
    .slice(0, 10);
  if (!steps.length) return null;
  const checks = (Array.isArray(o.checks) ? o.checks : [])
    .map((c) => {
      const x = (c ?? {}) as Record<string, unknown>;
      return { ingredient: str(x.ingredient, 80), tip: str(x.tip, 300) };
    })
    .filter((c) => c.ingredient && c.tip)
    .slice(0, 3);
  const servings = typeof o.servings === "number" && o.servings > 0 ? Math.round(o.servings) : 0;
  return { title: str(o.title, 120) || "Your dish", servings, checks, steps, caveat: str(o.caveat, 300) };
}

const VERDICTS: Verdict[] = ["normal", "adjust", "rescue", "unclear"];

export function validateAnswer(v: unknown): Answer | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const verdict = str(o.verdict).toLowerCase() as Verdict;
  const answer = str(o.answer, 800);
  if (!VERDICTS.includes(verdict) || !answer) return null;
  return { verdict, answer, next_cue: str(o.next_cue, 300), ask: str(o.ask, 300) };
}

async function withRetry<T>(
  attempts: (() => Promise<string>)[],
  validate: (v: unknown) => T | null,
): Promise<T> {
  let lastErr: AiError | null = null;
  for (const run of attempts) {
    try {
      const out = validate(parseJson(await run()));
      if (out) return out;
    } catch (e) {
      lastErr = e instanceof AiError ? e : new AiError("failed");
      if (lastErr.kind === "rate") throw lastErr;
    }
  }
  throw lastErr ?? new AiError("failed");
}

export async function adaptRecipe(prompt: string): Promise<Recipe> {
  if (fakeAI) return withRetry([async () => fakeAI!.adapt(), async () => fakeAI!.adapt()], validateRecipe);
  const run = () => callText(MODEL_ADAPT, prompt, 8000, "medium");
  return withRetry([run, run], validateRecipe);
}

export async function answerStuck(prompt: string, image?: Image): Promise<Answer> {
  if (fakeAI) return withRetry([async () => fakeAI!.ask(!!image), async () => fakeAI!.ask(!!image)], validateAnswer);
  const fast = () => callText(MODEL_ASK, prompt, 1000, "low", image);
  const strong = () => callText(MODEL_ADAPT, prompt, 4000, "low", image);
  return withRetry([fast, fast, strong], validateAnswer);
}
