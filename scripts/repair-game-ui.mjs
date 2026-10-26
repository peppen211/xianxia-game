import fs from "node:fs";

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

const repairStyle = `<style id="v619-mobile-card-layout-fix">
/* Keep long pet descriptions from overflowing into the next grid row on mobile. */
#gameApp #bag .bag-treasure-grid {
  flex: 0 0 auto !important;
  height: auto !important;
  grid-auto-rows: max-content !important;
  align-content: start !important;
}
#gameApp #bag .bag-treasure-card {
  height: auto !important;
  min-height: max-content !important;
  align-self: stretch !important;
}
#gameApp #bag .bag-pet-card .bag-treasure-description {
  min-height: 0 !important;
  overflow-wrap: anywhere !important;
}
#gameApp #bag .bag-pet-card .bag-pet-odds,
#gameApp #bag .bag-pet-card .bag-source-tag {
  display: block !important;
  flex: 0 0 auto !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  line-height: 1.45 !important;
}
</style>`;

if (!html.includes('id="v619-mobile-card-layout-fix"')) {
  if (!html.includes("</head>")) throw new Error("Cannot find </head> for the mobile layout repair.");
  html = html.replace("</head>", repairStyle + "\n</head>");
}

const oldEquip = `const equipRows=['法器','法寶','符寶','仿製靈寶'].map(function(name){return '<div class="rowitem"><div class="rowicon">器</div><div class="rowbody"><b>'+name+'</b><small>此處記錄器物的原作／物品類型；只有能放入裝備欄或使用欄的物品才歸入裝備類。獨立法寶類則管理遊戲內可啟用、會在戰鬥觸發效果的法寶，兩者用途不同。</small></div></div>';}).join('');`;
const newEquip = `const equipRows=[
  {name:'法器',desc:'低階修士常用的法力器具；具體用途、品階與使用限制依各物件的原作條目分別記錄。'},
  {name:'法寶',desc:'修士以法力操控、祭煉的器物；遊戲內法寶欄的自動觸發規則屬系統玩法，不代表每件原作法寶皆如此。'},
  {name:'符寶',desc:'以符籙封存器物威能、供修士使用的物件；效果與使用限制須依具體原作條目核對。'},
  {name:'仿製靈寶',desc:'仿照高階靈寶特性煉製的器物類別；實際威能、來源與限制需按個別原作條目核對。'}
].map(function(item){return '<div class="rowitem"><div class="rowicon">器</div><div class="rowbody"><b>'+item.name+'</b><small>'+item.desc+'</small></div></div>';}).join('');`;

if (html.includes(oldEquip)) {
  html = html.replace(oldEquip, newEquip);
} else if (!html.includes("仿照高階靈寶特性煉製的器物類別")) {
  throw new Error("Catalog repair target was not found; refusing to silently skip the data fix.");
}

const bagBalanceStyle = `<style id="v632-bag-layout-balance">
/* v6.32: reserve a compact but readable equipment-slot row and give the item grid most of the mobile viewport. */
#gameApp.app>main>.screen#bag.active>.bag-equipment-view .bag-gear-layout{
  grid-template-rows:minmax(88px,0.55fr) minmax(0,1fr)!important;
}
#gameApp #bag .bag-slots-panel{padding:4px 6px!important;overflow:visible!important}
#gameApp #bag .bag-slots-panel .secthead{min-height:20px!important}
#gameApp #bag .bag-slots-panel .slotgrid{margin-top:3px!important;gap:3px!important}
#gameApp #bag .bag-slots-panel .slot{padding:3px 2px!important}
#gameApp #bag .bag-slots-panel .slot span{font-size:14px!important}
#gameApp #bag .bag-slots-panel .slot small{font-size:9px!important;line-height:1.15!important}
#gameApp #bag .bag-slots-panel .slot b{font-size:9px!important;line-height:1.2!important}
#gameApp #bag .bag-slots-panel .gear-unequip{margin-top:2px!important;padding:2px 3px!important;font-size:9px!important}
</style>`;
if (!html.includes('id="v632-bag-layout-balance"')) {
  if (!html.includes("</body>")) throw new Error("Cannot find </body> for the mobile bag layout fix.");
  html = html.replace("</body>", bagBalanceStyle + "\n</body>");
}

const versionLabelPattern = /class="status-version" aria-label="遊戲版本">v6\.\d+<\/small>/g;
const versionLabels = html.match(versionLabelPattern) || [];
if (versionLabels.length !== 1) {
  throw new Error(`Expected exactly one game version label, found ${versionLabels.length}.`);
}
html = html.replace(
  /(class="status-version" aria-label="遊戲版本">)v6\.\d+(<\/small>)/,
  "$1v6.32$2"
);

fs.writeFileSync(file, html, "utf8");
console.log("v6.32 mobile bag layout balance + save-safety regression applied.");