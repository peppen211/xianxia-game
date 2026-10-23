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
    if (errors.length) throw new Error("Browser runtime errors: " + errors.join(" | "));
    console.log("PASS: version label, no charge at full HP, and one valid healing purchase.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
