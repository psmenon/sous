// Local testing only. Canned answers so the UI and error states can be checked without an API key.
// Bundled only when SOUS_FAKE_AI is set at build time (see next.config.mjs). Production builds get fake-ai.off.ts.
import "server-only";

const fake = () => process.env.SOUS_FAKE_AI;
export function fakeAdapt(): string {
  if (fake() === "invalid") return "Sorry, here is some text that is not JSON.";
  return JSON.stringify({
    title: "Tomato pappu for 2",
    servings: 2,
    checks: [
      { ingredient: "Tomatoes", tip: "Supermarket tomatoes are often less sour. Taste one and add a little extra tamarind if it is mild." },
      { ingredient: "Toor dal", tip: "Check the packet for oily dal. Rinse it in warm water until the water runs clear." },
    ],
    steps: [
      { text: "Rinse 1/2 cup toor dal. Add 1 1/2 cups water and a pinch of turmeric to the pressure cooker.", changed: false, reason: "", cue: "" },
      { text: "Cook on medium-high for 5 whistles, then let the pressure drop on its own.", changed: true, reason: "Electric coil holds heat after you switch it off, so allow one extra whistle and a natural release.", cue: "Dal should mash easily with the back of a spoon." },
      { text: "In the steel pot, boil 3 tomatoes, 2 slit green chillies, a small lime-sized ball of tamarind and 1 tsp salt with 1/2 cup water.", changed: true, reason: "Toronto supermarket tomatoes are firmer and less juicy, so add a little water to help them break down.", cue: "Tomatoes split and turn soft in about 10 minutes." },
      { text: "Mash the dal and add it to the tomatoes. Simmer on medium for 5 to 7 minutes.", changed: true, reason: "Electric coil is slower to respond, so simmer a little longer for the flavours to join.", cue: "A thick pourable texture with small bubbles." },
      { text: "Turn the small coil to high 2 minutes before you need it. Heat 1 tbsp ghee in the tadka pan.", changed: true, reason: "Electric coil heats slowly, so start the tempering a minute earlier.", cue: "" },
      { text: "Add 1/2 tsp mustard seeds, 1/2 tsp cumin, 3 crushed garlic cloves, 1 dried chilli and 8 curry leaves.", changed: false, reason: "", cue: "Mustard seeds pop and garlic turns light golden. Pull it off the heat right away." },
      { text: "Pour the tempering over the pappu, stir and serve hot with rice.", changed: false, reason: "", cue: "" },
    ],
    caveat: "Not sure how sour your local tamarind block is. Start with less and taste.",
  });
}
export function fakeAsk(hasPhoto: boolean): string {
  if (fake() === "invalid") return "not json";
  return JSON.stringify({
    verdict: "adjust",
    answer: hasPhoto
      ? "The photo is a little dark, so I can only judge the colour roughly. It looks like the dal is still thin. Raise the coil to medium-high and simmer uncovered in the steel pot for 3 to 4 minutes, stirring often."
      : "The pappu is probably still too thin and has not simmered long enough. Raise your electric coil to medium-high and simmer uncovered in the steel pot for 3 to 4 minutes, stirring often so it does not catch.",
    next_cue: "It should coat the back of a spoon and small bubbles should break slowly on top.",
    ask: "",
  });
}

export const fakeAI: { adapt: () => string; ask: (hasPhoto: boolean) => string } | null = process.env.SOUS_FAKE_AI
  ? { adapt: fakeAdapt, ask: fakeAsk }
  : null;
