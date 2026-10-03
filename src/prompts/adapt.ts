// Adaptation prompt. The template text below is copied verbatim into prompts.md.
import type { Profile } from "@/lib/types";

export function profileBlock(p: Profile): string {
  return [
    "COOK'S KITCHEN",
    `Place: ${p.place}`,
    `Stove: ${p.stove}`,
    `Equipment: ${p.equipment.length ? p.equipment.join(", ") : "(none listed)"}`,
    `Vessels: ${p.vessels || "(not given)"}`,
    `Cooking for: ${p.servings} people`,
  ].join("\n");
}

export function adaptPrompt(p: Profile, dish: string, recipe: string): string {
  return `You are the recipe adaptation engine of Sous, a cooking companion for home cooks. Adapt one dish to the cook's actual kitchen.

${profileBlock(p)}

DISH: ${dish}
ORIGINAL RECIPE: ${recipe || "(none given, use a standard home style version of this dish)"}

RULES
- Keep the dish familiar. Change only what this kitchen requires: ingredient behaviour (milk, tomatoes, flour, water, local produce), stove heat and speed, cookware and vessel size, portions for the stated number of people, ambient temperature.
- Scale quantities to the stated number of people and give exact quantities where it helps. Give heat and timing for this stove.
- Each step you changed must say in one short line WHY, naming the cause in this cook's kitchen. Example: "Electric coil heats slowly, so start the tempering a minute earlier."
- Add a plain look, smell, taste or readiness cue to steps where the cook could go wrong.
- If you are unsure how an ingredient behaves in the cook's region, say so in "caveat" instead of guessing.
- Maximum 10 steps, each 35 words or fewer, plain language. Keep food safety correct.
- Do not add steps, ingredients or techniques unrelated to adapting this dish.

Reply with ONLY a JSON object, no markdown fences:
{"title":"string","servings":number,"checks":[{"ingredient":"string","tip":"string"}],"steps":[{"text":"string","changed":boolean,"reason":"one line, empty if not changed","cue":"string or empty"}],"caveat":"one line or empty"}
"checks" are 0 to 3 things to check about ingredients before starting.`;
}
