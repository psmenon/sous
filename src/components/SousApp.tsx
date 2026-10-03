"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Answer, Profile, Recipe } from "@/lib/types";
import {
  BigCheck, IconAirFryer, IconAlert, IconAppam, IconArrowLeft, IconArrowRight, IconAuto, IconBlender, IconBowl,
  IconCheck, IconCheckCircle, IconChecklist, IconClock, IconCup, IconEquals, IconEye, IconFlame, IconFlatbread,
  IconGriddle, IconLifebuoy, IconMaybe, IconMicrowave, IconMoon, IconNotebook, IconOven, IconPan, IconPin,
  IconPressureCooker, IconQuestion, IconRiceCooker, IconSparkle, IconSun, IconTrendDown, IconTrendUp, IconTune,
  IconX, LogoMark, PotHero,
} from "@/components/icons";

/* ---------- Storage that never throws (works in private mode) ---------- */
const memory = new Map<string, string>();
function load<T>(key: string): T | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = memory.get(key) ?? null;
  }
  if (raw == null) raw = memory.get(key) ?? null;
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    /* in-memory only */
  }
}
function drop(key: string) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
  );
}

/* ---------- Constants ---------- */
const STOVES = ["Gas", "Electric coil", "Electric ceramic or glass top", "Induction", "Other"];
const EQUIPMENT = ["Pressure cooker", "Oven", "Microwave", "Air fryer", "Rice cooker", "Mixer / blender", "Tawa / griddle"];
const EXAMPLES: { dish: string; recipe: string }[] = [
  {
    dish: "Tomato pappu",
    recipe:
      "Cook 1/2 cup toor dal in a pressure cooker with water and turmeric for 4 whistles. Boil 3 tomatoes with green chillies, tamarind and salt until soft. Mash the dal, mix with the tomatoes, simmer 5 minutes, then add a tempering of mustard, cumin, garlic, dried chilli and curry leaves in ghee.",
  },
  {
    dish: "Jowar roti",
    recipe:
      "Take 1 cup jowar flour and 3/4 cup hot water with a pinch of salt. Knead into a soft dough, pat each ball into a thin round on a damp surface, and cook on a hot tawa for about 1 minute per side, then puff briefly over an open flame.",
  },
  {
    dish: "Appam",
    recipe:
      "Soak 1 cup raw rice with a handful of cooked rice, grind with coconut and a little sugar and yeast into a smooth batter. Ferment overnight (about 8 hours) until bubbly. Add salt, pour a ladle into a hot appam pan, swirl, cover and cook until the edges are crisp and the centre is soft.",
  },
  {
    dish: "Homemade dahi",
    recipe:
      "Warm 1 litre of whole milk to lukewarm, stir in 1 tablespoon of curd as starter, cover and leave in a warm place for 6 to 8 hours until set.",
  },
];
const EXAMPLE_KITCHEN: Profile = {
  place: "Toronto, Canada",
  stove: "Electric coil",
  servings: 2,
  equipment: ["Pressure cooker", "Microwave"],
  vessels: "One non-stick kadhai, one steel pot, small tadka pan",
};
const VERDICT_LABEL: Record<Answer["verdict"], string> = {
  normal: "Normal",
  adjust: "Adjust",
  rescue: "Rescue",
  unclear: "Not sure yet",
};
type IconC = (p: { size?: number }) => React.ReactElement;
const NAV: { label: string; Icon: IconC }[] = [
  { label: "Kitchen", Icon: IconPan },
  { label: "Recipe", Icon: IconNotebook },
  { label: "Cook", Icon: IconFlame },
  { label: "After", Icon: IconCheckCircle },
];
const EQUIP_ICON: Record<string, IconC> = {
  "Pressure cooker": IconPressureCooker,
  Oven: IconOven,
  Microwave: IconMicrowave,
  "Air fryer": IconAirFryer,
  "Rice cooker": IconRiceCooker,
  "Mixer / blender": IconBlender,
  "Tawa / griddle": IconGriddle,
};
const DISH_ICON: Record<string, IconC> = {
  "Tomato pappu": IconBowl,
  "Jowar roti": IconFlatbread,
  Appam: IconAppam,
  "Homemade dahi": IconCup,
};
const VERDICT_ICON: Record<Answer["verdict"], IconC> = {
  normal: IconCheck,
  adjust: IconTune,
  rescue: IconAlert,
  unclear: IconQuestion,
};
const MSG_FAILED = "We could not get an answer. Check your connection and try again.";
const MSG_RATE = "Too many requests. Wait a few seconds and try again.";

type Screen = 1 | 2 | 3 | 4;
type Source = "picked" | "pasted" | "blank";
type SavedRecipe = { dish: string; recipeText: string; source: Source; recipe: Recipe | null; step: number; reachedMax: number; finishedCook: boolean };
type Outcome = "better" | "same" | "worse" | "notyet";
type Pay = "yes" | "maybe" | "no";

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/* ---------- Logging (never blocks the cook) ---------- */
function logSession(sessionId: string, patch: Record<string, unknown>) {
  try {
    void fetch("/api/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, patch }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

/* ---------- Photo resize on the device ---------- */
async function resizePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("load"));
      el.src = url;
    });
    const w0 = img.naturalWidth;
    const h0 = img.naturalHeight;
    if (!w0 || !h0) throw new Error("size");
    const scale = Math.min(1, 1024 / Math.max(w0, h0));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w0 * scale);
    canvas.height = Math.round(h0 * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ctx");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    if (!data.startsWith("data:image/jpeg")) throw new Error("encode");
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* =================================================================== */

export default function SousApp() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>(1);
  const [sessionId, setSessionId] = useState("");

  // Kitchen
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kPlace, setKPlace] = useState("");
  const [kStove, setKStove] = useState("");
  const [kServings, setKServings] = useState("2");
  const [kEquip, setKEquip] = useState<string[]>([]);
  const [kVessels, setKVessels] = useState("");
  const [kErrors, setKErrors] = useState<{ place?: string; stove?: string }>({});
  const [kSaved, setKSaved] = useState(false);

  // Recipe
  const [dish, setDish] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [adaptState, setAdaptState] = useState<"idle" | "loading">("idle");
  const [adaptErr, setAdaptErr] = useState<"" | "dish" | "profile" | "failed" | "rate">("");
  const adaptAbort = useRef<AbortController | null>(null);

  // Cook
  const [step, setStep] = useState(1);
  const [reachedMax, setReachedMax] = useState(0);
  const [finishedCook, setFinishedCook] = useState(false);
  const [stuckText, setStuckText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoErr, setPhotoErr] = useState("");
  const [askState, setAskState] = useState<"idle" | "loading">("idle");
  const [askErr, setAskErr] = useState("");
  const [askSecs, setAskSecs] = useState<number | null>(null);
  const [answer, setAnswer] = useState<(Answer & { step: number }) | null>(null);
  const [answeredInput, setAnsweredInput] = useState(false);
  const askAbort = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // After
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [pay, setPay] = useState<Pay | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState("");
  const [paysFor, setPaysFor] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Theme
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  /* ----- Load saved state once ----- */
  useEffect(() => {
    let sid = load<string>("sous_session");
    if (!sid) {
      sid = newId();
      save("sous_session", sid);
    }
    setSessionId(sid);
    const p = load<Profile>("sous_profile");
    if (p && p.place && p.stove) {
      setProfile(p);
      fillKitchenForm(p);
      setScreen(2);
    }
    const r = load<SavedRecipe>("sous_recipe");
    if (r) {
      setDish(r.dish || "");
      setRecipeText(r.recipeText || "");
      setPicked(r.source === "picked" ? r.dish : null);
      setRecipe(r.recipe ?? null);
      setStep(r.step || 1);
      setReachedMax(r.reachedMax || 0);
      setFinishedCook(!!r.finishedCook);
    }
    const t = load<string>("sous_theme");
    if (t === "light" || t === "dark") setTheme(t);
    setReady(true);
  }, []);

  /* ----- Persist recipe progress ----- */
  useEffect(() => {
    if (!ready) return;
    const source: Source = picked && picked === dish ? "picked" : recipeText.trim() ? "pasted" : "blank";
    save("sous_recipe", { dish, recipeText, source, recipe, step, reachedMax, finishedCook } satisfies SavedRecipe);
  }, [ready, dish, recipeText, picked, recipe, step, reachedMax, finishedCook]);

  /* ----- Move focus to the screen title on screen change ----- */
  useEffect(() => {
    if (!ready) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [screen, ready]);

  function fillKitchenForm(p: Profile) {
    setKPlace(p.place);
    setKStove(p.stove);
    setKServings(String(p.servings));
    setKEquip(p.equipment);
    setKVessels(p.vessels);
  }

  function applyTheme(t: "light" | "dark" | "auto") {
    setTheme(t);
    if (t === "auto") {
      document.documentElement.removeAttribute("data-theme");
      drop("sous_theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
      save("sous_theme", t);
    }
  }

  /* ----- Navigation ----- */
  const canReach = (s: Screen) =>
    s === 1 || (s === 2 && !!profile) || (s === 3 && !!profile && !!recipe) || (s === 4 && !!recipe && finishedCook);

  const go = (s: Screen) => setScreen(s);

  /* ----- Kitchen ----- */
  function saveKitchen(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof kErrors = {};
    if (!kPlace.trim()) errs.place = "Add where you cook";
    if (!kStove) errs.stove = "Choose your stove";
    setKErrors(errs);
    if (errs.place || errs.stove) {
      document.getElementById(errs.place ? "k-place" : "k-stove")?.focus();
      return;
    }
    const n = Math.min(20, Math.max(1, Math.round(Number(kServings)) || 2));
    const p: Profile = { place: kPlace.trim(), stove: kStove, servings: n, equipment: kEquip, vessels: kVessels.trim() };
    setProfile(p);
    setKServings(String(n));
    save("sous_profile", p);
    logSession(sessionId, { profile: p });
    setKSaved(true);
    window.setTimeout(() => {
      setKSaved(false);
      go(2);
    }, 600);
  }

  /* ----- Adapt ----- */
  async function adapt() {
    setAdaptErr("");
    if (!dish.trim()) {
      setAdaptErr("dish");
      document.getElementById("r-dish")?.focus();
      return;
    }
    if (!profile) {
      setAdaptErr("profile");
      return;
    }
    const source: Source = picked && picked === dish ? "picked" : recipeText.trim() ? "pasted" : "blank";
    const ctrl = new AbortController();
    adaptAbort.current = ctrl;
    setAdaptState("loading");
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, profile, dish: dish.trim(), recipe: recipeText.slice(0, 2000), source }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429) return setAdaptErr("rate");
      if (res.status === 400 && data?.error === "profile") return setAdaptErr("profile");
      if (res.status === 400 && data?.error === "dish") return setAdaptErr("dish");
      if (!res.ok || !data?.recipe) return setAdaptErr("failed");
      setRecipe(data.recipe as Recipe);
      setStep(1);
      setReachedMax(0);
      setFinishedCook(false);
      setAnswer(null);
      setAskSecs(null);
      setStuckText("");
      setPhoto(null);
      setSubmitted(false);
      const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 50);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setAdaptErr("failed");
    } finally {
      adaptAbort.current = null;
      setAdaptState("idle");
    }
  }

  function pickExample(ex: (typeof EXAMPLES)[number]) {
    setDish(ex.dish);
    setRecipeText(ex.recipe);
    setPicked(ex.dish);
    setAdaptErr("");
  }

  /* ----- Cook ----- */
  const total = recipe?.steps.length ?? 0;

  const gotoStep = useCallback(
    (n: number) => {
      setStep(n);
      setAskErr("");
      if (answeredInput) {
        setStuckText("");
        setPhoto(null);
        setPhotoErr("");
        if (fileRef.current) fileRef.current.value = "";
        setAnsweredInput(false);
      }
    },
    [answeredInput],
  );

  useEffect(() => {
    if (screen !== 3 || !recipe) return;
    if (step > reachedMax) {
      setReachedMax(step);
      logSession(sessionId, { reached_step_max: step });
    }
  }, [screen, step, recipe, reachedMax, sessionId]);

  function startCooking() {
    gotoStep(1);
    go(3);
  }

  function finishCooking() {
    setFinishedCook(true);
    go(4);
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoErr("");
    setAnsweredInput(false);
    const f = e.target.files?.[0];
    if (!f) {
      setPhoto(null);
      return;
    }
    try {
      if (!f.type.startsWith("image/")) throw new Error("type");
      setPhoto(await resizePhoto(f));
    } catch {
      setPhoto(null);
      setPhotoErr("That photo could not be used. Try a smaller JPEG or PNG.");
      e.target.value = "";
    }
  }

  function clearPhoto() {
    setPhoto(null);
    setPhotoErr("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function ask() {
    setAskErr("");
    if (!stuckText.trim() && !photo) {
      setAskErr("Describe what you see or add a photo.");
      return;
    }
    if (!profile || !recipe) return;
    const ctrl = new AbortController();
    askAbort.current = ctrl;
    setAskState("loading");
    setAskSecs(null);
    const askedStep = step;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          profile,
          recipe,
          step: askedStep,
          message: stuckText.trim().slice(0, 600),
          photo: photo ?? undefined,
        }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429) return setAskErr(MSG_RATE);
      if (res.status === 400 && data?.error === "empty") return setAskErr("Describe what you see or add a photo.");
      if (!res.ok || !data?.answer) return setAskErr(MSG_FAILED);
      setAnswer({ ...(data.answer as Answer), step: askedStep });
      setAskSecs(typeof data.secs === "number" ? data.secs : null);
      setAnsweredInput(true);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setAskErr(MSG_FAILED);
    } finally {
      askAbort.current = null;
      setAskState("idle");
    }
  }

  /* ----- After ----- */
  function submitAfter(e: React.FormEvent) {
    e.preventDefault();
    const n = amount.trim() === "" ? null : Math.max(0, Number(amount));
    logSession(sessionId, {
      outcome: outcome ?? undefined,
      would_pay: pay ?? undefined,
      currency: pay === "no" ? undefined : currency,
      amount: pay === "no" ? null : Number.isFinite(n as number) ? n : null,
      pays_today_for: paysFor.trim(),
      comment: comment.trim(),
      finished: true,
    });
    setSubmitted(true);
    window.setTimeout(() => headingRef.current?.focus(), 0);
  }

  function cookAnother() {
    const sid = newId();
    save("sous_session", sid);
    setSessionId(sid);
    if (profile) logSession(sid, { profile });
    setDish("");
    setRecipeText("");
    setPicked(null);
    setRecipe(null);
    setStep(1);
    setReachedMax(0);
    setFinishedCook(false);
    setAnswer(null);
    setAskSecs(null);
    setStuckText("");
    setPhoto(null);
    setOutcome(null);
    setPay(null);
    setCurrency("INR");
    setAmount("");
    setPaysFor("");
    setComment("");
    setSubmitted(false);
    go(2);
  }

  /* ===================== Render ===================== */
  if (!ready) {
    return (
      <div className="shell">
        <header className="top">
          <Logo />
        </header>
      </div>
    );
  }

  const current = recipe?.steps[step - 1];
  const changedCount = recipe?.steps.filter((s) => s.changed).length ?? 0;
  const done: Record<Screen, boolean> = { 1: !!profile, 2: !!recipe, 3: finishedCook, 4: submitted };

  return (
    <div className="shell">
      <header className="top">
        <Logo />
        {profile && screen !== 1 ? (
          <div className="chip-profile">
            <IconPin size={18} />
            <span className="chip-text">
              <span className="sr-only">Your kitchen: </span>
              {profile.place} · {profile.stove} · {people(profile.servings)}
            </span>
            <button type="button" className="linkbtn" onClick={() => go(1)}>
              Edit
            </button>
          </div>
        ) : null}
      </header>

      <div className="frame">
        <nav aria-label="Progress" className="nav">
          <ol className="steps-nav">
            {NAV.map(({ label, Icon }, i) => {
              const s = (i + 1) as Screen;
              const isDone = done[s] && screen !== s;
              return (
                <li key={label} className={isDone ? "done" : undefined}>
                  <button
                    type="button"
                    onClick={() => go(s)}
                    disabled={!canReach(s)}
                    aria-current={screen === s ? "step" : undefined}
                  >
                    <span className="nav-icon">
                      <Icon size={22} />
                    </span>
                    <span className="num" aria-hidden="true">
                      {isDone ? <IconCheck size={14} /> : s}
                    </span>
                    <span className="nav-label">
                      <span className="sr-only">{s} </span>
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="stack">
          {/* ---------------- Screen 1 ---------------- */}
          {screen === 1 && (
            <section className="stack" aria-labelledby="h-kitchen">
              <div className="hero">
                <div className="hero-text">
                  <h2 id="h-kitchen" className="h2" tabIndex={-1} ref={headingRef}>
                    Describe your kitchen once
                  </h2>
                  <p className="sub">Every recipe is rewritten for this kitchen. It takes about a minute.</p>
                </div>
                <PotHero />
              </div>
              {!profile && (
                <div className="card notice">We save your answers without your name to help us improve Sous.</div>
              )}
              <form className="card form-card" onSubmit={saveKitchen} noValidate>
                <div className="form-section">
                  <p className="section-label">Where and how</p>
                  <label className="field" htmlFor="k-place">
                    <span className="label">Where do you cook?</span>
                    <input
                      id="k-place"
                      type="text"
                      value={kPlace}
                      onChange={(e) => setKPlace(e.target.value)}
                      placeholder="City and country, e.g. Calgary, Canada"
                      autoComplete="address-level2"
                      required
                      aria-invalid={!!kErrors.place}
                      aria-describedby={kErrors.place ? "k-place-err" : undefined}
                      maxLength={120}
                    />
                    {kErrors.place && (
                      <p id="k-place-err" className="err">
                        {kErrors.place}
                      </p>
                    )}
                  </label>
                  <div className="pair">
                    <label className="field" htmlFor="k-stove">
                      <span className="label">Stove</span>
                      <select
                        id="k-stove"
                        value={kStove}
                        onChange={(e) => setKStove(e.target.value)}
                        required
                        aria-invalid={!!kErrors.stove}
                        aria-describedby={kErrors.stove ? "k-stove-err" : undefined}
                      >
                        <option value="">Choose</option>
                        {STOVES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {kErrors.stove && (
                        <p id="k-stove-err" className="err">
                          {kErrors.stove}
                        </p>
                      )}
                    </label>
                    <label className="field" htmlFor="k-servings">
                      <span className="label">
                        Cooking for <span className="hint">people</span>
                      </span>
                      <input
                        id="k-servings"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={20}
                        value={kServings}
                        onChange={(e) => setKServings(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
                <div className="form-section">
                  <p className="section-label">What you have</p>
                  <fieldset className="plain">
                    <legend className="label">
                      Equipment you have <span className="hint">(optional)</span>
                    </legend>
                    <div className="pills">
                      {EQUIPMENT.map((eq) => {
                        const on = kEquip.includes(eq);
                        const Icon = EQUIP_ICON[eq];
                        return (
                          <label key={eq} className={`pill${on ? " on" : ""}`}>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => setKEquip(on ? kEquip.filter((x) => x !== eq) : [...kEquip, eq])}
                            />
                            {on ? <IconCheck size={18} /> : <Icon size={18} />}
                            {eq}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <label className="field" htmlFor="k-vessels">
                    <span className="label">
                      Vessels and pans <span className="hint">(optional)</span>
                    </span>
                    <input
                      id="k-vessels"
                      type="text"
                      value={kVessels}
                      onChange={(e) => setKVessels(e.target.value)}
                      placeholder="e.g. 1 non-stick kadhai, steel pot, small tadka pan"
                      maxLength={300}
                    />
                  </label>
                </div>
                <div className="stack-sm">
                  <button className="btn primary full" type="submit">
                    Save my kitchen
                  </button>
                  {!profile && (
                    <button
                      type="button"
                      className="linkbtn"
                      onClick={() => {
                        fillKitchenForm(EXAMPLE_KITCHEN);
                        setKErrors({});
                      }}
                    >
                      Use an example kitchen
                    </button>
                  )}
                  <p className="ok status" aria-live="polite">
                    {kSaved ? "Saved." : ""}
                  </p>
                </div>
              </form>
            </section>
          )}

          {/* ---------------- Screen 2 ---------------- */}
          {screen === 2 && (
            <section className="stack" aria-labelledby="h-recipe">
              <div>
                <h2 id="h-recipe" className="h2" tabIndex={-1} ref={headingRef}>
                  Pick a dish
                </h2>
                <p className="sub">
                  Paste a recipe or choose a common home dish. Changes for your kitchen are marked in indigo, each
                  with a one line reason.
                </p>
              </div>
              <form
                className="card stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  void adapt();
                }}
                noValidate
              >
                <label className="field" htmlFor="r-dish">
                  <span className="label">Dish</span>
                  <input
                    id="r-dish"
                    type="text"
                    value={dish}
                    onChange={(e) => {
                      setDish(e.target.value);
                      if (adaptErr === "dish") setAdaptErr("");
                    }}
                    placeholder="Dish name, e.g. Tomato pappu"
                    required
                    maxLength={120}
                    aria-invalid={adaptErr === "dish"}
                    aria-describedby={adaptErr === "dish" ? "r-dish-err" : undefined}
                  />
                  {adaptErr === "dish" && (
                    <p id="r-dish-err" className="err">
                      Add a dish name first.
                    </p>
                  )}
                </label>
                <label className="field" htmlFor="r-recipe">
                  <span className="label">
                    Recipe <span className="hint">(optional)</span>
                  </span>
                  <textarea
                    id="r-recipe"
                    value={recipeText}
                    onChange={(e) => setRecipeText(e.target.value)}
                    placeholder="Paste the recipe you normally follow. Leave blank to use a standard home version."
                    maxLength={2000}
                  />
                </label>
                <div>
                  <p className="hint" id="examples-label" style={{ marginBottom: 8 }}>
                    Examples to try
                  </p>
                  <div className="chips" role="group" aria-labelledby="examples-label">
                    {EXAMPLES.map((ex) => {
                      const Icon = DISH_ICON[ex.dish] ?? IconBowl;
                      return (
                        <button key={ex.dish} type="button" className="chip" onClick={() => pickExample(ex)}>
                          <Icon size={16} />
                          {ex.dish}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="stack-sm">
                  <div className="btn-row">
                    <button className="btn primary" type="submit" disabled={adaptState === "loading"}>
                      Adapt for my kitchen
                    </button>
                    {adaptState === "loading" && (
                      <button type="button" className="btn ghost" onClick={() => adaptAbort.current?.abort()}>
                        Stop
                      </button>
                    )}
                  </div>
                  <div aria-live="polite" className="status">
                    {adaptState === "loading" && (
                      <p className="hint">Adapting for your kitchen... this can take up to a minute.</p>
                    )}
                    {adaptErr === "profile" && (
                      <div className="stack-sm">
                        <p className="err">Describe your kitchen first.</p>
                        <button type="button" className="btn ghost" onClick={() => go(1)}>
                          Describe my kitchen
                        </button>
                      </div>
                    )}
                    {adaptErr === "failed" && (
                      <div className="stack-sm">
                        <p className="err">{MSG_FAILED}</p>
                        <button type="button" className="btn ghost" onClick={() => void adapt()}>
                          Try again
                        </button>
                      </div>
                    )}
                    {adaptErr === "rate" && <p className="err">{MSG_RATE}</p>}
                  </div>
                </div>
              </form>

              {recipe && (
                <div className="stack" ref={resultRef} style={{ scrollMarginTop: 16 }}>
                  <div>
                    <h3 className="h2 recipe-title">{recipe.title}</h3>
                    <p className="tags">
                      <span className="tag">For {people(recipe.servings || profile?.servings || 2)}</span>
                      <span className="sr-only"> · </span>
                      <span className="tag tag-adapt">
                        {changedCount} of {recipe.steps.length} steps adapted
                      </span>
                    </p>
                  </div>
                  {recipe.checks.length > 0 && (
                    <div className="card checks">
                      <p className="checks-title">
                        <IconChecklist />
                        <b>Check before you start</b>
                      </p>
                      <ul>
                        {recipe.checks.map((c, i) => (
                          <li key={i}>
                            <b>{c.ingredient}:</b> {c.tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ol className="timeline" aria-label="Adapted steps">
                    {recipe.steps.map((s, i) => (
                      <li key={i} className={`tl-item${s.changed ? " adapted" : ""}`}>
                        <span className="tl-node" aria-hidden="true">
                          {i + 1}
                        </span>
                        <div className="card tl-card">
                          {s.changed && (
                            <p className="adapt-pill">
                              <IconSparkle size={14} />
                              Adapted for your kitchen
                            </p>
                          )}
                          <p>
                            <span className="sr-only">Step {i + 1}. </span>
                            {s.text}
                          </p>
                          {s.changed && s.reason && (
                            <p className="why-box">
                              <b className="why-label">Why</b>{" "}
                              {s.reason}
                            </p>
                          )}
                          {s.cue && <p className="cue">Look for: {s.cue}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                  {recipe.caveat && <p className="hint">Not sure about: {recipe.caveat}</p>}
                  <button type="button" className="btn primary full" onClick={startCooking}>
                    Start cooking
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ---------------- Screen 3 ---------------- */}
          {screen === 3 && (
            <section className="stack" aria-labelledby="h-cook">
              {!recipe || !current ? (
                <div className="stack">
                  <h2 id="h-cook" className="h2" tabIndex={-1} ref={headingRef}>
                    Cook
                  </h2>
                  <p>Adapt a recipe first, then it appears here one step at a time.</p>
                  <button type="button" className="btn primary" onClick={() => go(2)}>
                    Go to Recipe
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 id="h-cook" className="h2" tabIndex={-1} ref={headingRef}>
                      {recipe.title}
                    </h2>
                    <p className="sub">One step at a time. Stuck at any point? Use the box below.</p>
                  </div>
                  <div className="cook-zone">
                    <div className="dots" aria-hidden="true">
                      {recipe.steps.map((_, i) => (
                        <span key={i} className={i + 1 === step ? "dot now" : i + 1 < step ? "dot past" : "dot"} />
                      ))}
                    </div>
                    <div className={`card cook-card${current.changed ? " adapted" : ""}`} aria-live="polite">
                      <span className="watermark" aria-hidden="true">
                        {step}
                      </span>
                      <div className="cook-body" key={step}>
                        <div className="cook-top">
                          <span className="step-count">
                            Step {step} of {total}
                          </span>
                          {current.changed && (
                            <span className="adapt-pill" style={{ margin: 0 }}>
                              <IconSparkle size={14} />
                              Changed for you
                            </span>
                          )}
                        </div>
                        <p className="step-text">{current.text}</p>
                        {current.changed && current.reason && (
                          <p className="why-box">
                            <b className="why-label">Why</b>{" "}
                            {current.reason}
                          </p>
                        )}
                        {current.cue && (
                          <p className="cue-box">
                            <IconEye size={18} />
                            <span>Look for: {current.cue}</span>
                          </p>
                        )}
                      </div>
                      <div
                        className="progress"
                        role="progressbar"
                        aria-label="Cooking progress"
                        aria-valuemin={1}
                        aria-valuemax={total}
                        aria-valuenow={step}
                      >
                        <div style={{ width: `${(step / total) * 100}%` }} />
                      </div>
                    </div>
                    <div className="controls">
                      <button
                        type="button"
                        className="btn ghost icon-btn"
                        disabled={step <= 1}
                        onClick={() => gotoStep(step - 1)}
                      >
                        <IconArrowLeft />
                        <span className="sr-only">Previous</span>
                      </button>
                      {step < total ? (
                        <button type="button" className="btn primary" onClick={() => gotoStep(step + 1)}>
                          Next step
                          <IconArrowRight />
                        </button>
                      ) : (
                        <button type="button" className="btn primary" onClick={finishCooking}>
                          Finished cooking
                          <IconCheck />
                        </button>
                      )}
                    </div>
                  </div>

                  <form
                    className="card stuck-card stack-sm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void ask();
                    }}
                    noValidate
                    aria-labelledby="h-stuck"
                  >
                    <h3 id="h-stuck" className="stuck-title">
                      <IconLifebuoy size={22} />
                      I&apos;m stuck
                    </h3>
                    <p className="hint">Say what you see at this step. You get a specific fix, not a new recipe.</p>
                    <label htmlFor="s-text" className="sr-only">
                      What do you see?
                    </label>
                    <textarea
                      id="s-text"
                      value={stuckText}
                      onChange={(e) => {
                        setStuckText(e.target.value);
                        setAnsweredInput(false);
                      }}
                      placeholder={'What do you see? e.g. "The gravy looks watery and the oil is not separating."'}
                      maxLength={600}
                      style={{ minHeight: 96 }}
                    />
                    <label className="field" htmlFor="s-photo">
                      <span className="label">
                        Photo of the pan <span className="hint">(optional)</span>
                      </span>
                      <input
                        id="s-photo"
                        ref={fileRef}
                        className="photo-input"
                        type="file"
                        accept="image/*"
                        onChange={onPhoto}
                      />
                    </label>
                    {photoErr && <p className="err">{photoErr}</p>}
                    {photo && (
                      <div className="row">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="preview" src={photo} alt="Your photo of the pan" />
                        <button type="button" className="linkbtn" onClick={clearPhoto}>
                          Remove photo
                        </button>
                      </div>
                    )}
                    <div className="btn-row">
                      <button className="btn primary" type="submit" disabled={askState === "loading"}>
                        Ask
                      </button>
                      {askState === "loading" && (
                        <button type="button" className="btn ghost" onClick={() => askAbort.current?.abort()}>
                          Stop
                        </button>
                      )}
                    </div>
                    <div className="status" aria-live="polite">
                      {askState === "loading" ? (
                        <p className="hint">Thinking...</p>
                      ) : askErr ? (
                        <p className="err">{askErr}</p>
                      ) : askSecs != null && answer ? (
                        <p className="ok">Answered in {askSecs.toFixed(1)} s.</p>
                      ) : null}
                    </div>
                  </form>

                  <div aria-live="polite">
                    {answer && (
                      <div className="card answer-card stack-sm">
                        <div className="row" style={{ justifyContent: "space-between" }}>
                          <span className={`verdict v-${answer.verdict}`}>
                            {(() => {
                              const V = VERDICT_ICON[answer.verdict];
                              return <V size={14} />;
                            })()}
                            {VERDICT_LABEL[answer.verdict]}
                          </span>
                          <span className="hint">Answer for step {answer.step}</span>
                        </div>
                        <p className="answer-text">{answer.answer}</p>
                        {answer.next_cue && <p className="hint">Next, look for: {answer.next_cue}</p>}
                        {answer.ask && (
                          <p>
                            <b>One question: {answer.ask}</b>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {/* ---------------- Screen 4 ---------------- */}
          {screen === 4 && (
            <section className="stack" aria-labelledby="h-after">
              {submitted ? (
                <div className="card thanks">
                  <BigCheck />
                  <h2 id="h-after" className="h2" tabIndex={-1} ref={headingRef}>
                    Thank you.
                  </h2>
                  <p>Your answers help us decide what to build next.</p>
                  <div className="stack-sm thanks-actions">
                    <button type="button" className="btn primary full" onClick={cookAnother}>
                      Cook another dish
                    </button>
                    <button type="button" className="btn ghost full" onClick={() => go(1)}>
                      Change my kitchen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 id="h-after" className="h2" tabIndex={-1} ref={headingRef}>
                      After the cook
                    </h2>
                    <p className="sub">Two quick questions about how it went.</p>
                  </div>
                  <form className="card stack" onSubmit={submitAfter}>
                    <Segmented
                      legend="How did the dish turn out compared with how you usually make it?"
                      value={outcome}
                      onChange={setOutcome}
                      cols={2}
                      options={[
                        ["better", "Better", IconTrendUp],
                        ["same", "About the same", IconEquals],
                        ["worse", "Worse", IconTrendDown],
                        ["notyet", "Not cooked yet", IconClock],
                      ]}
                    />
                    <Segmented
                      legend="Would you pay a monthly fee for this help?"
                      value={pay}
                      onChange={setPay}
                      cols={3}
                      options={[
                        ["yes", "Yes", IconCheck],
                        ["maybe", "Maybe", IconMaybe],
                        ["no", "No", IconX],
                      ]}
                    />
                    {pay !== "no" && (
                      <fieldset className="plain">
                        <legend className="label">How much per month?</legend>
                        <div className="pair pair-fixed">
                          <label className="field" htmlFor="a-cur">
                            <span className="hint">Currency</span>
                            <select id="a-cur" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                              {["INR", "USD", "GBP", "CAD", "EUR", "Other"].map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                          </label>
                          <label className="field" htmlFor="a-amt">
                            <span className="hint">Amount</span>
                            <input
                              id="a-amt"
                              type="number"
                              inputMode="decimal"
                              min={0}
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="per month"
                            />
                          </label>
                        </div>
                      </fieldset>
                    )}
                    <label className="field" htmlFor="a-pays">
                      <span className="label">What do you pay for in cooking today?</span>
                      <input
                        id="a-pays"
                        type="text"
                        value={paysFor}
                        onChange={(e) => setPaysFor(e.target.value)}
                        placeholder="e.g. recipe subscription, cooking classes, nothing"
                        maxLength={300}
                      />
                    </label>
                    <label className="field" htmlFor="a-comment">
                      <span className="label">
                        Anything else you want to tell us? <span className="hint">(optional)</span>
                      </span>
                      <textarea
                        id="a-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={2000}
                      />
                    </label>
                    <button className="btn primary full" type="submit">
                      Submit
                    </button>
                  </form>
                </>
              )}
            </section>
          )}
        </main>
      </div>

      <footer className="footer">
        <span>Sous is a student project.</span>
        <div className="theme-toggle" role="group" aria-label="Theme">
          {(["light", "dark", "auto"] as const).map((t) => {
            const Icon = t === "light" ? IconSun : t === "dark" ? IconMoon : IconAuto;
            return (
              <button key={t} type="button" aria-pressed={theme === t} onClick={() => applyTheme(t)}>
                <Icon size={16} />
                {t === "light" ? "Light" : t === "dark" ? "Dark" : "Auto"}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div className="brand">
      <LogoMark />
      <div>
        <h1 className="logo-name">Sous</h1>
        <p className="tagline">Recipes that fit the kitchen you actually have.</p>
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  legend,
  value,
  onChange,
  options,
  cols,
}: {
  legend: string;
  value: T | null;
  onChange: (v: T | null) => void;
  options: [T, string, (p: { size?: number }) => React.ReactElement][];
  cols: 2 | 3;
}) {
  return (
    <fieldset className="seg plain">
      <legend>{legend}</legend>
      <div className={`tiles tiles-${cols}`}>
        {options.map(([v, label, Icon]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(value === v ? null : v)}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
