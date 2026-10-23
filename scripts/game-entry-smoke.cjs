const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const htmlPath = path.resolve(__dirname, "..", "index.html");
const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(fs.readFileSync(htmlPath));
    return;
  }
  res.writeHead(404);
  res.end("Not found");
});

const makeSave = (hp, stones) => ({
  created: true,
  name: "測試道友",
  root: "四屬性偽靈根",
  level: 0,
  xp: 0,
  stones,
  hp,
  maxHp: 100,
  herbs: 0,
  materials: 0,
  questExplore: 0,
  questWins: 0,
  questExploreClaimed: false,
  questFightClaimed: false,
  cultivating: false,
  last: Date.now(),
  log: "測試存檔"
});

async function main() {
  await new Promise(resolve => server.listen(4173, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    const fullHpPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    fullHpPage.on("pageerror", error => errors.push(error.message));
    await fullHpPage.addInitScript(save => localStorage.setItem("mortalCultivationSaveV2", JSON.stringify(save)), makeSave(100, 10));
    await fullHpPage.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
    await fullHpPage.addStyleTag({ content: "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }" });
    const touchStyles = await fullHpPage.evaluate(() => ({
      buttonTouchAction: getComputedStyle(document.querySelector("#start")).touchAction,
      buttonUserSelect: getComputedStyle(document.querySelector("#start")).userSelect,
      bodyTextUserSelect: getComputedStyle(document.querySelector("#intro")).userSelect,
      inputUserSelect: (() => { const input = document.createElement("input"); document.body.append(input); const value = getComputedStyle(input).userSelect; input.remove(); return value; })()
    }));
    if (touchStyles.buttonTouchAction !== "manipulation" || touchStyles.buttonUserSelect !== "none" || touchStyles.bodyTextUserSelect !== "none" || touchStyles.inputUserSelect !== "text") {
      throw new Error("Touch interaction styles are missing or overridden: " + JSON.stringify(touchStyles));
    }
    if (!(await fullHpPage.locator("footer").innerText()).includes("開發測試 0.1")) {
      throw new Error("The game entry does not display development test version 0.1.");
    }
    await fullHpPage.locator("#start").click();
    await fullHpPage.locator('button[data-tab="shop"]').click();
    await fullHpPage.locator("#buyHeal").click();
    const fullHpStones = await fullHpPage.locator("#shopStones").innerText();
    const fullHpSaved = JSON.parse(await fullHpPage.evaluate(() => localStorage.getItem("mortalCultivationSaveV2")));
    if (fullHpStones.trim() !== "10" || fullHpSaved.stones !== 10) {
      throw new Error("Buying healing medicine at full HP incorrectly consumed stones.");
    }
    if (!(await fullHpPage.locator("#toast").innerText()).includes("無需購買")) {
      throw new Error("Full-HP purchase prevention did not explain why the purchase was blocked.");
    }

    const injuredPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    injuredPage.on("pageerror", error => errors.push(error.message));
    await injuredPage.addInitScript(save => localStorage.setItem("mortalCultivationSaveV2", JSON.stringify(save)), makeSave(50, 10));
    await injuredPage.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
    await injuredPage.addStyleTag({ content: "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }" });
    await injuredPage.locator("#start").click();
    await injuredPage.locator('button[data-tab="shop"]').click();
    await injuredPage.locator("#buyHeal").click();
    const healedStones = await injuredPage.locator("#shopStones").innerText();
    const healedHp = await injuredPage.locator("#hp").innerText();
    const healedSave = JSON.parse(await injuredPage.evaluate(() => localStorage.getItem("mortalCultivationSaveV2")));
    if (healedStones.trim() !== "5" || healedHp.trim() !== "90/100" || healedSave.stones !== 5 || healedSave.hp !== 90) {
      throw new Error("Healing purchase did not charge exactly 5 stones and restore 40 HP.");
    }
    const offlinePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    offlinePage.on("pageerror", error => errors.push(error.message));
    const twelveHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const offlineSave = { ...makeSave(100, 0), xp: 0, cultivating: true, last: twelveHoursAgo };
    await offlinePage.addInitScript(save => localStorage.setItem("mortalCultivationSaveV2", JSON.stringify(save)), offlineSave);
    await offlinePage.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
    await offlinePage.addStyleTag({ content: "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }" });
    await offlinePage.locator("#start").click();
    const offlineResult = JSON.parse(await offlinePage.evaluate(() => localStorage.getItem("mortalCultivationSaveV2")));
    if (Math.abs(offlineResult.xp - 93.6) > 0.01 || offlineResult.cultivating !== false) {
      throw new Error("Offline cultivation should cap at 12 hours and stop automatically after reload; got xp=" + offlineResult.xp + ", cultivating=" + offlineResult.cultivating);
    }

    const questPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    questPage.on("pageerror", error => errors.push(error.message));
    const questSave = { ...makeSave(100, 0), questExplore: 3, questExploreClaimed: false };
    await questPage.addInitScript(save => localStorage.setItem("mortalCultivationSaveV2", JSON.stringify(save)), questSave);
    await questPage.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
    await questPage.addStyleTag({ content: "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }" });
    await questPage.locator("#start").click();
    await questPage.locator('button[data-tab="explore"]').click();
    await questPage.locator("#claimExplore").click();
    const questAfterClaim = JSON.parse(await questPage.evaluate(() => localStorage.getItem("mortalCultivationSaveV2")));
    if (questAfterClaim.stones !== 8 || questAfterClaim.questExploreClaimed !== true) {
      throw new Error("Explore quest claim should award exactly 8 stones and mark the quest claimed.");
    }
    await questPage.locator("#claimExplore").click({ force: true });
    const questAfterRepeat = JSON.parse(await questPage.evaluate(() => localStorage.getItem("mortalCultivationSaveV2")));
    if (questAfterRepeat.stones !== 8) throw new Error("Explore quest reward was granted more than once.");

    if (errors.length) throw new Error("Browser runtime errors: " + errors.join(" | "));
    console.log("PASS: version label, no charge at full HP, valid healing purchase, 12-hour offline cap, and one-time quest reward.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
