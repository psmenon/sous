// Takes the brief screenshots at 390px, light theme, Toronto kitchen + Tomato pappu.
// Needs Google Chrome and a running app:  BASE_URL=http://localhost:3000 npm run screenshots
// No extra packages: drives Chrome over the DevTools protocol with Node's built-in WebSocket.
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === "darwin"
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : "google-chrome");
const OUT = path.join(process.cwd(), "screenshots");
const PORT = 9333;
const WIDTH = 390;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), "sous-shots-"))}`,
    "--no-first-run",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

const ws = new WebSocket(await target());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + expression.slice(0, 80));
  return r.result.value;
};
const waitFor = async (selector, ms = 120000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)) return;
    await sleep(250);
  }
  throw new Error("Timed out waiting for " + selector);
};
const click = (text) =>
  evaluate(`[...document.querySelectorAll("button")].find(b => b.textContent.trim().endsWith(${JSON.stringify(text)})).click()`);
const typeInto = (selector, value) =>
  evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);

const metrics = (height) =>
  send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height, deviceScaleFactor: 2, mobile: true });

async function shot(name) {
  await evaluate("document.activeElement && document.activeElement.blur()");
  await sleep(300);
  const h = await evaluate("Math.ceil(document.documentElement.scrollHeight)");
  await metrics(h);
  await sleep(300);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(path.join(OUT, name), Buffer.from(data, "base64"));
  await metrics(844);
  console.log("saved", name);
}

try {
  mkdirSync(OUT, { recursive: true });
  await send("Page.enable");
  await send("Runtime.enable");
  await metrics(844);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

  await send("Page.navigate", { url: BASE });
  await sleep(1500);
  await evaluate("localStorage.clear()");
  await send("Page.reload");
  await sleep(1500);
  await waitFor("#k-place");
  await evaluate("document.fonts.ready.then(() => true)");

  // 1. Kitchen, filled in
  await click("Use an example kitchen");
  await shot("1-kitchen-profile.png");

  // 2. Adapted recipe
  await click("Save my kitchen");
  await waitFor("#r-dish");
  await click("Tomato pappu");
  await click("Adapt for my kitchen");
  await waitFor(".tl-item");
  await shot("2-adapted-recipe-with-reasons.png");

  // 3. Step view on the first changed step
  await click("Start cooking");
  await waitFor(".cook-card");
  for (let i = 0; i < 10 && !(await evaluate(`!!document.querySelector(".cook-card.adapted")`)); i++) {
    await click("Next step");
    await sleep(150);
  }
  await shot("3-step-view.png");

  // 4. Ask while cooking
  await typeInto("#s-text", "The gravy looks watery and the oil is not separating");
  await click("Ask");
  await waitFor(".answer-text");
  await shot("4-ask-while-cooking.png");

  // 5. After the cook, filled in
  while (await evaluate(`[...document.querySelectorAll("button")].some(b => b.textContent.trim() === "Next step")`)) {
    await click("Next step");
    await sleep(100);
  }
  await click("Finished cooking");
  await waitFor("#a-pays");
  await click("Better");
  await click("Yes");
  await sleep(100);
  await typeInto("#a-amt", "250");
  await typeInto("#a-pays", "recipe videos");
  await shot("5-after-the-cook.png");

  // 6. Dark theme step view on a changed step
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await click("Cook");
  await waitFor(".cook-card");
  for (let i = 0; i < 10 && !(await evaluate(`!!document.querySelector(".cook-card.adapted")`)); i++) {
    await evaluate(`document.querySelector(".controls .icon-btn").click()`);
    await sleep(150);
  }
  await shot("6-dark-theme-step-view.png");
} finally {
  ws.close();
  chrome.kill();
}
