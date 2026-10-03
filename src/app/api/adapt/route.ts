import { NextResponse } from "next/server";
import { adaptPrompt } from "@/prompts/adapt";
import { adaptRecipe, AiError } from "@/lib/ai";
import { fail, rateLimited, readJson } from "@/lib/http";
import { isSessionId, patchSession, safely } from "@/lib/store";
import { cleanProfile } from "@/lib/validate";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  if (rateLimited(req, "adapt", 20)) return fail("rate", 429);
  const body = await readJson(req);
  if (!body) return fail("input", 400);

  const profile = cleanProfile(body.profile);
  if (!profile) return fail("profile", 400);
  const dish = typeof body.dish === "string" ? body.dish.trim().slice(0, 120) : "";
  if (!dish) return fail("dish", 400);
  const recipe = typeof body.recipe === "string" ? body.recipe.trim().slice(0, 2000) : "";
  const source = ["picked", "pasted", "blank"].includes(body.source as string)
    ? (body.source as "picked" | "pasted" | "blank")
    : recipe ? "pasted" : "blank";

  const t0 = Date.now();
  try {
    const result = await adaptRecipe(adaptPrompt(profile, dish, recipe));
    const secs = Math.round((Date.now() - t0) / 100) / 10;
    if (isSessionId(body.session_id)) {
      await safely(() =>
        patchSession(body.session_id as string, {
          dish,
          recipe_source: source,
          adapt_secs: secs,
          adapted_json: result,
          reached_step_max: 0,
          finished: false,
        }),
      );
    }
    return NextResponse.json({ recipe: result, secs });
  } catch (e) {
    if (e instanceof AiError && e.kind === "rate") return fail("rate", 429);
    return fail("failed", 502);
  }
}
