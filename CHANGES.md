# Change list: differences from the briefs

## Redesign follow-up (A, B, C)

1. **The Screen 2 subtitle now says "marked in indigo" instead of "marked in saffron".** The brief said to keep copy unchanged, but saffron is gone from the design, so the old sentence would be false.
2. **The Cook screen pill still reads "Changed for you"**, styled in indigo with a sparkle icon. The brief renamed only the Screen 2 label (to "Adapted for your kitchen"), so the Screen 3 text was kept.
3. **New label text named by the brief:** "Where and how", "What you have", "Adapted for your kitchen", the "Why" box label, "For 2 people" and "N of M steps adapted". The Previous button shows an arrow, with "Previous" kept as screen-reader text.
4. **Added two tokens:** `--adapt-ink` (text on a solid indigo node: white in light, `#1B1A40` in dark) and `--hero-cream` (cream detail in the pot drawing). The brief's palette had no colour for text on solid indigo.
5. **Desktop stepper "completed" circles use ink with a check, not terracotta.** Only the current step is filled terracotta, so terracotta keeps meaning "where you are / action".
6. **The Cook controls bar is sticky inside the step area,** as before. It sits directly above the bottom nav while the step card is on screen, then scrolls away with it as you move down to the stuck box. It never covers content.
7. **The mock is kept out of production in two places:**
   - The shareable design preview is built by `npm run preview:build` from `src/preview/mock.ts`, which the app never imports.
   - The local test answers (`SOUS_FAKE_AI`) are swapped in at build time through a webpack alias. A clean production build was checked and contains none of the test strings.
8. **`/api/health` returns `ok` plus three yes/no flags** (key set, database set, admin set) so you can confirm a deployment. It never returns values.
9. **Contrast:** every text/background pair in both themes passes WCAG AA as given (lowest 4.88 to 1, terracotta on surface-2 in light). No palette value needed changing.

## Original MVP1 build (still applies)

10. **A JSON-file store is used locally when `DATABASE_URL` is empty.** Production on Vercel needs Neon.
11. **One `sessions` table with a `jsonb` column** holds the stuck events, which the brief allows.
12. **Refusal fallback:** Sonnet 5.5 calls include Anthropic's server-side `fallbacks: "default"`, so a declined request is retried on a fallback model instead of failing.
13. **"Cook another dish" starts a new `session_id`,** so each dish is one admin row. The kitchen profile is copied to the new row.
14. **A "Remove photo" link** sits next to the photo preview.
15. **Rate limiting is in memory per server instance,** so IPs are never written anywhere.
16. **The "No profile" error exists,** but Recipe stays disabled until a kitchen is saved, so cooks will rarely see it.
17. **`/admin` sign-in is rate limited** (20 tries per hour).
