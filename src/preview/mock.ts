// PREVIEW BUILD ONLY. Never imported by the Next.js app.
// scripts/build-preview.mjs inlines this into the static design preview (preview-dist/sous-preview.html),
// where there is no server. It answers /api/* in the browser with sample answers so the screens can be clicked through.
// Nothing is logged or sent anywhere.

type Json = Record<string, unknown>;

const TOMATO_PAPPU = {
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
};

const JOWAR_ROTI = {
  title: "Jowar roti for 2",
  servings: 2,
  checks: [
    { ingredient: "Jowar flour", tip: "Flour from a North American store can be coarser. Sift it and keep 2 extra tbsp hot water ready." },
  ],
  steps: [
    { text: "Boil 3/4 cup water with a pinch of salt. Pour it over 1 cup jowar flour and mix with a spoon.", changed: false, reason: "", cue: "" },
    { text: "Cover and rest the dough for 5 minutes, then knead for 3 minutes while still warm.", changed: true, reason: "A cool Toronto kitchen cools the dough fast, so rest it covered to keep it pliable.", cue: "Dough should feel soft like playdough with no cracks." },
    { text: "Heat the non-stick kadhai on medium-high for 4 minutes before the first roti.", changed: true, reason: "No tawa is listed and an electric coil heats slowly, so preheat the kadhai longer.", cue: "A drop of water should sizzle away in 2 seconds." },
    { text: "Pat a lime-sized ball into a 6 inch round on a damp board, turning it as you go.", changed: true, reason: "The kadhai base is smaller than a tawa, so keep each roti to 6 inches.", cue: "Edges may crack a little. Press them back together." },
    { text: "Cook 1 minute, wipe the top with a wet hand, flip and cook 1 more minute.", changed: false, reason: "", cue: "Small brown spots underneath." },
    { text: "Press the edges with a folded cloth to puff it in the pan.", changed: true, reason: "There is no open flame on an electric coil, so puff it with gentle pressure instead.", cue: "Roti swells in patches. Full puffing is a bonus." },
  ],
  caveat: "",
};

const APPAM = {
  title: "Appam for 2",
  servings: 2,
  checks: [
    { ingredient: "Coconut", tip: "Frozen grated coconut works. Thaw it fully so the batter is not cold." },
    { ingredient: "Yeast", tip: "Check the date on instant yeast. Old yeast in a cool kitchen may not rise." },
  ],
  steps: [
    { text: "Soak 1/2 cup raw rice for 5 hours. Grind with 1/4 cup cooked rice, 1/4 cup coconut, 1 tsp sugar and water into a smooth batter.", changed: true, reason: "Halved for 2 people.", cue: "Batter should coat a spoon like thick cream." },
    { text: "Stir in 1/4 tsp instant yeast. Cover and leave in the oven with only the light on for 10 to 12 hours.", changed: true, reason: "Toronto kitchens run cooler than the recipe assumes, so ferment longer in a warm spot.", cue: "Batter doubles and smells pleasantly sour with many bubbles." },
    { text: "Add 1/2 tsp salt and stir gently.", changed: false, reason: "", cue: "" },
    { text: "Heat the non-stick kadhai on medium for 3 minutes. Pour a ladle in and swirl once.", changed: true, reason: "No appam pan is listed, so the curved kadhai does the swirling.", cue: "A thin lacy edge sets up the sides." },
    { text: "Cover and cook 2 to 3 minutes on medium.", changed: false, reason: "", cue: "Edges crisp and golden, centre soft and set." },
  ],
  caveat: "Not sure how warm your oven gets with only the light on. Check after 8 hours.",
};

const DAHI = {
  title: "Homemade dahi for 2",
  servings: 2,
  checks: [{ ingredient: "Milk", tip: "Use whole milk. Ultra-pasteurized cartons can set thinner." }],
  steps: [
    { text: "Warm 2 cups whole milk in the steel pot on medium until small bubbles show at the edge.", changed: true, reason: "Halved for 2 people.", cue: "Do not let it boil over. Stir the bottom." },
    { text: "Cool until a finger can stay in for 10 seconds, about 45°C.", changed: false, reason: "", cue: "Warm, not hot." },
    { text: "Stir in 2 tsp curd. Cover and set in the oven with only the light on for 8 to 10 hours.", changed: true, reason: "A cool Toronto kitchen slows setting, so use a warm spot and a little longer.", cue: "Dahi sets firm and pulls away from the side." },
    { text: "Chill for 2 hours before eating.", changed: false, reason: "", cue: "" },
  ],
  caveat: "",
};

const SAMPLES: Record<string, Json> = {
  "tomato pappu": TOMATO_PAPPU,
  "jowar roti": JOWAR_ROTI,
  appam: APPAM,
  "homemade dahi": DAHI,
};

function answerFor(message: string, hasPhoto: boolean): Json {
  const lower = message.toLowerCase();
  if (hasPhoto && !message) {
    return {
      verdict: "unclear",
      answer:
        "This is the design preview, so the photo is not looked at. In the real app Sous describes only what is visible and says so if the photo is too dark or blurry to judge.",
      next_cue: "",
      ask: "What do you see in the pan right now?",
    };
  }
  if (/watery|thin|runny/.test(lower)) {
    return {
      verdict: "adjust",
      answer:
        "It has probably not simmered long enough. Raise your electric coil to medium-high and simmer uncovered in the steel pot for 3 to 4 minutes, stirring often so it does not catch.",
      next_cue: "It should coat the back of a spoon and small bubbles should break slowly on top.",
      ask: "",
    };
  }
  if (/burn|smok|black/.test(lower)) {
    return {
      verdict: "rescue",
      answer:
        "Lift the pan off the coil now, since the coil stays hot. Move the top part to a clean pot without scraping the bottom, then carry on at medium.",
      next_cue: "Taste it. A faint smoky note is fine, a bitter one means start the tempering again.",
      ask: "",
    };
  }
  return {
    verdict: "normal",
    answer: "That sounds normal for this step. Keep the coil where it is and give it another 2 minutes before you change anything.",
    next_cue: "Look for the cue under the step before moving on.",
    ask: "",
  };
}

export function installPreviewMock() {
  const wait = (ms: number, signal?: AbortSignal | null) =>
    new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const secs = (t0: number) => Math.round((Date.now() - t0) / 100) / 10;

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    const body = (() => {
      try {
        return JSON.parse(String(init.body || "{}"));
      } catch {
        return {};
      }
    })();
    if (url.includes("/api/log")) return json({ ok: true });
    if (url.includes("/api/adapt")) {
      const t0 = Date.now();
      await wait(1800, init.signal);
      const recipe = SAMPLES[String(body.dish || "").trim().toLowerCase()] ?? TOMATO_PAPPU;
      return json({ recipe, secs: secs(t0) });
    }
    if (url.includes("/api/ask")) {
      const t0 = Date.now();
      await wait(1400, init.signal);
      return json({ answer: answerFor(String(body.message || ""), !!body.photo), secs: secs(t0), step: body.step });
    }
    return json({ error: "failed" }, 502);
  };
}
