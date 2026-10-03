import { NextResponse } from "next/server";
import { askPrompt } from "@/prompts/ask";
import { answerStuck, AiError } from "@/lib/ai";
import { fail, rateLimited, readJson } from "@/lib/http";
import { addStuckEvent, isSessionId, safely } from "@/lib/store";
import { cleanProfile, cleanRecipe } from "@/lib/validate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (rateLimited(req, "ask", 60)) return fail("rate", 429);
  const body = await readJson(req);
  if (!body) return fail("input", 400);

  const profile = cleanProfile(body.profile);
  if (!profile) return fail("profile", 400);
  const recipe = cleanRecipe(body.recipe);
  if (!recipe) return fail("input", 400);
  const step = Math.min(recipe.steps.length, Math.max(1, Math.round(Number(body.step) || 1)));
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";

  // Photo arrives as a base64 JPEG (resized on the device). It is passed through and never stored.
  let image: { media_type: "image/jpeg"; data: string } | undefined;
  if (typeof body.photo === "string" && body.photo) {
    const data = body.photo.replace(/^data:image\/jpeg;base64,/, "");
    if (!/^[A-Za-z0-9+/=]+$/.test(data)) return fail("input", 400);
    image = { media_type: "image/jpeg", data };
  }
  if (!message && !image) return fail("empty", 400);

  const t0 = Date.now();
  try {
    const answer = await answerStuck(askPrompt(profile, recipe, step, message, !!image), image);
    const secs = Math.round((Date.now() - t0) / 100) / 10;
    if (isSessionId(body.session_id)) {
      await safely(() =>
        addStuckEvent(body.session_id as string, {
          step,
          message,
          had_photo: !!image,
          verdict: answer.verdict,
          answer: answer.answer,
          secs,
          created_at: new Date().toISOString(),
        }),
      );
    }
    return NextResponse.json({ answer, secs, step });
  } catch (e) {
    if (e instanceof AiError && e.kind === "rate") return fail("rate", 429);
    return fail("failed", 502);
  }
}
